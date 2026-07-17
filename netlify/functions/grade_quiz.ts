import { getStore } from '@netlify/blobs';
import crypto from 'crypto';
import { encrypt, decrypt } from './_shared/encryption';
import { getAuthContext } from './_shared/authContext';
import { checkRateLimit, rateLimitedResponse } from './_shared/rateLimit';
import { getQuestionById } from './_shared/questionBank';

const LEADERBOARD_KEY = 'leaderboard';

const DIFFICULTY_WEIGHTS: Record<string, number> = { Basic: 25, Moderate: 45, Hard: 75 };
const DEFAULT_STEP = 40;
const CAT_PASSING_SCORE = 700;
const QUIZ_PASSING_SCORE = 70;

// Grades a quiz/exam attempt server-side instead of trusting a
// client-computed score. The client submits its raw answers (which
// question, which option was picked) rather than a final score -- the
// server independently determines correctness and passing status.
//
// Honesty about a real limitation: this can only fully verify answers
// against questions the server actually knows about (the static bank and
// admin-added custom questions). Questions generated on the fly by the
// Gemini "AI Studio" engine are never persisted anywhere the server can
// see them, so for those specific items this falls back to trusting the
// client's own report of the correct answer for *that one question* --
// still a meaningfully smaller trust surface than accepting an aggregate
// final score outright, but not a complete guarantee for AI-engine
// sessions the way it is for the offline/static question bank.
export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const ctx = await getAuthContext(event);
  if (!ctx) {
    return { statusCode: 401, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Unauthorized: valid session required.' }) };
  }

  const allowed = await checkRateLimit(event, 'grade_quiz', 15, 15 * 60 * 1000);
  if (!allowed) return rateLimitedResponse();

  try {
    const body = JSON.parse(event.body || '{}');
    const type = body.type === 'CAT Exam' ? 'CAT Exam' : body.type === 'Practice Quiz' ? 'Practice Quiz' : null;
    const answers = Array.isArray(body.answers) ? body.answers : [];

    if (!type || answers.length === 0 || answers.length > 500) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Invalid submission' }) };
    }

    // Resolve each answer against the authoritative question bank where
    // possible; fall back to the client's own claim only for questions the
    // server has never seen (AI-generated, ephemeral).
    const resolved: { isCorrect: boolean; difficulty: string; verified: boolean }[] = [];

    for (const a of answers) {
      const questionId = typeof a?.questionId === 'string' ? a.questionId : null;
      const selectedOption = typeof a?.selectedOption === 'string' ? a.selectedOption : null;
      if (!questionId || !selectedOption) {
        return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Malformed answer entry' }) };
      }

      const known = await getQuestionById(questionId);
      if (known) {
        resolved.push({
          isCorrect: selectedOption === known.correctOption,
          difficulty: known.difficulty || 'Moderate',
          verified: true,
        });
      } else {
        // Unverifiable (AI-generated) question -- fall back to the
        // client's own claim for just this one item.
        const claimedCorrect = typeof a?.correctOption === 'string' ? a.correctOption : null;
        const claimedDifficulty = typeof a?.difficulty === 'string' ? a.difficulty : 'Moderate';
        resolved.push({
          isCorrect: claimedCorrect !== null && selectedOption === claimedCorrect,
          difficulty: claimedDifficulty,
          verified: false,
        });
      }
    }

    let score: number;
    let passed: boolean;

    if (type === 'Practice Quiz') {
      const correctCount = resolved.filter(r => r.isCorrect).length;
      score = Math.round((correctCount / resolved.length) * 100);
      passed = score >= QUIZ_PASSING_SCORE;
    } else {
      // Replay the same adaptive ability-estimate formula the client uses,
      // but driven by server-verified correctness/difficulty wherever
      // possible.
      let ability = 500;
      for (const r of resolved) {
        const step = DIFFICULTY_WEIGHTS[r.difficulty] || DEFAULT_STEP;
        const change = r.isCorrect ? step : -step * 0.6;
        ability = Math.max(100, Math.min(1000, ability + change));
      }
      score = Math.round(ability);
      passed = score >= CAT_PASSING_SCORE;
    }

    const newEntry = {
      id: `${type === 'CAT Exam' ? 'cat' : 'quiz'}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      code: ctx.isAdmin ? 'ADMIN' : ctx.candidateCode,
      name: ctx.isAdmin ? 'System Administrator' : ctx.candidateName,
      score,
      type,
      questionsCount: resolved.length,
      timestamp: new Date().toISOString(),
      passed,
    };

    const store = getStore({
      name: 'cissp-vault',
      siteID: process.env.SITE_ID,
      token: process.env.BLOBS_TOKEN,
    });
    const raw = await store.get(LEADERBOARD_KEY);
    const existing = raw ? JSON.parse(decrypt(raw)) : [];
    const entries = Array.isArray(existing) ? existing : [];
    const updated = [newEntry, ...entries.filter((e: any) => e.id !== newEntry.id)];
    await store.set(LEADERBOARD_KEY, encrypt(JSON.stringify(updated)));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, score, passed, entry: newEntry }),
    };
  } catch (err) {
    console.error('grade_quiz error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to grade submission' }),
    };
  }
};
