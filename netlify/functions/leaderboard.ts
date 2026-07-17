import { getStore } from '@netlify/blobs';
import { encrypt, decrypt } from './_shared/encryption';
import { requireAdmin } from './_shared/adminAuth';
import { requireAuthenticated, getAuthContext } from './_shared/authContext';
import { checkRateLimit, rateLimitedResponse } from './_shared/rateLimit';

// Same encryption approach as the original server.ts, so data at rest
// stays encrypted even though it now lives in Netlify Blobs instead of
// a local file.
const BLOB_KEY = 'leaderboard';

export const handler = async (event: any) => {
  const store = getStore({
    name: 'cissp-vault',
    siteID: process.env.SITE_ID,
    token: process.env.BLOBS_TOKEN,
  });

  // GET: visible to any authenticated candidate or admin -- not the open
  // internet. Requires either session type.
  if (event.httpMethod === 'GET') {
    const authError = await requireAuthenticated(event);
    if (authError) return authError;
    try {
      const raw = await store.get(BLOB_KEY);
      const data = raw ? decrypt(raw) : '[]';
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: data,
      };
    } catch (err) {
      console.error('Blobs GET error (leaderboard):', err);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: '[]',
      };
    }
  }

  // POST: a candidate submitting their own single result. Requires a valid
  // session (candidate or admin) -- and the entry's code/name are always
  // overwritten with whatever the session actually is, never trusted from
  // the request body, so nobody can submit a score under someone else's
  // name/code.
  if (event.httpMethod === 'POST') {
    const ctx = await getAuthContext(event);
    if (!ctx) {
      return { statusCode: 401, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Unauthorized: valid session required.' }) };
    }

    // 15 submissions per 15 minutes per IP -- generous for legitimate use
    // (a handful of quiz/exam attempts) while blocking bulk spam.
    const allowed = await checkRateLimit(event, 'leaderboard_submit', 15, 15 * 60 * 1000);
    if (!allowed) return rateLimitedResponse();

    try {
      const newEntry = JSON.parse(event.body || '{}');
      if (!newEntry || typeof newEntry.id !== 'string' || newEntry.id.startsWith('mock-')) {
        return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Invalid entry' }) };
      }

      // Identity is server-authoritative, not client-supplied.
      if (ctx.isAdmin) {
        newEntry.code = newEntry.code === 'ADMIN' ? 'ADMIN' : (newEntry.code || 'ADMIN');
        newEntry.name = newEntry.name || 'System Administrator';
      } else {
        newEntry.code = ctx.candidateCode;
        newEntry.name = ctx.candidateName;
      }

      // Sanity-check the result content. Grading itself still happens in
      // the browser (there's no server-side answer key check here), so
      // this can't stop someone from fabricating a result entirely -- but
      // it does reject obviously-invalid payloads and makes "passed"
      // server-computed from score/type rather than trusted verbatim, so
      // it can't be set independently of the score.
      if (newEntry.type !== 'CAT Exam' && newEntry.type !== 'Practice Quiz') {
        return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Invalid entry type' }) };
      }

      const score = Number(newEntry.score);
      const questionsCount = Number(newEntry.questionsCount);
      const scoreMin = newEntry.type === 'CAT Exam' ? 100 : 0;
      const scoreMax = newEntry.type === 'CAT Exam' ? 1000 : 100;
      const passingScore = newEntry.type === 'CAT Exam' ? 700 : 70;

      if (!Number.isFinite(score) || score < scoreMin || score > scoreMax) {
        return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Score out of range for entry type' }) };
      }
      if (!Number.isInteger(questionsCount) || questionsCount < 1 || questionsCount > 500) {
        return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Invalid question count' }) };
      }

      newEntry.score = score;
      newEntry.questionsCount = questionsCount;
      newEntry.passed = score >= passingScore; // recomputed, never trusted from the client
      newEntry.timestamp = new Date().toISOString(); // server clock, not client-supplied

      const raw = await store.get(BLOB_KEY);
      const existing = raw ? JSON.parse(decrypt(raw)) : [];
      const entries = Array.isArray(existing) ? existing : [];
      const updated = [newEntry, ...entries.filter((e: any) => e.id !== newEntry.id)];

      await store.set(BLOB_KEY, encrypt(JSON.stringify(updated)));
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      };
    } catch (err) {
      console.error('Blobs POST error (leaderboard):', err);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Failed to submit leaderboard entry' }),
      };
    }
  }

  // PUT: bulk overwrite -- used by the Admin Panel to delete individual
  // entries or clear the board entirely. Admin session required.
  if (event.httpMethod === 'PUT') {
    const authError = await requireAdmin(event);
    if (authError) return authError;
    try {
      const bodyStr = event.body || '[]';
      JSON.parse(bodyStr); // validate before persisting
      await store.set(BLOB_KEY, encrypt(bodyStr));
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr,
      };
    } catch (err) {
      console.error('Blobs PUT error (leaderboard):', err);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Failed to save leaderboard' }),
      };
    }
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};
