import { getStore } from '@netlify/blobs';
import crypto from 'crypto';

const ENCRYPTION_KEY = Buffer.from('c1sspm1ndmapandqu1zmaster2026sec', 'utf-8'); // Must be exactly 32 bytes
const IV_LENGTH = 16;
const BLOB_KEY = 'mindmap_overrides';

const DEFAULT_OVERRIDES = JSON.stringify({ edits: {}, added: [] });

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
  const store = getStore({
    name: 'cissp-vault',
    siteID: process.env.SITE_ID,
    token: process.env.BLOBS_TOKEN,
  });

  if (event.httpMethod === 'GET') {
    try {
      const raw = await store.get(BLOB_KEY);
      const data = raw ? decrypt(raw) : DEFAULT_OVERRIDES;
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: data,
      };
    } catch (err) {
      console.error('Blobs GET error (mindmap_overrides):', err);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: DEFAULT_OVERRIDES,
      };
    }
  }

  if (event.httpMethod === 'PUT') {
    try {
      const bodyStr = event.body || DEFAULT_OVERRIDES;
      const parsed = JSON.parse(bodyStr);
      if (typeof parsed !== 'object' || parsed === null || typeof parsed.edits !== 'object' || !Array.isArray(parsed.added)) {
        throw new Error('Invalid mind map overrides payload');
      }
      await store.set(BLOB_KEY, encrypt(bodyStr));
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr,
      };
    } catch (err) {
      console.error('Blobs PUT error (mindmap_overrides):', err);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Failed to save mind map overrides' }),
      };
    }
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};
