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
  const store = getStore('cissp-vault');

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
