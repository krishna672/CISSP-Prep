import { InviteCode, LeaderboardEntry, Question, QuestionVisibilitySettings, MindMapOverrides } from '../types';
import { secureGet, secureSet } from './secureStorage';

const BASE_URL = '/api';

const SECRET_SALT = 'CISSP-SECURE-SALT-2026-XyZ789';

// Cryptographic sync/verification signatures
export function generateSignature(code: string, candidateName: string): string {
  const content = `${code.toUpperCase()}:${candidateName.trim().toUpperCase()}:${SECRET_SALT}`;
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  const unsignedHash = hash >>> 0;
  return unsignedHash.toString(36).toUpperCase().padStart(6, '0');
}

export function encodeNameForCode(name: string): string {
  return name.trim().toUpperCase().replace(/[^A-Z0-9 ]/g, '').replace(/ /g, '_');
}

export function decodeNameFromCode(safeName: string): string {
  return safeName.replace(/_/g, ' ');
}

// In-memory (never written to disk) cache of whatever the most recent
// successful cloud fetch returned, for call sites that need a synchronous
// read (e.g. building the quiz/exam question pool at start time). This is
// populated by the fetch*Cloud functions below and cleared on page reload.
const memoryCache: {
  customQuestions?: Question[];
  deletedQuestionIds?: string[];
  questionVisibility?: QuestionVisibilitySettings;
} = {};

export function getCachedCustomQuestions(): Question[] {
  return memoryCache.customQuestions || [];
}
export function getCachedDeletedQuestionIds(): string[] {
  return memoryCache.deletedQuestionIds || [];
}
export function getCachedQuestionVisibility(): QuestionVisibilitySettings {
  return memoryCache.questionVisibility || { mode: 'default', selectedIds: [] };
}

// ----------------------------------------------------
// ADMIN SESSION TOKEN
// ----------------------------------------------------
//
// Real server-side authorization. This token is only ever issued by the
// server (verify_admin.ts) after checking the passcode server-side. Every
// admin-only write on the backend validates this token itself -- so even
// if someone tampers with client-side state (e.g. sessionStorage flags),
// they still can't perform any admin action without a token the server
// actually issued.
const ADMIN_TOKEN_KEY = 'cissp_admin_session_token';

