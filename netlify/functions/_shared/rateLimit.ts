import { getStore } from '@netlify/blobs';

// Lightweight sliding-window rate limiter backed by Netlify Blobs. Netlify
// doesn't rate-limit Functions by default, and these particular endpoints
// (passcode checks, invite code checks/redemption) are exactly the ones an
// attacker would want to hammer -- so they get their own throttling here.

function getBlobStore() {
  return getStore({
    name: 'cissp-vault',
    siteID: process.env.SITE_ID,
    token: process.env.BLOBS_TOKEN,
  });
}

function getClientIp(event: any): string {
  const header =
    event.headers?.['x-nf-client-connection-ip'] ||
    event.headers?.['x-forwarded-for'] ||
    'unknown';
  const value = Array.isArray(header) ? header[0] : String(header);
  return value.split(',')[0].trim();
}

// Returns true if the request is allowed to proceed, false if it should be
// rejected with 429. `bucket` namespaces the limit per endpoint (e.g.
// "verify_admin") so different endpoints don't share the same budget.
export async function checkRateLimit(
  event: any,
  bucket: string,
  maxAttempts: number,
  windowMs: number
): Promise<boolean> {
  const ip = getClientIp(event);
  const key = `ratelimit_${bucket}_${ip}`;
  const store = getBlobStore();
  const now = Date.now();

  let attempts: number[] = [];
  try {
    const raw = await store.get(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) attempts = parsed;
    }
  } catch {
    attempts = [];
  }

  attempts = attempts.filter(t => now - t < windowMs);

  if (attempts.length >= maxAttempts) {
    return false;
  }

  attempts.push(now);
  try {
    await store.set(key, JSON.stringify(attempts));
  } catch {
    // If we can't persist the counter, fail open rather than blocking
    // legitimate traffic over a transient storage error.
  }
  return true;
}

export function rateLimitedResponse(): { statusCode: number; body: string } {
  return {
    statusCode: 429,
    body: JSON.stringify({ error: 'Too many attempts. Please wait a few minutes and try again.' }),
  };
}
