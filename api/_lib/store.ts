import { Redis } from '@upstash/redis';

// Upstash Redis client (provisioned via the Vercel Marketplace "Upstash" / KV
// integration, which injects the connection env vars automatically). We read
// both the Vercel-KV and native Upstash variable names so either works.
export const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export const CONTENT_KEY = 'content';
export const AUTH_KEY = 'auth';