export function setAdminSessionToken(token: string | null): void {
  if (token) {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

export function getAdminSessionToken(): string | null {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

function adminAuthHeaders(): Record<string, string> {
  const token = getAdminSessionToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function logoutAdminSession(): Promise<void> {
  const token = getAdminSessionToken();
  try {
    await fetch(`${BASE_URL}/logout_admin`, {
      method: 'POST',
      headers: adminAuthHeaders(),
    });
  } catch (error) {
    console.warn('Cloud Sync: Failed to invalidate admin session on server.', error);
  }
  setAdminSessionToken(null);
}

// ----------------------------------------------------
// CANDIDATE SESSION TOKEN
// ----------------------------------------------------
//
// Mirrors the admin session token above. Only ever issued by the server
// (redeem_invite_code.ts) after a real invite code has been validated --
// so a candidate-only route can't be reached just by setting a client-side
// sessionStorage flag either.
const CANDIDATE_TOKEN_KEY = 'cissp_candidate_session_token';

export function setCandidateSessionToken(token: string | null): void {
  if (token) {
    sessionStorage.setItem(CANDIDATE_TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(CANDIDATE_TOKEN_KEY);
  }
}

export function getCandidateSessionToken(): string | null {
  return sessionStorage.getItem(CANDIDATE_TOKEN_KEY);
}

function candidateAuthHeaders(): Record<string, string> {
  const token = getCandidateSessionToken();
  return token ? { 'X-Candidate-Session': token } : {};
}

// Combined header set for endpoints that accept EITHER an admin or a
// candidate session (most read endpoints). The two headers use different
// names (Authorization vs X-Candidate-Session) so they never collide.
function authHeaders(): Record<string, string> {
  return { ...adminAuthHeaders(), ...candidateAuthHeaders() };
}

export async function logoutCandidateSession(): Promise<void> {
  try {
    await fetch(`${BASE_URL}/logout_candidate`, {
      method: 'POST',
      headers: candidateAuthHeaders(),
    });
  } catch (error) {
    console.warn('Cloud Sync: Failed to invalidate candidate session on server.', error);
  }
  setCandidateSessionToken(null);
}

// ----------------------------------------------------
// Cloud Sync: LEADERBOARD
// ----------------------------------------------------
//
// GET and POST (submitting a score) both require a valid session -- either
// candidate or admin. On POST, the server derives the entry's code/name
// from the session itself rather than trusting the client, so nobody can
// submit a score as someone else. Bulk-overwriting the board (PUT, used
// for deleting entries / clearing it) requires an admin session.

export async function fetchLeaderboardCloud(): Promise<LeaderboardEntry[]> {
  const localKey = 'cissp_leaderboard';

  try {
    const response = await fetch(`${BASE_URL}/leaderboard`, {
      method: 'GET',
      headers: { 'Accept': 'application/json', ...authHeaders() }
    });

    if (response.ok) {
      const text = await response.text();
      if (text && text.trim()) {
        const cloudEntries: LeaderboardEntry[] = JSON.parse(text);
        if (Array.isArray(cloudEntries)) {
          const cleanEntries = cloudEntries.filter(e => e && e.id && !e.id.startsWith('mock-'));
          await secureSet(localKey, JSON.stringify(cleanEntries));
          return cleanEntries;
        }
      } else {
        await secureSet(localKey, JSON.stringify([]));
        return [];
      }
    }
  } catch (error) {
    console.warn('Cloud Sync: Failed to fetch leaderboard. Falling back to offline state.', error);
  }

  const localData = await secureGet(localKey);
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch (e) {
      return [];
    }
  }
  return [];
}

// Admin-only: bulk overwrite, used by the Admin Panel to delete individual
// entries or clear the whole board.
export async function saveLeaderboardCloud(entries: LeaderboardEntry[]): Promise<boolean> {
  const localKey = 'cissp_leaderboard';
  const cleanEntries = entries.filter(e => !e.id.startsWith('mock-'));
  await secureSet(localKey, JSON.stringify(cleanEntries));

  try {
    const response = await fetch(`${BASE_URL}/leaderboard`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...adminAuthHeaders() },
      body: JSON.stringify(cleanEntries)
    });
    return response.ok;
  } catch (error) {
    console.warn('Cloud Sync: Failed to save leaderboard to cloud.', error);
    return false;
  }
}

// Requires a valid session (candidate or admin). The server derives the
// entry's code/name from the session itself -- whatever is sent in
// newEntry.code/name is ignored server-side, so this can't be used to
// spoof another candidate's identity.
export async function submitLeaderboardEntryCloud(newEntry: LeaderboardEntry): Promise<LeaderboardEntry[]> {
  try {
    const response = await fetch(`${BASE_URL}/leaderboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(newEntry)
    });
    if (response.ok) {
      const updated = await response.json();
      if (Array.isArray(updated)) {
        await secureSet('cissp_leaderboard', JSON.stringify(updated));
        return updated;
      }
    }
  } catch (error) {
    console.warn('Cloud Sync: Failed to submit leaderboard entry.', error);
  }
  return await fetchLeaderboardCloud();
}

// Admin-only.
export async function clearLeaderboardCloud(): Promise<boolean> {
  await secureSet('cissp_leaderboard', JSON.stringify([]));
  try {
    const response = await fetch(`${BASE_URL}/leaderboard`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...adminAuthHeaders() },
      body: JSON.stringify([])
    });
    return response.ok;
  } catch (error) {
    console.warn('Cloud Sync: Failed to clear leaderboard in cloud.', error);
    return false;
  }
}

// ----------------------------------------------------
// Cloud Sync: INVITE CODES
// ----------------------------------------------------
//
// The full registry (fetchInviteCodesCloud / saveInviteCodesCloud) is
// admin-only now -- both server-side (the endpoint rejects requests
// without a valid admin session) and by not being cached locally at all.
// Candidates never see the full list; they use verifyInviteCodeCloud /
// redeemInviteCodeCloud below, which only ever reveal info about the one
// code they typed in.

export async function fetchInviteCodesCloud(): Promise<InviteCode[]> {
  try {
    const response = await fetch(`${BASE_URL}/invite_codes`, {
      method: 'GET',
      headers: { 'Accept': 'application/json', ...adminAuthHeaders() }
    });

    if (response.ok) {
      const text = await response.text();
      if (text && text.trim()) {
        const cloudCodes: InviteCode[] = JSON.parse(text);
        if (Array.isArray(cloudCodes)) {
          return cloudCodes;
        }
      } else {
        return [];
      }
    }
  } catch (error) {
    console.warn('Cloud Sync: Failed to fetch invite codes.', error);
  }
  return [];
}

export async function saveInviteCodesCloud(codes: InviteCode[]): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/invite_codes`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...adminAuthHeaders() },
      body: JSON.stringify(codes)
    });
    return response.ok;
  } catch (error) {
    console.warn('Cloud Sync: Failed to save invite codes to cloud.', error);
    return false;
  }
}

