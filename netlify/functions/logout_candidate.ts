import { revokeCandidateSession, extractCandidateToken } from './_shared/candidateAuth';

export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const token = extractCandidateToken(event);
  await revokeCandidateSession(token);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true }),
  };
};
