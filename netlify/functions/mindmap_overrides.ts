import { getStore } from '@netlify/blobs';
import { encrypt, decrypt } from './_shared/encryption';
import { requireAdmin } from './_shared/adminAuth';
import { requireAuthenticated } from './_shared/authContext';

const BLOB_KEY = 'mindmap_overrides';

const DEFAULT_OVERRIDES = JSON.stringify({ edits: {}, added: [] });

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
    const authError = await requireAdmin(event);
    if (authError) return authError;
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
