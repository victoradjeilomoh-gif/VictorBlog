import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { redis, AUTH_KEY } from './store';

// Admin-auth helper backed by Upstash Redis. The password is set on first run
// from the admin panel and stored only as a salted scrypt hash.

type AuthRecord = { salt: string; hash: string };

const hash = (password: string, salt: string) => scryptSync(password, salt, 64).toString('hex');

export async function isConfigured(): Promise<boolean> {
  const rec = (await redis.get<AuthRecord>(AUTH_KEY).catch(() => null)) as AuthRecord | null;
  return !!rec?.hash;
}

export async function setPassword(password: string): Promise<void> {
  const salt = randomBytes(16).toString('hex');
  await redis.set(AUTH_KEY, { salt, hash: hash(password, salt) } satisfies AuthRecord);
}

export async function verify(password: string): Promise<boolean> {
  if (!password) return false;
  const rec = (await redis.get<AuthRecord>(AUTH_KEY).catch(() => null)) as AuthRecord | null;

  // Fall back to an optional ADMIN_PASSWORD env var if none has been set yet.
  if (!rec?.hash || !rec?.salt) {
    const env = process.env.ADMIN_PASSWORD;
    return !!env && password === env;
  }

  const candidate = Buffer.from(hash(password, rec.salt), 'hex');
  const actual = Buffer.from(rec.hash, 'hex');
  return candidate.length === actual.length && timingSafeEqual(candidate, actual);
}
