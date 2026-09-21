# Victor Adjei Lomoh — Artist & Illustrator

A portfolio website with a built-in admin panel. Every image and detail on the
front page can be edited from the admin, and edits persist on Netlify (via
Netlify Functions + Netlify Blobs) so they show to all visitors instantly.

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
- deploying to Netlify,
- setting the `ADMIN_PASSWORD` environment variable that protects the admin.

## How it's built

| Area | Details |
| :--- | :--- |
| Framework | Vite + React 19 + TypeScript |
| Styling | Tailwind CSS v4 + custom theme (`src/index.css`) |
| Content model | `src/content/types.ts`, defaults in `src/content/defaultContent.ts` |
| Content API (client) | `src/content/api.ts` — talks to functions, falls back to localStorage in dev |
| Serverless | `netlify/functions/` — `content`, `media` (image upload/serve), `auth`/`login` (password) |
| Storage | Netlify Blobs (`site` = content JSON + password hash, `media` = uploaded images) |
| Admin login | Password set on first run at `/#admin`; stored hashed in Blobs — no env var needed |
| Front page | `src/App.tsx` (renders entirely from content) |
| Admin editor | `src/Admin.tsx` |

## Project structure

```
src/
  App.tsx              # public site, rendered from content
  Admin.tsx            # password-gated editor (/#admin)
  content/
    types.ts           # SiteContent model
    defaultContent.ts  # starting/fallback content
    api.ts             # load / save / uploadImage
  components/
    SocialIcon.tsx     # inline brand SVG icons
netlify/functions/
  content.mts          # GET/POST site content (Netlify Blobs)
  media.mts            # upload + serve images (Netlify Blobs)
  auth.mts             # first-run set / change admin password
  login.mts            # verify admin password
  _auth.mts            # shared password hashing/verification helper
netlify.toml           # build + SPA config
```
