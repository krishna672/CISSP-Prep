import { getStore } from '@netlify/blobs';
import { encrypt, decrypt } from './_shared/encryption';
import { requireAdmin } from './_shared/adminAuth';
import { requireAuthenticated } from './_shared/authContext';

const BLOB_KEY = 'question_visibility';

const DEFAULT_SETTINGS = JSON.stringify({ mode: 'default', selectedIds: [] });

export const handler = async (event: any) => {
  const store = getStore({
    name: 'cissp-vault',
    siteID: process.env.SITE_ID,
    token: process.env.BLOBS_TOKEN,
  });

  if (event.httpMethod === 'GET') {
    const authError = await requireAuthenticated(event);
    if (authError) return authError;
    try {
      const raw = await store.get(BLOB_KEY);
      const data = raw ? decrypt(raw) : DEFAULT_SETTINGS;
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: data,
      };
    } catch (err) {
      console.error('Blobs GET error (question_visibility):', err);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: DEFAULT_SETTINGS,
      };
    }
  }

  if (event.httpMethod === 'PUT') {
    const authError = await requireAdmin(event);
    if (authError) return authError;
    try {
      const bodyStr = event.body || DEFAULT_SETTINGS;
      const parsed = JSON.parse(bodyStr);
      if (!['default', 'custom', 'selected'].includes(parsed.mode) || !Array.isArray(parsed.selectedIds)) {
        throw new Error('Invalid question visibility payload');
      }
      await store.set(BLOB_KEY, encrypt(bodyStr));
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr,
      };
    } catch (err) {
      console.error('Blobs PUT error (question_visibility):', err);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Failed to save question visibility settings' }),
      };
    }
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};
