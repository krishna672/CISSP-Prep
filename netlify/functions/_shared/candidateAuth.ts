import { getStore } from '@netlify/blobs';
import crypto from 'crypto';
import { decrypt as decryptInviteCodes } from './encryption';

// Real server-side candidate sessions, mirroring the admin session pattern.
// A candidate token is only ever issued after a code has actually been
// validated (and, on first use, redeemed) server-side in
// redeem_invite_code.ts. It's what content/leaderboard endpoints check to
// confirm a request is actually coming from someone who logged in with a
// real invite code, not just someone who set a client-side flag.

const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours -- generous enough to cover a full study/exam session
const SESSIONS_KEY = 'candidate_sessions';
const INVITE_CODES_KEY = 'invite_codes';

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

// Checks whether a code is still present in the live invite code registry.
// Used so that revoking a code takes effect immediately for any session
// already issued from it, rather than only being enforced at the next
// login (a session's validity used to be checked purely against the
// sessions store, with no link back to whether the underlying code still
// exists -- so a revoked candidate could keep working for up to the full
// session TTL).
async function codeStillExistsInRegistry(code: string): Promise<boolean> {
  try {
    const store = getBlobStore();
    const raw = await store.get(INVITE_CODES_KEY);
    if (!raw) return false;
    const codes = JSON.parse(decryptInviteCodes(raw));
    if (!Array.isArray(codes)) return false;
    return codes.some((c: any) => c.code?.toUpperCase() === code.toUpperCase());
  } catch {
    // If the registry can't be read, fail closed -- don't grant continued
    // access based on an unverifiable state.
    return false;
  }
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
  if (!match) return null;

  const stillValid = await codeStillExistsInRegistry(match.code);
  if (!stillValid) {
    // The underlying code was revoked/deleted -- kill the session too so
    // this doesn't keep working for the rest of its TTL.
    await writeSessions(sessions.filter(s => s.token !== token));
    return null;
  }

  return { code: match.code, candidateName: match.candidateName };
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
