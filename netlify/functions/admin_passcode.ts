import { getStore } from '@netlify/blobs';
import crypto from 'crypto';

const ENCRYPTION_KEY = Buffer.from('c1sspm1ndmapandqu1zmaster2026sec', 'utf-8'); // Must be exactly 32 bytes
const IV_LENGTH = 16;
const BLOB_KEY = 'admin_passcode';
const DEFAULT_ADMIN_PASSCODE = 'ADMIN2026';

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
      const data = raw ? decrypt(raw) : DEFAULT_ADMIN_PASSCODE;
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/plain' },
        body: data,
      };
    } catch (err) {
      console.error('Blobs GET error (admin_passcode):', err);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/plain' },
        body: DEFAULT_ADMIN_PASSCODE,
      };
    }
  }

  if (event.httpMethod === 'PUT') {
    try {
      const passcode = (event.body || '').trim();
      await store.set(BLOB_KEY, encrypt(passcode));
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/plain' },
        body: passcode,
      };
    } catch (err) {
      console.error('Blobs PUT error (admin_passcode):', err);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Failed to save admin passcode',
      };
    }
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};
