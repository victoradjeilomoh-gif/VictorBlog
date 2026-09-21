import type { Context } from '@netlify/functions';
import { verify } from './_auth.mts';

// POST /api/login  → { ok: boolean }
// Verifies the admin password (set via /api/auth). No password is ever returned.

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') return json({ ok: false, error: 'Method not allowed.' }, 405);
  const given = req.headers.get('x-admin-password') || '';
  return json({ ok: await verify(given) });
};

export const config: Config = { path: '/api/login' };

type Config = { path: string | string[] };
