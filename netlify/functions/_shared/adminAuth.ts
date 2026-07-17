import { getStore } from '@netlify/blobs';
import crypto from 'crypto';

// Real server-side admin sessions. A session token is only ever issued by
// verify_admin.ts after the passcode has been checked server-side, and
// every admin-only write endpoint must validate the token here before
// doing anything. Client-side "isAdmin" state is cosmetic (it just
// controls what the UI shows) -- this is the actual enforcement.

const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
const SESSIONS_KEY = 'admin_sessions';

interface AdminSession {
  token: string;
  expiresAt: number;
}

function getBlobStore() {
  return getStore({
    name: 'cissp-vault',
    siteID: process.env.SITE_ID,
    token: process.env.BLOBS_TOKEN,
  });
}

async function readSessions(): Promise<AdminSession[]> {
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

async function writeSessions(sessions: AdminSession[]): Promise<void> {
  const store = getBlobStore();
  await store.set(SESSIONS_KEY, JSON.stringify(sessions));
}

// Issues a brand-new session token after a successful passcode check.
export async function createAdminSession(): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const sessions = (await readSessions()).filter(s => s.expiresAt > now); // prune expired
  sessions.push({ token, expiresAt: now + SESSION_TTL_MS });
  await writeSessions(sessions);
  return token;
}

// Validates a bearer token against the server-side session store.
export async function isValidAdminSession(token: string | null | undefined): Promise<boolean> {
  if (!token) return false;
  const sessions = await readSessions();
  const now = Date.now();
  return sessions.some(s => s.token === token && s.expiresAt > now);
}

// Invalidates a single session token (used on logout).
export async function revokeAdminSession(token: string | null | undefined): Promise<void> {
  if (!token) return;
  const sessions = await readSessions();
  await writeSessions(sessions.filter(s => s.token !== token));
}

// Pulls the bearer token out of a Netlify Function's event object.
export function extractAdminToken(event: any): string | null {
  const header = event.headers?.authorization || event.headers?.Authorization;
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1] : null;
}

// Convenience helper: returns a 401 response object if the request isn't
// carrying a valid admin session, or null if it's authorized to proceed.
export async function requireAdmin(event: any): Promise<{ statusCode: number; body: string } | null> {
  const token = extractAdminToken(event);
  const valid = await isValidAdminSession(token);
  if (!valid) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized: valid admin session required.' }),
    };
  }
  return null;
}
