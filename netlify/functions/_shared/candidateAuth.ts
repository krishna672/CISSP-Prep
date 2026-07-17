import { getStore } from '@netlify/blobs';
import crypto from 'crypto';

// Real server-side candidate sessions, mirroring the admin session pattern.
// A candidate token is only ever issued after a code has actually been
// validated (and, on first use, redeemed) server-side in
// redeem_invite_code.ts. It's what content/leaderboard endpoints check to
// confirm a request is actually coming from someone who logged in with a
// real invite code, not just someone who set a client-side flag.

const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours -- generous enough to cover a full study/exam session
const SESSIONS_KEY = 'candidate_sessions';

interface CandidateSession {
  token: string;
  code: string;
  candidateName: string;
  expiresAt: number;
}

function getBlobStore() {
  return getStore({
    name: 'cissp-vault',
    siteID: process.env.SITE_ID,
    token: process.env.BLOBS_TOKEN,
  });
}

async function readSessions(): Promise<CandidateSession[]> {
  const store = getBlobStore();
  const raw = await store.get(SESSIONS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeSessions(sessions: CandidateSession[]): Promise<void> {
  const store = getBlobStore();
  await store.set(SESSIONS_KEY, JSON.stringify(sessions));
}

export async function createCandidateSession(code: string, candidateName: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const sessions = (await readSessions()).filter(s => s.expiresAt > now); // prune expired
  sessions.push({ token, code, candidateName, expiresAt: now + SESSION_TTL_MS });
  await writeSessions(sessions);
  return token;
}

export async function getCandidateSession(token: string | null | undefined): Promise<{ code: string; candidateName: string } | null> {
  if (!token) return null;
  const sessions = await readSessions();
  const now = Date.now();
  const match = sessions.find(s => s.token === token && s.expiresAt > now);
  return match ? { code: match.code, candidateName: match.candidateName } : null;
}

export async function revokeCandidateSession(token: string | null | undefined): Promise<void> {
  if (!token) return;
  const sessions = await readSessions();
  await writeSessions(sessions.filter(s => s.token !== token));
}

export function extractCandidateToken(event: any): string | null {
  const header = event.headers?.['x-candidate-session'] || event.headers?.['X-Candidate-Session'];
  return typeof header === 'string' ? header : null;
}
