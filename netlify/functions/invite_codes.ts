import { getStore } from '@netlify/blobs';
import crypto from 'crypto';
import { requireAdmin } from './_shared/adminAuth';

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

// No default invite code is seeded -- an empty registry means nobody can
// log in as a candidate until an admin explicitly creates a code.
const EMPTY_CODES = '[]';

// This endpoint exposes the FULL registry -- every candidate's code and
// name. It's admin-only for both reads and writes. Candidates never need
// to see this list; they use verify_invite_code / redeem_invite_code
// instead, which only ever reveal information about the one code they
// typed in.
export const handler = async (event: any) => {
  const authError = await requireAdmin(event);
  if (authError) return authError;

  const store = getStore({
    name: 'cissp-vault',
    siteID: process.env.SITE_ID,
    token: process.env.BLOBS_TOKEN,
  });

  if (event.httpMethod === 'GET') {
    try {
      const raw = await store.get(BLOB_KEY);
      const data = raw ? decrypt(raw) : EMPTY_CODES;
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: data,
      };
    } catch (err) {
      console.error('Blobs GET error (invite_codes):', err);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: EMPTY_CODES,
      };
    }
  }

  if (event.httpMethod === 'PUT') {
    try {
      const bodyStr = event.body || '[]';
      JSON.parse(bodyStr);
      await store.set(BLOB_KEY, encrypt(bodyStr));
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr,
      };
    } catch (err) {
      console.error('Blobs PUT error (invite_codes):', err);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Failed to save invite codes' }),
      };
    }
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};
