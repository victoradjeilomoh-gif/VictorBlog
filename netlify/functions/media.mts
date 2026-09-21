import { getStore } from '@netlify/blobs';
import type { Context } from '@netlify/functions';
import { verify } from './_auth.mts';

// POST /api/media          → upload an image  (password required)
//        body: { name, contentType, data: "data:<type>;base64,<...>" }
//        returns: { url: "/api/media/<key>" }
// GET  /api/media/:key     → serve the stored image                 (public)

const STORE = 'media';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

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

export default async (req: Request, context: Context) => {
  const store = getStore(STORE);
  const key = (context.params as Record<string, string> | undefined)?.key;

  if (req.method === 'GET') {
    if (!key) return json({ error: 'Missing key.' }, 400);
    const blob = await store.getWithMetadata(key, { type: 'arrayBuffer' }).catch(() => null);
    if (!blob) return new Response('Not found', { status: 404 });
    const contentType = (blob.metadata?.contentType as string) || 'application/octet-stream';
    return new Response(blob.data, {
      status: 200,
      headers: {
        'content-type': contentType,
        'cache-control': 'public, max-age=31536000, immutable',
      },
    });
  }

  if (req.method === 'POST') {
    const given = req.headers.get('x-admin-password') || '';
    if (!(await verify(given))) return json({ error: 'Incorrect password.' }, 401);

    let body: { name?: string; contentType?: string; data?: string };
    try {
      body = await req.json();
    } catch {
      return json({ error: 'Invalid JSON body.' }, 400);
    }
    const data = body.data || '';
    const match = /^data:([^;]+);base64,(.*)$/s.exec(data);
    if (!match) return json({ error: 'Expected a base64 data URL.' }, 400);

    const contentType = body.contentType || match[1] || 'application/octet-stream';
    if (!contentType.startsWith('image/')) return json({ error: 'Only image uploads are allowed.' }, 400);

    const bytes = Buffer.from(match[2], 'base64');
    if (bytes.byteLength > 8 * 1024 * 1024) return json({ error: 'Image is larger than 8 MB.' }, 413);

    const id = (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`).replace(/-/g, '');
    const storeKey = `${id}.${extFor(contentType)}`;
    await store.set(storeKey, bytes, { metadata: { contentType, name: body.name || '' } });

    return json({ url: `/api/media/${storeKey}` });
  }

  return json({ error: 'Method not allowed.' }, 405);
};

export const config: Config = { path: ['/api/media', '/api/media/:key'] };

type Config = { path: string | string[] };
