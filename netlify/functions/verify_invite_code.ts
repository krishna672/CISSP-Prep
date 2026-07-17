import { getStore } from '@netlify/blobs';
import crypto from 'crypto';

const ENCRYPTION_KEY = Buffer.from('c1sspm1ndmapandqu1zmaster2026sec', 'utf-8'); // Must be exactly 32 bytes
const IV_LENGTH = 16;
const BLOB_KEY = 'invite_codes';

function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift() || '', 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText).toString('utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Checks a single invite code against the registry WITHOUT ever returning
// the full list -- so an anonymous visitor typing a code can't see every
// other candidate's code/name along the way (which is what happened when
// the client fetched the entire /api/invite_codes list just to validate
// one entry).
export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

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