// Public: checks a single code without exposing the full registry.
// Public, lightweight, read-only check for a single code -- used by the
// periodic revocation poll while a candidate is already logged in. Does
// NOT issue a session (that only happens via loginCandidateCloud below).
export async function verifyInviteCodeCloud(code: string): Promise<{ valid: boolean; usedCount?: number; candidateName?: string | null }> {
  try {
    const response = await fetch(`${BASE_URL}/verify_invite_code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Cloud Sync: Failed to verify invite code.', error);
  }
  return { valid: false };
}

// The actual candidate login transaction: validates the code, enforces
// one-use-per-code (with a per-device exception), conditionally redeems
// it, and -- on success -- captures the real session token the server
// issues. This token is what every candidate-accessible route actually
// checks from then on, not any client-side flag.
export async function loginCandidateCloud(
  code: string,
  alreadyRedeemedOnDevice: boolean
): Promise<{ success: boolean; reason?: string; candidateName?: string }> {
  try {
    const response = await fetch(`${BASE_URL}/redeem_invite_code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, alreadyRedeemedOnDevice })
    });
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.token) {
        setCandidateSessionToken(data.token);
      }
      return { success: Boolean(data.success), reason: data.reason, candidateName: data.candidateName };
    }
  } catch (error) {
    console.warn('Cloud Sync: Failed to log in with invite code.', error);
  }
  return { success: false, reason: 'error' };
}

// Stores ONLY this device's own {code, candidateName} after a successful
// login -- never the full multi-user registry. Used by the quiz/exam
// screens to label leaderboard submissions without needing to read
// everyone else's invite codes.
export async function saveMyCandidateInfo(code: string, candidateName: string): Promise<void> {
  await secureSet('cissp_my_candidate_info', JSON.stringify({ code, candidateName }));
}

export async function getMyCandidateInfo(): Promise<{ code: string; candidateName: string } | null> {
  const data = await secureGet('cissp_my_candidate_info');
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

// ----------------------------------------------------
// Cloud Sync: ADMIN PASSCODE
// ----------------------------------------------------
//
// The admin passcode is never cached in localStorage. Login verification
// happens server-side via verifyAdminPasscodeCloud, which also issues the
// real session token that gates every other admin action.
// fetchAdminPasscodeCloud/saveAdminPasscodeCloud are admin-only (server
// enforces this) and are used by the Admin Panel to display/rotate it.

export async function verifyAdminPasscodeCloud(candidatePasscode: string): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/verify_admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode: candidatePasscode })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.isAdmin && data.token) {
        setAdminSessionToken(data.token);
      } else {
        setAdminSessionToken(null);
      }
      return Boolean(data.isAdmin);
    }
  } catch (error) {
    console.warn('Cloud Sync: Failed to verify admin passcode.', error);
  }
  return false;
}

