import type { VercelRequest, VercelResponse } from '@vercel/node';
import { redis, CONTENT_KEY } from './_lib/store';
import { verify } from './_lib/auth';

// GET  /api/content  → { content: <SiteContent> | null }   (public)
// POST /api/content  → save the full content document        (password required)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('cache-control', 'no-store');

  if (req.method === 'GET') {
    const content = await redis.get(CONTENT_KEY).catch(() => null);
    return res.status(200).json({ content: content ?? null });
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    const given = (req.headers['x-admin-password'] as string) || '';
    if (!(await verify(given))) return res.status(401).json({ ok: false, error: 'Incorrect password.' });

    const body = req.body;
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ ok: false, error: 'Content must be an object.' });
    }
    await redis.set(CONTENT_KEY, body);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed.' });
}
