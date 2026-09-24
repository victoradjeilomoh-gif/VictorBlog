import { getStore } from '@netlify/blobs';
import type { Context } from '@netlify/functions';
import { isConfigured, verify } from './_auth.mts';

// Contact-form enquiries ("leads") storage, same pattern as content.mts.
//
// GET    /api/leads          → { leads: [...] }   (admin password required)
// POST   /api/leads          → save one enquiry   (public — used by the site form)
// DELETE /api/leads?id=…     → delete one enquiry (admin password required)

const STORE = 'site';
const LEADS_KEY = 'leads';
const MAX_LEADS = 500;
const RATE_WINDOW_MS = 10_000;

type Lead = {
  id: string;
  at: number;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

// Strip control characters from form submissions (regex range is intentional).
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;

const clean = (v: unknown, max: number) =>
  String(v ?? '')
    .replace(CONTROL_CHARS, ' ')
    .trim()
    .slice(0, max);

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default async (req: Request, _context: Context) => {
  const store = getStore(STORE);

  if (req.method === 'GET') {
    const given = req.headers.get('x-admin-password') || '';
    if (!(await verify(given))) return json({ error: 'Incorrect password.' }, 401);
    const leads = (await store.get(LEADS_KEY, { type: 'json' }).catch(() => null)) as Lead[] | null;
    return json({ leads: leads ?? [] });
  }

  if (req.method === 'DELETE') {
    const given = req.headers.get('x-admin-password') || '';
    if (!(await verify(given))) return json({ error: 'Incorrect password.' }, 401);
    const id = new URL(req.url).searchParams.get('id') || '';
    const leads = ((await store.get(LEADS_KEY, { type: 'json' }).catch(() => null)) as Lead[] | null) ?? [];
    await store.setJSON(LEADS_KEY, leads.filter((l) => l.id !== id));
    return json({ ok: true });
  }

  if (req.method === 'POST') {
    // Basic abuse guard: without an admin password configured yet, refuse
    // submissions entirely (someone must own the site first).
    if (!(await isConfigured())) return json({ error: 'Site not set up yet.' }, 503);

    let body: Record<string, unknown> = {};
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return json({ error: 'Invalid JSON body.' }, 400);
    }

    const name = clean(body.name, 120);
    const email = clean(body.email, 160);
    const phone = clean(body.phone, 60);
    const service = clean(body.service, 120);
    const message = clean(body.message, 4000);

    if (!name) return json({ error: 'Please enter your name.' }, 400);
    if (!email && !phone) return json({ error: 'Please add an email or phone number.' }, 400);
    if (!message) return json({ error: 'Please write a short message.' }, 400);
    if (email && !isEmail(email)) return json({ error: 'That email address does not look right.' }, 400);

    // Rate limit per IP.
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';
    const now = Date.now();
    const rateKey = `lead-rate-${ip.replace(/[^a-zA-Z0-9]/g, '')}`;
    const last = Number((await store.get(rateKey).catch(() => '0')) ?? '0');
    if (last && now - last < RATE_WINDOW_MS) {
      return json({ error: 'You just sent a message — please wait a moment.' }, 429);
    }
    await store.set(rateKey, String(now));

    const lead: Lead = {
      id: `${now.toString(36)}${Math.random().toString(36).slice(2, 8)}`,
      at: now,
      name,
      email,
      phone,
      service,
      message,
    };
    const leads = ((await store.get(LEADS_KEY, { type: 'json' }).catch(() => null)) as Lead[] | null) ?? [];
    leads.unshift(lead);
    if (leads.length > MAX_LEADS) leads.length = MAX_LEADS;
    await store.setJSON(LEADS_KEY, leads);

    return json({ ok: true, id: lead.id });
  }

  return json({ error: 'Method not allowed.' }, 405);
};

export const config: Config = { path: '/api/leads' };

type Config = { path: string | string[] };
