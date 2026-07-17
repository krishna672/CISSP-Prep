import crypto from 'crypto';

// Encryption key now comes from an environment variable instead of being
// hardcoded in source. Previously every function had its own copy of a
// static key baked directly into the code -- meaning anyone with access to
// this codebase (or a public copy of it) had the key too. Netlify Blobs is
// already encrypted at rest and in transit by Netlify itself, so this
// app-level layer's real purpose is a second line of defense specifically
// against the BLOBS_TOKEN being compromised -- a purpose it can't serve
// if the key is sitting in the same place as the code.
//
// ENCRYPTION_KEY can be any string (not necessarily 32 bytes) -- it's
// passed through SHA-256 to derive a proper 32-byte AES-256 key,
// regardless of length. Set this in Site settings -> Environment
// variables (mark it as a secret), the same way BLOBS_TOKEN is set.
//
// Automatic migration: if ENCRYPTION_KEY is set, decrypt() tries the new
// key first, then transparently falls back to the old hardcoded key for
// data written before this change. Anything re-saved after that point
// gets re-encrypted under the new key. No manual migration script needed
// -- existing data migrates naturally as each record is next written.

const LEGACY_KEY = Buffer.from('c1sspm1ndmapandqu1zmaster2026sec', 'utf-8');

function deriveKey(raw: string): Buffer {
  return crypto.createHash('sha256').update(raw, 'utf8').digest();
}

const CURRENT_KEY = process.env.ENCRYPTION_KEY ? deriveKey(process.env.ENCRYPTION_KEY) : LEGACY_KEY;

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', CURRENT_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift() || '', 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');

  try {
    const decipher = crypto.createDecipheriv('aes-256-cbc', CURRENT_KEY, iv);
    let decrypted = decipher.update(encryptedText).toString('utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    // If we're on a new key but this data was written under the old
    // hardcoded one, fall back so existing data isn't suddenly
    // unreadable. Only relevant when ENCRYPTION_KEY is actually set.
    if (process.env.ENCRYPTION_KEY) {
      const decipher = crypto.createDecipheriv('aes-256-cbc', LEGACY_KEY, iv);
      let decrypted = decipher.update(encryptedText).toString('utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    }
    throw err;
  }
}
