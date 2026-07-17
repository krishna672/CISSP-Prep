import { getStore } from '@netlify/blobs';
import crypto from 'crypto';
import { encrypt, decrypt } from './_shared/encryption';
import { createCandidateSession } from './_shared/candidateAuth';
import { checkRateLimit, rateLimitedResponse } from './_shared/rateLimit';

const BLOB_KEY = 'invite_codes';

// The actual candidate login transaction, done entirely server-side.
//
// IMPORTANT: same-device reuse is verified with a real cryptographic
// receipt, not a client-asserted boolean. A previous version trusted a
// client-supplied `alreadyRedeemedOnDevice` flag, which meant anyone could
// just claim "yes, already redeemed on this device" on every request and
// get unlimited sessions from a single leaked code. Now: on first
// redemption, the server generates a random receipt and hands it back to
// the client (which stores it encrypted). On any later login attempt, the
// client must present that exact receipt to be treated as a legitimate
// return visit -- a receipt that was never issued to it can't be forged.
export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // 20 attempts per 15 minutes per IP.
  const allowed = await checkRateLimit(event, 'redeem_invite_code', 20, 15 * 60 * 1000);
  if (!allowed) return rateLimitedResponse();

  try {
    const body = JSON.parse(event.body || '{}');
    const inputCode = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';
    const suppliedReceipt = typeof body.receipt === 'string' && body.receipt.length > 0 ? body.receipt : null;

    if (!inputCode) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, reason: 'invalid' }),
      };
    }

    const store = getStore({
      name: 'cissp-vault',
      siteID: process.env.SITE_ID,
      token: process.env.BLOBS_TOKEN,
    });

    const raw = await store.get(BLOB_KEY);
    const codes = raw ? JSON.parse(decrypt(raw)) : [];
    if (!Array.isArray(codes)) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, reason: 'invalid' }),
      };
    }

    const index = codes.findIndex((c: any) => c.code?.toUpperCase() === inputCode);
    if (index === -1) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, reason: 'invalid' }),
      };
    }

    const usedCount = codes[index].usedCount || 0;
    const storedReceipt: string | undefined = codes[index].redemptionReceipt;

    // A real return visit from the original device presents the exact
    // receipt it was issued. Anything else (missing, wrong, or a bare
    // claim with no receipt at all) is treated as a fresh redemption
    // attempt and subject to the one-use rule.
    const isVerifiedReturnVisit = Boolean(storedReceipt) && suppliedReceipt === storedReceipt;

    if (usedCount >= 1 && !isVerifiedReturnVisit) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, reason: 'already_used' }),
      };
    }

    const candidateName = codes[index].candidateName || `Candidate (${inputCode})`;
    let receiptToReturn = storedReceipt || null;

    if (!isVerifiedReturnVisit) {
      // First-ever redemption of this code: mint a new receipt and record it.
      receiptToReturn = crypto.randomBytes(32).toString('hex');
      codes[index].usedCount = usedCount + 1;
      codes[index].redemptionReceipt = receiptToReturn;
      await store.set(BLOB_KEY, encrypt(JSON.stringify(codes)));
    }

    const token = await createCandidateSession(inputCode, candidateName);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, candidateName, token, receipt: receiptToReturn }),
    };
  } catch (err) {
    console.error('redeem_invite_code (login) error:', err);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, reason: 'error' }),
    };
  }
};
