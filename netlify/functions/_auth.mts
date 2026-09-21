import { getStore } from '@netlify/blobs';
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';

// Shared admin-auth helper (not a route — the leading underscore keeps Netlify
// from treating it as a function). The password is set on first run from the
// admin panel and stored only as a salted scrypt hash in Netlify Blobs.

const STORE = 'site';
const KEY = 'auth';

type AuthRecord = { salt: string; hash: string };

const hash = (password: string, salt: string) => scryptSync(password, salt, 64).toString('hex');

export async function isConfigured(): Promise<boolean> {
  const store = getStore(STORE);
  const rec = (await store.get(KEY, { type: 'json' }).catch(() => null)) as AuthRecord | null;
  return !!rec?.hash;
}

export async function setPassword(password: string): Promise<void> {
  const store = getStore(STORE);
  const salt = randomBytes(16).toString('hex');
  await store.setJSON(KEY, { salt, hash: hash(password, salt) } satisfies AuthRecord);
}

export async function verify(password: string): Promise<boolean> {
  if (!password) return false;
  const store = getStore(STORE);
  const rec = (await store.get(KEY, { type: 'json' }).catch(() => null)) as AuthRecord | null;

  // If no password has been set yet, fall back to an optional ADMIN_PASSWORD
  // env var (so an env var still works for anyone who prefers it).
  if (!rec?.hash || !rec?.salt) {
    const env = process.env.ADMIN_PASSWORD;
    return !!env && password === env;
  }

  const candidate = Buffer.from(hash(password, rec.salt), 'hex');
  const actual = Buffer.from(rec.hash, 'hex');
  return candidate.length === actual.length && timingSafeEqual(candidate, actual);
}
