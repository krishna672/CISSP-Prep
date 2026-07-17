import { revokeAdminSession, extractAdminToken } from './_shared/adminAuth';

export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const token = extractAdminToken(event);
  await revokeAdminSession(token);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true }),
  };
};
