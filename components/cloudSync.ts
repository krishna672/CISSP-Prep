import { InviteCode, LeaderboardEntry, Question, QuestionVisibilitySettings } from '../types';

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

// ----------------------------------------------------
// Cloud Sync: LEADERBOARD
// ----------------------------------------------------
//
// The cloud store is the single source of truth. The local cache is only
// ever used as a read-only fallback for when the network/cloud is briefly
// unreachable -- it is never merged back into a successful cloud response.
// (Merging used to resurrect entries an admin had already deleted, because
// a device that still had the old entry cached locally would keep adding
// it back in on every fetch.)

export async function fetchLeaderboardCloud(): Promise<LeaderboardEntry[]> {
  const localKey = 'cissp_leaderboard';

  try {
    const response = await fetch(`${BASE_URL}/leaderboard`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      const text = await response.text();
      if (text && text.trim()) {
        const cloudEntries: LeaderboardEntry[] = JSON.parse(text);
        if (Array.isArray(cloudEntries)) {
          const cleanEntries = cloudEntries.filter(e => e && e.id && !e.id.startsWith('mock-'));
          localStorage.setItem(localKey, JSON.stringify(cleanEntries));
          return cleanEntries;
        }
      } else {
        // Cloud explicitly returned an empty body -- treat as an empty board,
        // not a reason to fall back to a possibly-stale local cache.
        localStorage.setItem(localKey, JSON.stringify([]));
        return [];
      }
    }
  } catch (error) {
    console.warn('Cloud Sync: Failed to fetch leaderboard. Falling back to offline state.', error);
  }

  // Only reached if the cloud request itself failed (offline, network error).
  const localData = localStorage.getItem(localKey);
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch (e) {
      return [];
    }
  }
  return [];
}

export async function saveLeaderboardCloud(entries: LeaderboardEntry[]): Promise<boolean> {
  const localKey = 'cissp_leaderboard';
  // Filter out any mock entries
  const cleanEntries = entries.filter(e => !e.id.startsWith('mock-'));
  localStorage.setItem(localKey, JSON.stringify(cleanEntries));

  try {
    const response = await fetch(`${BASE_URL}/leaderboard`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanEntries)
    });
    return response.ok;
  } catch (error) {
    console.warn('Cloud Sync: Failed to save leaderboard to cloud.', error);
    return false;
  }
}

export async function submitLeaderboardEntryCloud(newEntry: LeaderboardEntry): Promise<LeaderboardEntry[]> {
  // 1. Fetch latest from cloud to avoid overwriting other users' scores
  const latestEntries = await fetchLeaderboardCloud();
  
  // 2. Add our new score
  const updatedEntries = [newEntry, ...latestEntries.filter(e => e.id !== newEntry.id)];
  
  // 3. Save back to cloud and local
  await saveLeaderboardCloud(updatedEntries);
  return updatedEntries;
}