export async function fetchAdminPasscodeCloud(defaultPasscode: string): Promise<string> {
  try {
    const response = await fetch(`${BASE_URL}/admin_passcode`, {
      method: 'GET',
      headers: { 'Accept': 'text/plain', ...adminAuthHeaders() }
    });

    if (response.ok) {
      const text = await response.text();
      if (text && text.trim()) {
        return text.trim();
      }
    }
  } catch (error) {
    console.warn('Cloud Sync: Failed to fetch admin passcode.', error);
  }

  return defaultPasscode;
}

export async function saveAdminPasscodeCloud(passcode: string): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/admin_passcode`, {
      method: 'PUT',
      headers: { 'Content-Type': 'text/plain', ...adminAuthHeaders() },
      body: passcode
    });
    return response.ok;
  } catch (error) {
    console.warn('Cloud Sync: Failed to save admin passcode to cloud.', error);
    return false;
  }
}

// ----------------------------------------------------
// Cloud Sync: CUSTOM QUESTIONS
// ----------------------------------------------------
//
// Reads stay public (candidates need this to build their quiz pool).
// Writes require an admin session.

export async function fetchCustomQuestionsCloud(): Promise<Question[]> {
  const localKey = 'cissp_generated_questions';

  try {
    const response = await fetch(`${BASE_URL}/custom_questions`, {
      method: 'GET',
      headers: { 'Accept': 'application/json', ...authHeaders() }
    });

    if (response.ok) {
      const text = await response.text();
      if (text && text.trim()) {
        const cloudQuestions: Question[] = JSON.parse(text);
        if (Array.isArray(cloudQuestions)) {
          memoryCache.customQuestions = cloudQuestions;
          await secureSet(localKey, JSON.stringify(cloudQuestions));
          return cloudQuestions;
        }
      } else {
        memoryCache.customQuestions = [];
        await secureSet(localKey, JSON.stringify([]));
        return [];
      }
    }
  } catch (error) {
    console.warn('Cloud Sync: Failed to fetch custom questions. Falling back to offline state.', error);
  }

  const localData = await secureGet(localKey);
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      memoryCache.customQuestions = parsed;
      return parsed;
    } catch (e) {
      return [];
    }
  }
  return [];
}

export async function saveCustomQuestionsCloud(questions: Question[]): Promise<boolean> {
  const localKey = 'cissp_generated_questions';
  memoryCache.customQuestions = questions;
  await secureSet(localKey, JSON.stringify(questions));

  try {
    const response = await fetch(`${BASE_URL}/custom_questions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...adminAuthHeaders() },
      body: JSON.stringify(questions)
    });
    return response.ok;
  } catch (error) {
    console.warn('Cloud Sync: Failed to save custom questions to cloud.', error);
    return false;
  }
}

// ----------------------------------------------------
// Cloud Sync: DELETED (BLACKLISTED) DEFAULT QUESTION IDS
// ----------------------------------------------------

export async function fetchDeletedQuestionIdsCloud(): Promise<string[]> {
  const localKey = 'cissp_deleted_question_ids';

  try {
    const response = await fetch(`${BASE_URL}/deleted_question_ids`, {
      method: 'GET',
      headers: { 'Accept': 'application/json', ...authHeaders() }
    });

    if (response.ok) {
      const text = await response.text();
      if (text && text.trim()) {
        const cloudIds: string[] = JSON.parse(text);
        if (Array.isArray(cloudIds)) {
          memoryCache.deletedQuestionIds = cloudIds;
          await secureSet(localKey, JSON.stringify(cloudIds));
          return cloudIds;
        }
      } else {
        memoryCache.deletedQuestionIds = [];
        await secureSet(localKey, JSON.stringify([]));
        return [];
      }
    }
  } catch (error) {
    console.warn('Cloud Sync: Failed to fetch deleted question IDs. Falling back to offline state.', error);
  }

  const localData = await secureGet(localKey);
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      memoryCache.deletedQuestionIds = parsed;
      return parsed;
    } catch (e) {
      return [];
    }
  }
  return [];
}

