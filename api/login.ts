import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verify } from './_lib/auth';

// POST /api/login  → { ok: boolean }   (verifies the admin password)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('cache-control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  const given = (req.headers['x-admin-password'] as string) || '';
  return res.status(200).json({ ok: await verify(given) });
}
