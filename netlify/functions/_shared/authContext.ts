import { isValidAdminSession, extractAdminToken } from './adminAuth';
import { getCandidateSession, extractCandidateToken } from './candidateAuth';

export interface AuthContext {
  isAdmin: boolean;
  candidateCode?: string;
  candidateName?: string;
}

// Resolves whichever kind of valid session (if any) a request is carrying.
// Admin sessions use the Authorization: Bearer header; candidate sessions
// use a separate X-Candidate-Session header, so the two never collide.
export async function getAuthContext(event: any): Promise<AuthContext | null> {
  const adminToken = extractAdminToken(event);
  if (await isValidAdminSession(adminToken)) {
    return { isAdmin: true };
  }

  const candidateToken = extractCandidateToken(event);
  const candidateSession = await getCandidateSession(candidateToken);
  if (candidateSession) {
    return { isAdmin: false, candidateCode: candidateSession.code, candidateName: candidateSession.candidateName };
  }

  return null;
}

// Convenience helper: returns a 401 response if the request isn't carrying
// ANY valid session (admin or candidate), or null if it's fine to proceed.
export async function requireAuthenticated(event: any): Promise<{ statusCode: number; body: string } | null> {
  const ctx = await getAuthContext(event);
  if (!ctx) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized: valid session required.' }),
    };
  }
  return null;
}
