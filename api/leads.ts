import type { VercelRequest, VercelResponse } from '@vercel/node';
import { redis } from './_lib/store';
import { verify, isConfigured } from './_lib/auth';

// Contact-form enquiries ("leads") storage, same pattern as content.ts.
//
// GET    /api/leads          → { leads: [...] }   (admin password required)
// POST   /api/leads          → save one enquiry   (public — used by the site form)
// DELETE /api/leads?id=…     → delete one enquiry (admin password required)

type Lead = {
  id: string;
  at: number; // epoch ms
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
};

const LEADS_KEY = 'leads';
const MAX_LEADS = 500; // keep storage tiny; newest kept, older drop off

// Rate limiting: one IP may submit every 10 seconds. Uses the same Redis store.
const RATE_WINDOW_MS = 10_000;
const RATE_KEY = 'lead-rate';

const json = (res: VercelResponse, status: number, body: unknown) =>
  res.status(status).json(body);

// Strip control characters from form submissions (regex range is intentional).
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;

const clean = (v: unknown, max: number) =>
  String(v ?? '')
    .replace(CONTROL_CHARS, ' ')
    .trim()
    .slice(0, max);

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('cache-control', 'no-store');

  if (req.method === 'GET') {
    const given = (req.headers['x-admin-password'] as string) || '';
    if (!(await verify(given))) return json(res, 401, { error: 'Incorrect password.' });
    const leads = (await redis.get<Lead[]>(LEADS_KEY).catch(() => null)) as Lead[] | null;
    return json(res, 200, { leads: leads ?? [] });
  }

  if (req.method === 'DELETE') {
    const given = (req.headers['x-admin-password'] as string) || '';
    if (!(await verify(given))) return json(res, 401, { error: 'Incorrect password.' });
    const id = String(req.query.id || '');
    const leads = ((await redis.get<Lead[]>(LEADS_KEY).catch(() => null)) as Lead[] | null) ?? [];
    const next = leads.filter((l) => l.id !== id);
    await redis.set(LEADS_KEY, next);
    return json(res, 200, { ok: true });
  }

  if (req.method === 'POST') {
    // Basic abuse guard: without an admin password configured yet, refuse
    // submissions entirely (someone must own the site first).
    if (!(await isConfigured())) return json(res, 503, { error: 'Site not set up yet.' });

    const body = (req.body || {}) as Record<string, unknown>;
    const name = clean(body.name, 120);
    const email = clean(body.email, 160);
    const phone = clean(body.phone, 60);
    const service = clean(body.service, 120);
    const message = clean(body.message, 4000);

    if (!name) return json(res, 400, { error: 'Please enter your name.' });
    if (!email && !phone) return json(res, 400, { error: 'Please add an email or phone number.' });
    if (!message) return json(res, 400, { error: 'Please write a short message.' });
    if (email && !isEmail(email)) return json(res, 400, { error: 'That email address does not look right.' });

    // Rate limit per IP.
    const ip =
      (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string | undefined) ||
      'unknown';
    const now = Date.now();
    const last = Number((await redis.get(`${RATE_KEY}:${ip}`).catch(() => 0)) ?? 0);
    if (last && now - last < RATE_WINDOW_MS) {
      return json(res, 429, { error: 'You just sent a message — please wait a moment.' });
    }
    await redis.set(`${RATE_KEY}:${ip}`, now);

    const lead: Lead = {
      id: `${now.toString(36)}${Math.random().toString(36).slice(2, 8)}`,
      at: now,
      name,
      email,
      phone,
      service,
      message,
    };
    const leads = ((await redis.get<Lead[]>(LEADS_KEY).catch(() => null)) as Lead[] | null) ?? [];
    leads.unshift(lead);
    if (leads.length > MAX_LEADS) leads.length = MAX_LEADS;
    await redis.set(LEADS_KEY, leads);

    return json(res, 200, { ok: true, id: lead.id });
  }

  return json(res, 405, { error: 'Method not allowed.' });
}
