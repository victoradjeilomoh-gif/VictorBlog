import type { Context } from '@netlify/functions';

// POST /api/login  → { ok: boolean }
// Verifies the admin password so the editor can gate its UI. The password is
// never returned; only a boolean result.

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') return json({ ok: false, error: 'Method not allowed.' }, 405);

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return json(
      { ok: false, error: 'ADMIN_PASSWORD is not set on the server. Add it in Netlify → Site settings → Environment variables.' },
      500,
    );
  }
  const given = req.headers.get('x-admin-password') || '';
  return json({ ok: given === expected });
};

export const config: Config = { path: '/api/login' };

type Config = { path: string | string[] };