export async function clearLeaderboardCloud(): Promise<boolean> {
  localStorage.setItem('cissp_leaderboard', JSON.stringify([]));
  try {
    const response = await fetch(`${BASE_URL}/leaderboard`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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
// Same "cloud is truth" principle as the leaderboard above -- a revoked
// code must actually disappear everywhere, not get merged back in from a
// stale local cache.

export async function fetchInviteCodesCloud(): Promise<InviteCode[]> {
  const localKey = 'cissp_invite_codes';

  try {
    const response = await fetch(`${BASE_URL}/invite_codes`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      const text = await response.text();
      if (text && text.trim()) {
        const cloudCodes: InviteCode[] = JSON.parse(text);
        if (Array.isArray(cloudCodes)) {
          localStorage.setItem(localKey, JSON.stringify(cloudCodes));
          return cloudCodes;
        }
      } else {
        localStorage.setItem(localKey, JSON.stringify([]));
        return [];
      }
    }
  } catch (error) {
    console.warn('Cloud Sync: Failed to fetch invite codes. Falling back to offline state.', error);
  }

  // Only reached if the cloud request itself failed (offline, network error).
  const localData = localStorage.getItem(localKey);
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch (e) {
      return [];
    }
  }
  return [];
}

export async function saveInviteCodesCloud(codes: InviteCode[]): Promise<boolean> {
  const localKey = 'cissp_invite_codes';
  localStorage.setItem(localKey, JSON.stringify(codes));

  try {
    const response = await fetch(`${BASE_URL}/invite_codes`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(codes)
    });
    return response.ok;
  } catch (error) {
    console.warn('Cloud Sync: Failed to save invite codes to cloud.', error);
    return false;
  }
}

export async function redeemInviteCodeCloud(code: string): Promise<boolean> {
  // 1. Fetch latest codes
  const latestCodes = await fetchInviteCodesCloud();
  const upperCode = code.trim().toUpperCase();
  const index = latestCodes.findIndex(c => c.code.toUpperCase() === upperCode);
  
  if (index !== -1) {
    // 2. Increment used count
    latestCodes[index].usedCount = (latestCodes[index].usedCount || 0) + 1;
    // 3. Save back
    return await saveInviteCodesCloud(latestCodes);
  }
  return false;
}

// ----------------------------------------------------
// Cloud Sync: ADMIN PASSCODE
// ----------------------------------------------------
//
// The admin passcode is never cached in localStorage. It used to be fetched
// and stored there for every single visitor (even before they logged in)
// just so the login form could compare it client-side -- which meant the
// real admin password was sitting in plain text in any visitor's browser
// storage. Login verification now happens server-side via
// verifyAdminPasscodeCloud. fetchAdminPasscodeCloud/saveAdminPasscodeCloud
// below are only used by the already-authenticated Admin Panel to
// display/rotate the passcode.

export async function verifyAdminPasscodeCloud(candidatePasscode: string): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/verify_admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode: candidatePasscode })
    });

    if (response.ok) {
      const data = await response.json();
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
      headers: { 'Accept': 'text/plain' }
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
      headers: { 'Content-Type': 'text/plain' },
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
// Admin-added questions (manual entry / JSON upload) used to live only in
// the admin's own browser localStorage, which meant candidates on other
// devices never actually saw them. The cloud store is now the source of
// truth, same pattern as leaderboard/invite codes above.

export async function fetchCustomQuestionsCloud(): Promise<Question[]> {
  const localKey = 'cissp_generated_questions';

  try {
    const response = await fetch(`${BASE_URL}/custom_questions`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      const text = await response.text();
      if (text && text.trim()) {
        const cloudQuestions: Question[] = JSON.parse(text);
        if (Array.isArray(cloudQuestions)) {
          localStorage.setItem(localKey, JSON.stringify(cloudQuestions));
          return cloudQuestions;
        }
      } else {
        localStorage.setItem(localKey, JSON.stringify([]));
        return [];
      }
    }
  } catch (error) {
    console.warn('Cloud Sync: Failed to fetch custom questions. Falling back to offline state.', error);
  }

  const localData = localStorage.getItem(localKey);
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch (e) {
      return [];
    }
  }
  return [];
}

export async function saveCustomQuestionsCloud(questions: Question[]): Promise<boolean> {
  const localKey = 'cissp_generated_questions';
  localStorage.setItem(localKey, JSON.stringify(questions));

  try {
    const response = await fetch(`${BASE_URL}/custom_questions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      const text = await response.text();
      if (text && text.trim()) {
        const cloudIds: string[] = JSON.parse(text);
        if (Array.isArray(cloudIds)) {
          localStorage.setItem(localKey, JSON.stringify(cloudIds));
          return cloudIds;
        }
      } else {
        localStorage.setItem(localKey, JSON.stringify([]));
        return [];
      }
    }
  } catch (error) {
    console.warn('Cloud Sync: Failed to fetch deleted question IDs. Falling back to offline state.', error);
  }

  const localData = localStorage.getItem(localKey);
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch (e) {
      return [];
    }
  }
  return [];
}

export async function saveDeletedQuestionIdsCloud(ids: string[]): Promise<boolean> {
  const localKey = 'cissp_deleted_question_ids';
  localStorage.setItem(localKey, JSON.stringify(ids));

  try {
    const response = await fetch(`${BASE_URL}/deleted_question_ids`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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
//
// Controls which pool of questions candidates see in Practice Quiz /
// Adaptive CAT: the default static bank, only admin-added custom
// questions, or a hand-picked selection of specific question IDs.

const DEFAULT_VISIBILITY: QuestionVisibilitySettings = { mode: 'default', selectedIds: [] };

export async function fetchQuestionVisibilityCloud(): Promise<QuestionVisibilitySettings> {
  const localKey = 'cissp_question_visibility';

  try {
    const response = await fetch(`${BASE_URL}/question_visibility`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      const text = await response.text();
      if (text && text.trim()) {
        const settings: QuestionVisibilitySettings = JSON.parse(text);
        if (settings && typeof settings.mode === 'string' && Array.isArray(settings.selectedIds)) {
          localStorage.setItem(localKey, JSON.stringify(settings));
          return settings;
        }
      }
    }
  } catch (error) {
    console.warn('Cloud Sync: Failed to fetch question visibility settings. Falling back to offline state.', error);
  }

  const localData = localStorage.getItem(localKey);
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch (e) {
      return DEFAULT_VISIBILITY;
    }
  }
  return DEFAULT_VISIBILITY;
}

export async function saveQuestionVisibilityCloud(settings: QuestionVisibilitySettings): Promise<boolean> {
  const localKey = 'cissp_question_visibility';
  localStorage.setItem(localKey, JSON.stringify(settings));

  try {
    const response = await fetch(`${BASE_URL}/question_visibility`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return response.ok;
  } catch (error) {
    console.warn('Cloud Sync: Failed to save question visibility settings to cloud.', error);
    return false;
  }
}
