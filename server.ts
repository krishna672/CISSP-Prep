import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Setup JSON and text body parsers
app.use(express.json());
app.use(express.text({ type: 'text/plain' }));

// Encryption configuration
const ENCRYPTION_KEY = Buffer.from('c1sspm1ndmapandqu1zmaster2026sec', 'utf-8'); // Must be exactly 32 bytes
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text: string): string {
  const textParts = text.split(':');
  if (textParts.length < 2) {
    throw new Error('Invalid encrypted format');
  }
  const iv = Buffer.from(textParts.shift() || '', 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText).toString('utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function getFilePath(filename: string): string {
  return path.join(process.cwd(), 'data', filename);
}

function readSecureFile(filename: string, defaultValue: string): string {
  const filePath = getFilePath(filename);
  if (!fs.existsSync(filePath)) {
    writeSecureFile(filename, defaultValue);
    return defaultValue;
  }
  try {
    const encryptedContent = fs.readFileSync(filePath, 'utf8').trim();
    if (!encryptedContent) return defaultValue;
    return decrypt(encryptedContent);
  } catch (error) {
    console.error(`Error reading or decrypting file ${filename}:`, error);
    return defaultValue;
  }
}

function writeSecureFile(filename: string, content: string): void {
  const filePath = getFilePath(filename);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  try {
    const encryptedContent = encrypt(content);
    fs.writeFileSync(filePath, encryptedContent, 'utf8');
  } catch (error) {
    console.error(`Error encrypting or writing file ${filename}:`, error);
  }
}

// ----------------------------------------------------
// Session enforcement (mirrors netlify/functions/_shared/*.ts)
// ----------------------------------------------------
const ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
const CANDIDATE_SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

const adminSessions = new Map<string, number>(); // token -> expiresAt
const candidateSessions = new Map<string, { code: string; candidateName: string; expiresAt: number }>();

function createAdminSession(): string {
  const token = crypto.randomBytes(32).toString('hex');
  adminSessions.set(token, Date.now() + ADMIN_SESSION_TTL_MS);
  return token;
}

function isValidAdminSession(token: string | undefined): boolean {
  if (!token) return false;
  const expiresAt = adminSessions.get(token);
  if (!expiresAt) return false;
  if (expiresAt < Date.now()) {
    adminSessions.delete(token);
    return false;
  }
  return true;
}

function createCandidateSession(code: string, candidateName: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  candidateSessions.set(token, { code, candidateName, expiresAt: Date.now() + CANDIDATE_SESSION_TTL_MS });
  return token;
}

function getCandidateSession(token: string | undefined): { code: string; candidateName: string } | null {
  if (!token) return null;
  const entry = candidateSessions.get(token);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    candidateSessions.delete(token);
    return null;
  }
  return { code: entry.code, candidateName: entry.candidateName };
}

function extractAdminToken(req: express.Request): string | undefined {
  const header = req.headers['authorization'];
  if (!header || typeof header !== 'string') return undefined;
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1] : undefined;
}

function extractCandidateToken(req: express.Request): string | undefined {
  const header = req.headers['x-candidate-session'];
  return typeof header === 'string' ? header : undefined;
}

interface AuthContext {
  isAdmin: boolean;
  candidateCode?: string;
  candidateName?: string;
}

function getAuthContext(req: express.Request): AuthContext | null {
  if (isValidAdminSession(extractAdminToken(req))) {
    return { isAdmin: true };
  }
  const candidateSession = getCandidateSession(extractCandidateToken(req));
  if (candidateSession) {
    return { isAdmin: false, candidateCode: candidateSession.code, candidateName: candidateSession.candidateName };
  }
  return null;
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!isValidAdminSession(extractAdminToken(req))) {
    res.status(401).json({ error: 'Unauthorized: valid admin session required.' });
    return;
  }
  next();
}

function requireAuthenticated(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!getAuthContext(req)) {
    res.status(401).json({ error: 'Unauthorized: valid session required.' });
    return;
  }
  next();
}

// Ensure data folder exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Pre-populate system defaults if not existing
const DEFAULT_ADMIN_PASSCODE = 'ADMIN2026';

readSecureFile('secure_leaderboard.enc', '[]');
readSecureFile('secure_invite_codes.enc', '[]');
readSecureFile('secure_admin_passcode.enc', DEFAULT_ADMIN_PASSCODE);

