import { getStore } from '@netlify/blobs';
import crypto from 'crypto';
import { requireAdmin } from './_shared/adminAuth';
import { requireAuthenticated, getAuthContext } from './_shared/authContext';

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
  const store = getStore({
    name: 'cissp-vault',
    siteID: process.env.SITE_ID,
    token: process.env.BLOBS_TOKEN,
  });

  // GET: visible to any authenticated candidate or admin -- not the open
  // internet. Requires either session type.
  if (event.httpMethod === 'GET') {
    const authError = await requireAuthenticated(event);
    if (authError) return authError;
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

  // POST: a candidate submitting their own single result. Requires a valid
  // session (candidate or admin) -- and the entry's code/name are always
  // overwritten with whatever the session actually is, never trusted from
  // the request body, so nobody can submit a score under someone else's
  // name/code.
  if (event.httpMethod === 'POST') {
    const ctx = await getAuthContext(event);
    if (!ctx) {
      return { statusCode: 401, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Unauthorized: valid session required.' }) };
    }
    try {
      const newEntry = JSON.parse(event.body || '{}');
      if (!newEntry || typeof newEntry.id !== 'string' || newEntry.id.startsWith('mock-')) {
        return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Invalid entry' }) };
      }

      // Identity is server-authoritative, not client-supplied.
      if (ctx.isAdmin) {
        newEntry.code = newEntry.code === 'ADMIN' ? 'ADMIN' : (newEntry.code || 'ADMIN');
        newEntry.name = newEntry.name || 'System Administrator';
      } else {
        newEntry.code = ctx.candidateCode;
        newEntry.name = ctx.candidateName;
      }

      const raw = await store.get(BLOB_KEY);
      const existing = raw ? JSON.parse(decrypt(raw)) : [];
      const entries = Array.isArray(existing) ? existing : [];
      const updated = [newEntry, ...entries.filter((e: any) => e.id !== newEntry.id)];

      await store.set(BLOB_KEY, encrypt(JSON.stringify(updated)));
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      };
    } catch (err) {
      console.error('Blobs POST error (leaderboard):', err);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Failed to submit leaderboard entry' }),
      };
    }
  }

  // PUT: bulk overwrite -- used by the Admin Panel to delete individual
  // entries or clear the board entirely. Admin session required.
  if (event.httpMethod === 'PUT') {
    const authError = await requireAdmin(event);
    if (authError) return authError;
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
