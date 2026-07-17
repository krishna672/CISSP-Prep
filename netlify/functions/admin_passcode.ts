import { getStore } from '@netlify/blobs';
import { encrypt, decrypt } from './_shared/encryption';
import { requireAdmin } from './_shared/adminAuth';

const BLOB_KEY = 'admin_passcode';
const DEFAULT_ADMIN_PASSCODE = 'ADMIN2026';

// Admin-only for both reads and writes. Verifying a login attempt goes
// through verify_admin.ts instead, which never returns the real value.
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