// API Routes
app.get('/api/leaderboard', requireAuthenticated, (req, res) => {
  try {
    const data = readSecureFile('secure_leaderboard.enc', '[]');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (err) {
    console.error('API Error leaderboard GET:', err);
    res.status(500).json({ error: 'Failed to retrieve leaderboard' });
  }
});

app.post('/api/leaderboard', (req, res) => {
  const ctx = getAuthContext(req);
  if (!ctx) {
    res.status(401).json({ error: 'Unauthorized: valid session required.' });
    return;
  }
  try {
    const newEntry = req.body;
    if (!newEntry || typeof newEntry.id !== 'string' || newEntry.id.startsWith('mock-')) {
      res.status(400).json({ error: 'Invalid entry' });
      return;
    }
    if (ctx.isAdmin) {
      newEntry.code = newEntry.code || 'ADMIN';
      newEntry.name = newEntry.name || 'System Administrator';
    } else {
      newEntry.code = ctx.candidateCode;
      newEntry.name = ctx.candidateName;
    }
    const existingRaw = readSecureFile('secure_leaderboard.enc', '[]');
    const existing = JSON.parse(existingRaw);
    const entries = Array.isArray(existing) ? existing : [];
    const updated = [newEntry, ...entries.filter((e: any) => e.id !== newEntry.id)];
    writeSecureFile('secure_leaderboard.enc', JSON.stringify(updated));
    res.setHeader('Content-Type', 'application/json');
    res.json(updated);
  } catch (err) {
    console.error('API Error leaderboard POST:', err);
    res.status(500).json({ error: 'Failed to submit leaderboard entry' });
  }
});

app.put('/api/leaderboard', requireAdmin, (req, res) => {
  try {
    const bodyStr = JSON.stringify(req.body);
    writeSecureFile('secure_leaderboard.enc', bodyStr);
    res.setHeader('Content-Type', 'application/json');
    res.send(bodyStr);
  } catch (err) {
    console.error('API Error leaderboard PUT:', err);
    res.status(500).json({ error: 'Failed to save leaderboard' });
  }
});

app.get('/api/invite_codes', requireAdmin, (req, res) => {
  try {
    const data = readSecureFile('secure_invite_codes.enc', '[]');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (err) {
    console.error('API Error invite_codes GET:', err);
    res.status(500).json({ error: 'Failed to retrieve invite codes' });
  }
});

app.put('/api/invite_codes', requireAdmin, (req, res) => {
  try {
    const bodyStr = JSON.stringify(req.body);
    writeSecureFile('secure_invite_codes.enc', bodyStr);
    res.setHeader('Content-Type', 'application/json');
    res.send(bodyStr);
  } catch (err) {
    console.error('API Error invite_codes PUT:', err);
    res.status(500).json({ error: 'Failed to save invite codes' });
  }
});

app.post('/api/verify_invite_code', (req, res) => {
  try {
    const inputCode = typeof req.body?.code === 'string' ? req.body.code.trim().toUpperCase() : '';
    if (!inputCode) {
      res.json({ valid: false });
      return;
    }
    const codes = JSON.parse(readSecureFile('secure_invite_codes.enc', '[]'));
    const match = Array.isArray(codes) ? codes.find((c: any) => c.code?.toUpperCase() === inputCode) : null;
    if (!match) {
      res.json({ valid: false });
      return;
    }
    res.json({ valid: true, usedCount: match.usedCount || 0, candidateName: match.candidateName || null });
  } catch (err) {
    console.error('API Error verify_invite_code POST:', err);
    res.json({ valid: false });
  }
});

app.post('/api/redeem_invite_code', (req, res) => {
  try {
    const inputCode = typeof req.body?.code === 'string' ? req.body.code.trim().toUpperCase() : '';
    const alreadyRedeemedOnDevice = Boolean(req.body?.alreadyRedeemedOnDevice);

    if (!inputCode) {
      res.json({ success: false, reason: 'invalid' });
      return;
    }
    const codes = JSON.parse(readSecureFile('secure_invite_codes.enc', '[]'));
    if (!Array.isArray(codes)) {
      res.json({ success: false, reason: 'invalid' });
      return;
    }
    const index = codes.findIndex((c: any) => c.code?.toUpperCase() === inputCode);
    if (index === -1) {
      res.json({ success: false, reason: 'invalid' });
      return;
    }

    const usedCount = codes[index].usedCount || 0;
    if (usedCount >= 1 && !alreadyRedeemedOnDevice) {
      res.json({ success: false, reason: 'already_used' });
      return;
    }

    const candidateName = codes[index].candidateName || `Candidate (${inputCode})`;

    if (!alreadyRedeemedOnDevice) {
      codes[index].usedCount = usedCount + 1;
      writeSecureFile('secure_invite_codes.enc', JSON.stringify(codes));
    }

    const token = createCandidateSession(inputCode, candidateName);
    res.json({ success: true, candidateName, token });
  } catch (err) {
    console.error('API Error redeem_invite_code POST:', err);
    res.json({ success: false, reason: 'error' });
  }
});

app.post('/api/logout_candidate', (req, res) => {
  const token = extractCandidateToken(req);
  if (token) candidateSessions.delete(token);
  res.json({ ok: true });
});

app.get('/api/admin_passcode', requireAdmin, (req, res) => {
  try {
    const data = readSecureFile('secure_admin_passcode.enc', DEFAULT_ADMIN_PASSCODE);
    res.setHeader('Content-Type', 'text/plain');
    res.send(data);
  } catch (err) {
    console.error('API Error admin_passcode GET:', err);
    res.status(500).send('Failed to retrieve admin passcode');
  }
});

app.put('/api/admin_passcode', requireAdmin, (req, res) => {
  try {
    const passcode = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    writeSecureFile('secure_admin_passcode.enc', passcode.trim());
    res.setHeader('Content-Type', 'text/plain');
    res.send(passcode);
  } catch (err) {
    console.error('API Error admin_passcode PUT:', err);
    res.status(500).send('Failed to save admin passcode');
  }
});

app.post('/api/verify_admin', (req, res) => {
  try {
    const candidate = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
    const actualPasscode = readSecureFile('secure_admin_passcode.enc', DEFAULT_ADMIN_PASSCODE);
    const isAdmin = candidate.length > 0 && candidate === actualPasscode;
    const token = isAdmin ? createAdminSession() : null;
    res.setHeader('Content-Type', 'application/json');
    res.json({ isAdmin, token });
  } catch (err) {
    console.error('API Error verify_admin POST:', err);
    res.status(200).json({ isAdmin: false, token: null });
  }
});

app.post('/api/logout_admin', (req, res) => {
  const token = extractAdminToken(req);
  if (token) adminSessions.delete(token);
  res.json({ ok: true });
});

app.get('/api/custom_questions', requireAuthenticated, (req, res) => {
  try {
    const data = readSecureFile('secure_custom_questions.enc', '[]');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (err) {
    console.error('API Error custom_questions GET:', err);
    res.status(500).json({ error: 'Failed to retrieve custom questions' });
  }
});

app.put('/api/custom_questions', requireAdmin, (req, res) => {
  try {
    const bodyStr = JSON.stringify(req.body);
    writeSecureFile('secure_custom_questions.enc', bodyStr);
    res.setHeader('Content-Type', 'application/json');
    res.send(bodyStr);
  } catch (err) {
    console.error('API Error custom_questions PUT:', err);
    res.status(500).json({ error: 'Failed to save custom questions' });
  }
});

app.get('/api/deleted_question_ids', requireAuthenticated, (req, res) => {
  try {
    const data = readSecureFile('secure_deleted_question_ids.enc', '[]');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (err) {
    console.error('API Error deleted_question_ids GET:', err);
    res.status(500).json({ error: 'Failed to retrieve deleted question IDs' });
  }
});

app.put('/api/deleted_question_ids', requireAdmin, (req, res) => {
  try {
    const bodyStr = JSON.stringify(req.body);
    writeSecureFile('secure_deleted_question_ids.enc', bodyStr);
    res.setHeader('Content-Type', 'application/json');
    res.send(bodyStr);
  } catch (err) {
    console.error('API Error deleted_question_ids PUT:', err);
    res.status(500).json({ error: 'Failed to save deleted question IDs' });
  }
});

const DEFAULT_QUESTION_VISIBILITY = JSON.stringify({ mode: 'default', selectedIds: [] });

app.get('/api/question_visibility', requireAuthenticated, (req, res) => {
  try {
    const data = readSecureFile('secure_question_visibility.enc', DEFAULT_QUESTION_VISIBILITY);
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (err) {
    console.error('API Error question_visibility GET:', err);
    res.status(500).json({ error: 'Failed to retrieve question visibility settings' });
  }
});

app.put('/api/question_visibility', requireAdmin, (req, res) => {
  try {
    const bodyStr = JSON.stringify(req.body);
    writeSecureFile('secure_question_visibility.enc', bodyStr);
    res.setHeader('Content-Type', 'application/json');
    res.send(bodyStr);
  } catch (err) {
    console.error('API Error question_visibility PUT:', err);
    res.status(500).json({ error: 'Failed to save question visibility settings' });
  }
});

const DEFAULT_MINDMAP_OVERRIDES = JSON.stringify({ edits: {}, added: [] });

app.get('/api/mindmap_overrides', requireAuthenticated, (req, res) => {
  try {
    const data = readSecureFile('secure_mindmap_overrides.enc', DEFAULT_MINDMAP_OVERRIDES);
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (err) {
    console.error('API Error mindmap_overrides GET:', err);
    res.status(500).json({ error: 'Failed to retrieve mind map overrides' });
  }
});

app.put('/api/mindmap_overrides', requireAdmin, (req, res) => {
  try {
    const bodyStr = JSON.stringify(req.body);
    writeSecureFile('secure_mindmap_overrides.enc', bodyStr);
    res.setHeader('Content-Type', 'application/json');
    res.send(bodyStr);
  } catch (err) {
    console.error('API Error mindmap_overrides PUT:', err);
    res.status(500).json({ error: 'Failed to save mind map overrides' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
