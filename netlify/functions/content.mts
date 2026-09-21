import { getStore } from '@netlify/blobs';
import type { Context } from '@netlify/functions';

// GET  /api/content  → { content: <SiteContent> | null }   (public)
// POST /api/content  → save the full content document        (password required)

const STORE = 'site';
const KEY = 'content';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

export default async (req: Request, _context: Context) => {
  const store = getStore(STORE);

  if (req.method === 'GET') {
    const content = await store.get(KEY, { type: 'json' }).catch(() => null);
    return json({ content: content ?? null });
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) {
      return json(
        { ok: false, error: 'ADMIN_PASSWORD is not set on the server. Add it in Netlify → Site settings → Environment variables.' },
        500,
      );
    }
    const given = req.headers.get('x-admin-password') || '';
    if (given !== expected) return json({ ok: false, error: 'Incorrect password.' }, 401);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return json({ ok: false, error: 'Invalid JSON body.' }, 400);
    }
    if (!body || typeof body !== 'object') {
      return json({ ok: false, error: 'Content must be an object.' }, 400);
    }
    await store.setJSON(KEY, body);
    return json({ ok: true });
  }

  return json({ ok: false, error: 'Method not allowed.' }, 405);
};

export const config: Config = { path: '/api/content' };

type Config = { path: string | string[] };
