import { getStore } from '@netlify/blobs';
import crypto from 'crypto';
import { decrypt } from './_shared/encryption';
import { createAdminSession } from './_shared/adminAuth';
import { checkRateLimit, rateLimitedResponse } from './_shared/rateLimit';

// Same encryption approach as admin_passcode.ts / leaderboard.ts.
const BLOB_KEY = 'admin_passcode';
const DEFAULT_ADMIN_PASSCODE = 'ADMIN2026';

// Constant-time-ish comparison to avoid leaking passcode length/content via
// response timing. crypto.timingSafeEqual requires equal-length buffers,
// so unequal lengths are rejected immediately (length isn't secret here
// anyway -- what matters is not leaking *content* character-by-character).
function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Verifies a candidate passcode against the stored admin passcode WITHOUT
// ever sending the real passcode value back to the client, and -- if
// correct -- issues a real server-side session token. That token, not any
// client-side flag, is what every admin-only write endpoint checks. A
// client can set whatever it wants in its own sessionStorage; without a
// valid token from here, the server rejects every admin write regardless
// of what the UI shows.
export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // 10 attempts per 15 minutes per IP -- guards against passcode brute-forcing.
  const allowed = await checkRateLimit(event, 'verify_admin', 10, 15 * 60 * 1000);
  if (!allowed) return rateLimitedResponse();

  try {
    const body = JSON.parse(event.body || '{}');
    const candidate = typeof body.passcode === 'string' ? body.passcode.trim() : '';

    const store = getStore({
      name: 'cissp-vault',
      siteID: process.env.SITE_ID,
      token: process.env.BLOBS_TOKEN,
    });

    const raw = await store.get(BLOB_KEY);
    const actualPasscode = raw ? decrypt(raw) : DEFAULT_ADMIN_PASSCODE;

    const isAdmin = candidate.length > 0 && timingSafeEqual(candidate, actualPasscode);
    const token = isAdmin ? await createAdminSession() : null;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAdmin, token }),
    };
  } catch (err) {
    console.error('verify_admin error:', err);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAdmin: false, token: null }),
    };
  }
};
