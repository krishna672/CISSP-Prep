import { getStore } from '@netlify/blobs';
import crypto from 'crypto';

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

export const handler = async (event: any) => {
  const store = getStore({
    name: 'cissp-vault',
    // Netlify's automatic zero-config Blobs detection has been unreliable on
    // some sites (MissingBlobsEnvironmentError even though everything is set
    // up correctly per the docs). Passing siteID + token explicitly sidesteps
    // that entirely. SITE_ID is always available at runtime; BLOBS_TOKEN must
    // be set in Site settings -> Environment variables (a Netlify Personal
    // Access Token, scoped to Functions).
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
