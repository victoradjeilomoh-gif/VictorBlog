import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isConfigured, setPassword, verify } from './_lib/auth';

// GET  /api/auth  → { configured: boolean }   (has a password been set yet?)
// POST /api/auth  → set (first run) or change the admin password
//        first run: { password }            later: { password, current }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('cache-control', 'no-store');

  if (req.method === 'GET') {
    return res.status(200).json({ configured: await isConfigured() });
  }

  if (req.method === 'POST') {
    const body = (req.body || {}) as { password?: string; current?: string };
    const password = (body.password || '').trim();
    if (password.length < 6) {
      return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters.' });
    }
    if (await isConfigured()) {
      if (!(await verify(body.current || ''))) {
        return res.status(401).json({ ok: false, error: 'Current password is incorrect.' });
      }
    }
    await setPassword(password);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed.' });
}
