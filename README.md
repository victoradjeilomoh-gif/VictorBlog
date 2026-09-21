# Victor Adjei Lomoh — Artist & Illustrator

A portfolio website with a built-in admin panel. Every image and detail on the
front page can be edited from the admin, and edits persist server-side so they
show to all visitors instantly. Deploys to **Vercel** (primary) or **Netlify**.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173  (admin at /#admin)
npm run build      # production build
```

## Editing content & going live

See **[ADMIN-AND-DEPLOY.md](ADMIN-AND-DEPLOY.md)** for:

- how to use the admin (`/#admin`) to edit text, images, portfolio, services,
  contact details, the QR code and social links,
- deploying to Vercel (add Vercel Blob + Upstash KV storage), or Netlify,
- the first-run admin password (no environment variable to set).

## How it's built

| Area | Details |
| :--- | :--- |
| Framework | Vite + React 19 + TypeScript |
| Styling | Tailwind CSS v4 + custom theme (`src/index.css`) |
| Content model | `src/content/types.ts`, defaults in `src/content/defaultContent.ts` |
| Content API (client) | `src/content/api.ts` — talks to `/api/*`, downscales images, falls back to localStorage in dev |
| Backend (Vercel) | `api/` — `content`, `auth`, `login`, `media`; storage = Upstash Redis (content + password) + Vercel Blob (images) |
| Backend (Netlify) | `netlify/functions/` — same endpoints; storage = Netlify Blobs |
| Admin login | Password set on first run at `/#admin`, stored hashed — no env var needed |
| Front page | `src/App.tsx` (renders entirely from content) |
| Admin editor | `src/Admin.tsx` |

Both backends expose the same `/api/*` routes, so the React app is identical on
either host; each platform runs only its own functions.

## Project structure

```
src/
  App.tsx              # public site, rendered from content
  Admin.tsx            # password-gated editor (/#admin)
  content/
    types.ts           # SiteContent model
    defaultContent.ts  # starting/fallback content
    api.ts             # load / save / uploadImage (+ image downscaling)
  components/
    SocialIcon.tsx     # inline brand SVG icons

api/                   # Vercel backend
  content.ts           # GET/POST site content (Upstash Redis)
  auth.ts              # first-run set / change admin password
  login.ts             # verify admin password
  media.ts             # image upload → Vercel Blob (returns public URL)
  _lib/                # shared Redis client + auth helpers
vercel.json            # Vercel build + SPA config

netlify/functions/     # Netlify backend (same endpoints, Netlify Blobs)
  content.mts  media.mts  auth.mts  login.mts  _auth.mts
netlify.toml
```
