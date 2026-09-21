import type { Context } from '@netlify/functions';
import { isConfigured, setPassword, verify } from './_auth.mts';

// GET  /api/auth  → { configured: boolean }   (has a password been set yet?)
// POST /api/auth  → set or change the admin password
//        first run (none set): { password }               → sets it
//        later (changing):     { password, current }      → verifies current, then sets

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

export default async (req: Request, _context: Context) => {
  if (req.method === 'GET') {
    return json({ configured: await isConfigured() });
  }

  if (req.method === 'POST') {
    let body: { password?: string; current?: string };
    try {
      body = await req.json();
    } catch {
      return json({ ok: false, error: 'Invalid request.' }, 400);
    }
    const password = (body.password || '').trim();
    if (password.length < 6) {
      return json({ ok: false, error: 'Password must be at least 6 characters.' }, 400);
    }

    const configured = await isConfigured();
    if (configured) {
      // Changing an existing password requires the current one.
      if (!(await verify(body.current || ''))) {
        return json({ ok: false, error: 'Current password is incorrect.' }, 401);
      }
    }
    await setPassword(password);
    return json({ ok: true });
  }

  return json({ ok: false, error: 'Method not allowed.' }, 405);
};

export const config: Config = { path: '/api/auth' };

type Config = { path: string | string[] };
