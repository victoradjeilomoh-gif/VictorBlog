import type { SiteContent } from './types';
import { defaultContent } from './defaultContent';

// Client for loading/saving site content and uploading images.
//
// In production on Netlify these call serverless functions backed by Netlify
// Blobs. When those functions are not available (e.g. a plain `npm run dev`
// without `netlify dev`), everything transparently falls back to localStorage
// and data-URL images so the admin is still fully usable for local testing.

const API = '/api';
const LS_CONTENT = 'val-site-content-v1';

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

// Deep-merge stored content onto the defaults so newly-added fields always have
// a value. Arrays (and any non-object) from the stored side replace wholesale.
function deepMerge<T>(base: T, override: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return (override === undefined ? base : (override as T));
  }
  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(override)) {
    out[key] = deepMerge((base as Record<string, unknown>)[key], override[key]);
  }
  return out as T;
}

function mergeContent(stored: unknown): SiteContent {
  return deepMerge(defaultContent, stored);
}

async function readJson(res: Response): Promise<unknown | null> {
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) return null; // e.g. vite returned index.html
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function readLocal(): SiteContent | null {
  try {
    const raw = localStorage.getItem(LS_CONTENT);
    if (raw) return mergeContent(JSON.parse(raw));
  } catch {
    /* ignore */
  }
  return null;
}

function writeLocal(content: SiteContent) {
  try {
    localStorage.setItem(LS_CONTENT, JSON.stringify(content));
  } catch {
    /* ignore quota / private mode */
  }
}

/** Load the current site content. Never throws — always resolves to content. */
export async function loadContent(): Promise<SiteContent> {
  try {
    const res = await fetch(`${API}/content`, { cache: 'no-store' });
    if (res.ok) {
      const data = (await readJson(res)) as { content?: unknown } | null;
      if (data && 'content' in data) {
        return data.content ? mergeContent(data.content) : defaultContent;
      }
    }
  } catch {
    /* function not reachable — fall through */
  }
  return readLocal() ?? defaultContent;
}

export type SaveResult = { ok: boolean; error?: string; local?: boolean };

/** Persist the full content document. Requires the admin password. */
export async function saveContent(content: SiteContent, password: string): Promise<SaveResult> {
  try {
    const res = await fetch(`${API}/content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify(content),
    });
    const data = (await readJson(res)) as { ok?: boolean; error?: string } | null;
    if (res.ok && data?.ok) {
      writeLocal(content);
      return { ok: true };
    }
    if (res.status === 401) return { ok: false, error: 'Incorrect password.' };
    if (data) return { ok: false, error: data.error || `Save failed (${res.status}).` };
    // Non-JSON response → function not deployed (plain vite dev). Fall back.
    writeLocal(content);
    return { ok: true, local: true };
  } catch {
    // Network/function unavailable → local fallback so dev editing still works.
    writeLocal(content);
    return { ok: true, local: true };
  }
}

/** Verify the admin password against the server (used by the login screen). */
export async function verifyPassword(password: string): Promise<{ ok: boolean; local?: boolean }> {
  try {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
    });
    const data = (await readJson(res)) as { ok?: boolean } | null;
    if (data && typeof data.ok === 'boolean') return { ok: data.ok };
    // No function (dev): accept any non-empty password locally.
    return { ok: password.trim().length > 0, local: true };
  } catch {
    return { ok: password.trim().length > 0, local: true };
  }
}

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

/** Upload an image and return a URL usable as an <img src>. */
export async function uploadImage(file: File, password: string): Promise<{ ok: boolean; url?: string; error?: string }> {
  const dataUrl = await fileToDataUrl(file);
  try {
    const res = await fetch(`${API}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ name: file.name, contentType: file.type, data: dataUrl }),
    });
    const data = (await readJson(res)) as { url?: string; error?: string } | null;
    if (res.ok && data?.url) return { ok: true, url: data.url };
    if (res.status === 401) return { ok: false, error: 'Incorrect password.' };
    if (data?.error) return { ok: false, error: data.error };
    // No function (dev) → embed the image directly as a data URL.
    return { ok: true, url: dataUrl };
  } catch {
    return { ok: true, url: dataUrl };
  }
}
