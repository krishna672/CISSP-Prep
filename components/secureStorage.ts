// Lightweight AES-GCM wrapper around localStorage, so cached data doesn't
// sit in plain, human-readable text under DevTools -> Application -> Local
// Storage.
//
// IMPORTANT HONESTY NOTE: this raises the bar against casual inspection
// (someone opening DevTools and reading values directly) -- it is NOT
// protection against a determined attacker, because the decryption key is
// necessarily shipped in the same JS bundle that does the decrypting. True
// protection for answer keys would mean never sending unrevealed correct
// answers to the client at all (server-side grading). This wrapper is a
// pragmatic improvement, not a cryptographic guarantee.

const KEY_MATERIAL = 'cissp-vault-local-cache-key-2026';
const SALT = 'cissp-vault-local-cache-salt';

let cachedKey: CryptoKey | null = null;

async function getKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(KEY_MATERIAL),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  cachedKey = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode(SALT), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  return cachedKey;
}

function bufToBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = '';
  bytes.forEach(b => { binary += String.fromCharCode(b); });
  return btoa(binary);
}

function base64ToBuf(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// Encrypts `value` and writes it to localStorage under `key`. If encryption
// fails for any reason (unsupported browser, etc.), the write is skipped
// entirely rather than silently falling back to plaintext.
export async function secureSet(key: string, value: string): Promise<void> {
  try {
    const cryptoKey = await getKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, enc.encode(value));
    const payload = JSON.stringify({ iv: bufToBase64(iv), data: bufToBase64(ciphertext) });
    localStorage.setItem(key, payload);
  } catch (e) {
    console.warn('secureStorage: failed to encrypt value, skipping local cache write for', key, e);
  }
}

// Reads and decrypts a value previously written with secureSet. Returns
// null if missing, malformed, or decryption fails.
export async function secureGet(key: string): Promise<string | null> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const payload = JSON.parse(raw);
    if (!payload || !payload.iv || !payload.data) return null;
    const cryptoKey = await getKey();
    const iv = base64ToBuf(payload.iv);
    const data = base64ToBuf(payload.data);
    const plaintextBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, data);
    return new TextDecoder().decode(plaintextBuf);
  } catch (e) {
    return null;
  }
}

export function secureRemove(key: string): void {
  localStorage.removeItem(key);
}
