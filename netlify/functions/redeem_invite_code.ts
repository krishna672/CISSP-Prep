import { getStore } from '@netlify/blobs';
import crypto from 'crypto';
import { createCandidateSession } from './_shared/candidateAuth';

const ENCRYPTION_KEY = Buffer.from('c1sspm1ndmapandqu1zmaster2026sec', 'utf-8'); // Must be exactly 32 bytes
const IV_LENGTH = 16;
const BLOB_KEY = 'invite_codes';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift() || '', 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText).toString('utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// The actual candidate login transaction, done entirely server-side:
// look up the code, enforce the one-use rule (except when this exact
// device already redeemed it), conditionally increment usedCount, and --
// on success -- issue a real session token. Everything downstream
// (content endpoints, leaderboard submission) checks this token instead
// of trusting a client-side sessionStorage flag.
export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const inputCode = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';
    const alreadyRedeemedOnDevice = Boolean(body.alreadyRedeemedOnDevice);

    if (!inputCode) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, reason: 'invalid' }),
      };
    }

    const store = getStore({
      name: 'cissp-vault',
      siteID: process.env.SITE_ID,
      token: process.env.BLOBS_TOKEN,
    });

    const raw = await store.get(BLOB_KEY);
    const codes = raw ? JSON.parse(decrypt(raw)) : [];
    if (!Array.isArray(codes)) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, reason: 'invalid' }),
      };
    }

    const index = codes.findIndex((c: any) => c.code?.toUpperCase() === inputCode);
    if (index === -1) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, reason: 'invalid' }),
      };
    }

    const usedCount = codes[index].usedCount || 0;
    if (usedCount >= 1 && !alreadyRedeemedOnDevice) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, reason: 'already_used' }),
      };
    }

    const candidateName = codes[index].candidateName || `Candidate (${inputCode})`;

    if (!alreadyRedeemedOnDevice) {
      codes[index].usedCount = usedCount + 1;
      await store.set(BLOB_KEY, encrypt(JSON.stringify(codes)));
    }

    const token = await createCandidateSession(inputCode, candidateName);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, candidateName, token }),
    };
  } catch (err) {
    console.error('redeem_invite_code (login) error:', err);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, reason: 'error' }),
    };
  }
};
