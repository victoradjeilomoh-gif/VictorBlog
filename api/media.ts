import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';
import { verify } from './_lib/auth';

// POST /api/media  → upload an image to Vercel Blob (password required)
//        body: { name, contentType, data: "data:<type>;base64,<...>" }
//        returns: { url } — a public Blob URL used directly as <img src>

const extFor = (type: string) =>
  ({
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'image/avif': 'avif',
  }[type] || 'bin');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('cache-control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const given = (req.headers['x-admin-password'] as string) || '';
  if (!(await verify(given))) return res.status(401).json({ error: 'Incorrect password.' });

  const body = (req.body || {}) as { name?: string; contentType?: string; data?: string };
  const match = /^data:([^;]+);base64,(.*)$/s.exec(body.data || '');
  if (!match) return res.status(400).json({ error: 'Expected a base64 data URL.' });

  const contentType = body.contentType || match[1] || 'application/octet-stream';
  if (!contentType.startsWith('image/')) return res.status(400).json({ error: 'Only image uploads are allowed.' });

  const bytes = Buffer.from(match[2], 'base64');
  // Serverless request bodies are capped ~4.5 MB; the client downscales images
  // before upload, so this is just a safety net.
  if (bytes.byteLength > 4 * 1024 * 1024) {
    return res.status(413).json({ error: 'Image is too large. Please use a smaller image.' });
  }

  const id = `${Date.now().toString(36)}${Math.random().toString(16).slice(2, 8)}`;
  const blob = await put(`media/${id}.${extFor(contentType)}`, bytes, {
    access: 'public',
    contentType,
    addRandomSuffix: false,
  });

  return res.status(200).json({ url: blob.url });
}
