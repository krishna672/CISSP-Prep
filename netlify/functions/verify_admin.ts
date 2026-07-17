import { getStore } from '@netlify/blobs';
import crypto from 'crypto';

// Same encryption approach as admin_passcode.ts / leaderboard.ts.
const ENCRYPTION_KEY = Buffer.from('c1sspm1ndmapandqu1zmaster2026sec', 'utf-8'); // Must be exactly 32 bytes
const IV_LENGTH = 16;
const BLOB_KEY = 'admin_passcode';
const DEFAULT_ADMIN_PASSCODE = 'ADMIN2026';

function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift() || '', 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText).toString('utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Verifies a candidate passcode against the stored admin passcode WITHOUT
// ever sending the real passcode value back to the client. This exists
// because SecurityGate previously fetched the actual admin passcode into
// the browser (and localStorage) just to compare it, which meant the
// default/real admin password was visible to any visitor's dev tools
// before they even logged in.
export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

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

    const isAdmin = candidate.length > 0 && candidate === actualPasscode;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAdmin }),
    };
  } catch (err) {
    console.error('verify_admin error:', err);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAdmin: false }),
    };
  }
};
