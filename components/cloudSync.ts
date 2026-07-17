import { InviteCode, LeaderboardEntry } from '../types';

const BUCKET_ID = 'cissp_vault_dd7569483353480e';
const BASE_URL = `https://kvdb.io/${BUCKET_ID}`;

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

export async function fetchLeaderboardCloud(): Promise<LeaderboardEntry[]> {
  const localKey = 'cissp_leaderboard';
  const localData = localStorage.getItem(localKey);
  let localEntries: LeaderboardEntry[] = [];
  if (localData) {
    try {
      localEntries = JSON.parse(localData);
    } catch (e) {
      localEntries = [];
    }
  }

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
          // Merge local and cloud entries by unique ID
          const mergedMap = new Map<string, LeaderboardEntry>();
          // Add local entries first
          localEntries.forEach(entry => {
            if (entry && entry.id && !entry.id.startsWith('mock-')) {
              mergedMap.set(entry.id, entry);
            }
          });
          // Overwrite/add cloud entries (cloud takes priority for overlapping ids)
          cloudEntries.forEach(entry => {
            if (entry && entry.id && !entry.id.startsWith('mock-')) {
              mergedMap.set(entry.id, entry);
            }
          });

          const mergedEntries = Array.from(mergedMap.values());
          localStorage.setItem(localKey, JSON.stringify(mergedEntries));
          return mergedEntries;
        }
      }
    }
  } catch (error) {
    console.warn('Cloud Sync: Failed to fetch leaderboard. Falling back to offline state.', error);
  }

  return localEntries;
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

export async function fetchInviteCodesCloud(): Promise<InviteCode[]> {
  const localKey = 'cissp_invite_codes';
  const localData = localStorage.getItem(localKey);
  let localCodes: InviteCode[] = [];
  if (localData) {
    try {
      localCodes = JSON.parse(localData);
    } catch (e) {
      localCodes = [];
    }
  }

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
          // Merge local and cloud invite codes by code
          const mergedMap = new Map<string, InviteCode>();
          localCodes.forEach(c => {
            if (c && c.code) mergedMap.set(c.code.toUpperCase(), c);
          });
          cloudCodes.forEach(c => {
            if (c && c.code) {
              const upperCode = c.code.toUpperCase();
              const existing = mergedMap.get(upperCode);
              if (existing) {
                // Keep the higher usedCount to handle redemptions
                mergedMap.set(upperCode, {
                  ...c,
                  usedCount: Math.max(existing.usedCount, c.usedCount)
                });
              } else {
                mergedMap.set(upperCode, c);
              }
            }
          });

          const mergedList = Array.from(mergedMap.values());
          localStorage.setItem(localKey, JSON.stringify(mergedList));
          return mergedList;
        }
      }
    }
  } catch (error) {
    console.warn('Cloud Sync: Failed to fetch invite codes. Falling back to offline state.', error);
  }

  return localCodes;
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

export async function fetchAdminPasscodeCloud(defaultPasscode: string): Promise<string> {
  const localKey = 'cissp_admin_passcode';
  const localPass = localStorage.getItem(localKey) || defaultPasscode;

  try {
    const response = await fetch(`${BASE_URL}/admin_passcode`, {
      method: 'GET',
      headers: { 'Accept': 'text/plain' }
    });

    if (response.ok) {
      const text = await response.text();
      if (text && text.trim()) {
        const cloudPass = text.trim();
        localStorage.setItem(localKey, cloudPass);
        return cloudPass;
      }
    }
  } catch (error) {
    console.warn('Cloud Sync: Failed to fetch admin passcode. Falling back to offline state.', error);
  }

  return localPass;
}

export async function saveAdminPasscodeCloud(passcode: string): Promise<boolean> {
  const localKey = 'cissp_admin_passcode';
  localStorage.setItem(localKey, passcode);

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