export async function saveDeletedQuestionIdsCloud(ids: string[]): Promise<boolean> {
  const localKey = 'cissp_deleted_question_ids';
  memoryCache.deletedQuestionIds = ids;
  await secureSet(localKey, JSON.stringify(ids));

  try {
    const response = await fetch(`${BASE_URL}/deleted_question_ids`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...adminAuthHeaders() },
      body: JSON.stringify(ids)
    });
    return response.ok;
  } catch (error) {
    console.warn('Cloud Sync: Failed to save deleted question IDs to cloud.', error);
    return false;
  }
}

// ----------------------------------------------------
// Cloud Sync: QUESTION VISIBILITY SETTINGS
// ----------------------------------------------------

const DEFAULT_VISIBILITY: QuestionVisibilitySettings = { mode: 'default', selectedIds: [] };

export async function fetchQuestionVisibilityCloud(): Promise<QuestionVisibilitySettings> {
  const localKey = 'cissp_question_visibility';

  try {
    const response = await fetch(`${BASE_URL}/question_visibility`, {
      method: 'GET',
      headers: { 'Accept': 'application/json', ...authHeaders() }
    });

    if (response.ok) {
      const text = await response.text();
      if (text && text.trim()) {
        const settings: QuestionVisibilitySettings = JSON.parse(text);
        if (settings && typeof settings.mode === 'string' && Array.isArray(settings.selectedIds)) {
          memoryCache.questionVisibility = settings;
          await secureSet(localKey, JSON.stringify(settings));
          return settings;
        }
      }
    }
  } catch (error) {
    console.warn('Cloud Sync: Failed to fetch question visibility settings. Falling back to offline state.', error);
  }

  const localData = await secureGet(localKey);
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      memoryCache.questionVisibility = parsed;
      return parsed;
    } catch (e) {
      return DEFAULT_VISIBILITY;
    }
  }
  return DEFAULT_VISIBILITY;
}

export async function saveQuestionVisibilityCloud(settings: QuestionVisibilitySettings): Promise<boolean> {
  const localKey = 'cissp_question_visibility';
  memoryCache.questionVisibility = settings;
  await secureSet(localKey, JSON.stringify(settings));

  try {
    const response = await fetch(`${BASE_URL}/question_visibility`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...adminAuthHeaders() },
      body: JSON.stringify(settings)
    });
    return response.ok;
  } catch (error) {
    console.warn('Cloud Sync: Failed to save question visibility settings to cloud.', error);
    return false;
  }
}

// ----------------------------------------------------
// Cloud Sync: MIND MAP OVERRIDES
// ----------------------------------------------------

const DEFAULT_MINDMAP_OVERRIDES: MindMapOverrides = { edits: {}, added: [] };

export async function fetchMindMapOverridesCloud(): Promise<MindMapOverrides> {
  const localKey = 'cissp_mindmap_overrides';

  try {
    const response = await fetch(`${BASE_URL}/mindmap_overrides`, {
      method: 'GET',
      headers: { 'Accept': 'application/json', ...authHeaders() }
    });

    if (response.ok) {
      const text = await response.text();
      if (text && text.trim()) {
        const overrides: MindMapOverrides = JSON.parse(text);
        if (overrides && typeof overrides.edits === 'object' && Array.isArray(overrides.added)) {
          await secureSet(localKey, JSON.stringify(overrides));
          return overrides;
        }
      }
    }
  } catch (error) {
    console.warn('Cloud Sync: Failed to fetch mind map overrides. Falling back to offline state.', error);
  }

  const localData = await secureGet(localKey);
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch (e) {
      return DEFAULT_MINDMAP_OVERRIDES;
    }
  }
  return DEFAULT_MINDMAP_OVERRIDES;
}

export async function saveMindMapOverridesCloud(overrides: MindMapOverrides): Promise<boolean> {
  const localKey = 'cissp_mindmap_overrides';
  await secureSet(localKey, JSON.stringify(overrides));

  try {
    const response = await fetch(`${BASE_URL}/mindmap_overrides`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...adminAuthHeaders() },
      body: JSON.stringify(overrides)
    });
    return response.ok;
  } catch (error) {
    console.warn('Cloud Sync: Failed to save mind map overrides to cloud.', error);
    return false;
  }
}
