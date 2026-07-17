import { getStore } from '@netlify/blobs';
import crypto from 'crypto';

// Same encryption approach as the original server.ts, so data at rest
// stays encrypted even though it now lives in Netlify Blobs instead of
// a local file.
const ENCRYPTION_KEY = Buffer.from('c1sspm1ndmapandqu1zmaster2026sec', 'utf-8'); // Must be exactly 32 bytes
const IV_LENGTH = 16;
const BLOB_KEY = 'leaderboard';

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

export const handler = async (event: any) => {
  // Temporary diagnostic: hit /api/leaderboard?diag=1 to see, without
  // exposing secret values, whether the required env vars are actually
  // reaching this function. Remove this block once things are confirmed
  // working.
  if (event.queryStringParameters && event.queryStringParameters.diag === '1') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        SITE_ID_present: Boolean(process.env.SITE_ID),
        BLOBS_TOKEN_present: Boolean(process.env.BLOBS_TOKEN),
        BLOBS_TOKEN_length: process.env.BLOBS_TOKEN ? process.env.BLOBS_TOKEN.length : 0,
        NODE_ENV: process.env.NODE_ENV || null,
        CONTEXT: process.env.CONTEXT || null,
      }),
    };
  }

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

  if (event.httpMethod === 'PUT') {
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
