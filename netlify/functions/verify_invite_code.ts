import { getStore } from '@netlify/blobs';
import crypto from 'crypto';
import { decrypt } from './_shared/encryption';
import { checkRateLimit, rateLimitedResponse } from './_shared/rateLimit';

const BLOB_KEY = 'invite_codes';

// Checks a single invite code against the registry WITHOUT ever returning
// the full list -- so an anonymous visitor typing a code can't see every
// other candidate's code/name along the way (which is what happened when
// the client fetched the entire /api/invite_codes list just to validate
// one entry).
export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // 60 checks per 15 minutes per IP -- generous enough for the app's own
  // periodic revocation poll (every 30s) plus normal login attempts, but
  // throttles bulk code enumeration.
  const allowed = await checkRateLimit(event, 'verify_invite_code', 60, 15 * 60 * 1000);
  if (!allowed) return rateLimitedResponse();

  try {
    const body = JSON.parse(event.body || '{}');
    const inputCode = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';

    if (!inputCode) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valid: false }),
      };
    }

    const store = getStore({
      name: 'cissp-vault',
      siteID: process.env.SITE_ID,
      token: process.env.BLOBS_TOKEN,
    });

    const raw = await store.get(BLOB_KEY);
    const codes = raw ? JSON.parse(decrypt(raw)) : [];
    const match = Array.isArray(codes) ? codes.find((c: any) => c.code?.toUpperCase() === inputCode) : null;

    if (!match) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valid: false }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valid: true,
        usedCount: match.usedCount || 0,
        candidateName: match.candidateName || null,
      }),
    };
  } catch (err) {
    console.error('verify_invite_code error:', err);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valid: false }),
    };
  }
};
