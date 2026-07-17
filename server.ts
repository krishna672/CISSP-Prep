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

// Ensure data folder exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Pre-populate system defaults if not existing
const DEFAULT_ADMIN_PASSCODE = 'ADMIN2026';

// Initialize files if empty. Note: the invite code registry intentionally
// starts empty -- no default invite code is seeded. An admin must
// explicitly create codes from the Admin Panel.
readSecureFile('secure_leaderboard.enc', '[]');
readSecureFile('secure_invite_codes.enc', '[]');
readSecureFile('secure_admin_passcode.enc', DEFAULT_ADMIN_PASSCODE);

// API Routes
// 1. Leaderboard
app.get('/api/leaderboard', (req, res) => {
  try {
    const data = readSecureFile('secure_leaderboard.enc', '[]');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (err) {
    console.error('API Error leaderboard GET:', err);
    res.status(500).json({ error: 'Failed to retrieve leaderboard' });
  }
});

app.put('/api/leaderboard', (req, res) => {
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

// 2. Invite Codes
app.get('/api/invite_codes', (req, res) => {
  try {
    const data = readSecureFile('secure_invite_codes.enc', '[]');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (err) {
    console.error('API Error invite_codes GET:', err);
    res.status(500).json({ error: 'Failed to retrieve invite codes' });
  }
});

app.put('/api/invite_codes', (req, res) => {
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

// 3. Admin Passcode
app.get('/api/admin_passcode', (req, res) => {
  try {
    const data = readSecureFile('secure_admin_passcode.enc', DEFAULT_ADMIN_PASSCODE);
    res.setHeader('Content-Type', 'text/plain');
    res.send(data);
  } catch (err) {
    console.error('API Error admin_passcode GET:', err);
    res.status(500).send('Failed to retrieve admin passcode');
  }
});

app.put('/api/admin_passcode', (req, res) => {
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

// 3b. Admin passcode verification (never returns the actual passcode)
app.post('/api/verify_admin', (req, res) => {
  try {
    const candidate = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
    const actualPasscode = readSecureFile('secure_admin_passcode.enc', DEFAULT_ADMIN_PASSCODE);
    const isAdmin = candidate.length > 0 && candidate === actualPasscode;
    res.setHeader('Content-Type', 'application/json');
    res.json({ isAdmin });
  } catch (err) {
    console.error('API Error verify_admin POST:', err);
    res.status(200).json({ isAdmin: false });
  }
});

// 4. Custom Questions (admin-added questions, shared across all candidates)
app.get('/api/custom_questions', (req, res) => {
  try {
    const data = readSecureFile('secure_custom_questions.enc', '[]');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (err) {
    console.error('API Error custom_questions GET:', err);
    res.status(500).json({ error: 'Failed to retrieve custom questions' });
  }
});

app.put('/api/custom_questions', (req, res) => {
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

// 5. Deleted (blacklisted) default question IDs
app.get('/api/deleted_question_ids', (req, res) => {
  try {
    const data = readSecureFile('secure_deleted_question_ids.enc', '[]');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (err) {
    console.error('API Error deleted_question_ids GET:', err);
    res.status(500).json({ error: 'Failed to retrieve deleted question IDs' });
  }
});

app.put('/api/deleted_question_ids', (req, res) => {
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

// 6. Question visibility settings (which pool of questions candidates see)
const DEFAULT_QUESTION_VISIBILITY = JSON.stringify({ mode: 'default', selectedIds: [] });

app.get('/api/question_visibility', (req, res) => {
  try {
    const data = readSecureFile('secure_question_visibility.enc', DEFAULT_QUESTION_VISIBILITY);
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (err) {
    console.error('API Error question_visibility GET:', err);
    res.status(500).json({ error: 'Failed to retrieve question visibility settings' });
  }
});

app.put('/api/question_visibility', (req, res) => {
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
    // Since Express v5 is used, we must use '*all' as specified in framework guide
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
