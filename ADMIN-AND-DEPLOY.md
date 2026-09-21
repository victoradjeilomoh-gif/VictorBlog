# Editing the site & deploying

The website is fully editable from a built-in admin panel. Every image and every
piece of text on the front page can be changed there, and changes go live
immediately.

The site runs on **Vercel** (the primary setup below). It can also run on Netlify
— see the note at the end.

---

## 1. How the admin works

- Open the admin by adding **`#admin`** to the site address, e.g.
  `https://your-site.vercel.app/#admin`
- **The very first time**, you'll be asked to **create an admin password** (see
  step 4). After that, you just sign in with it.
- Use the left-hand menu to edit each part of the site:
  - **Brand & menu** – site title/SEO, logo monogram, navigation links, marquee, footer
  - **Hero** – the big opening headline, intro and featured image
  - **Portfolio** – add / edit / delete / reorder pieces, upload artwork, set categories
  - **Services** – the service cards, images and "what's included" lists
  - **About**, **Process** – the wording of those sections
  - **Contact & QR** – email, WhatsApp, location and the "Scan to save my contact" QR image
  - **Social links** – Facebook, Instagram, etc. (the icon is chosen from the platform)
- **Uploading images:** in any image field click **Upload image** and pick a file.
  Large photos are automatically downscaled in your browser before upload, then
  stored with your site and the field fills in automatically. You can also paste
  an image URL instead.
- Press **Save changes** (top right); the live site updates immediately.
- **Change password** and **Sign out** are at the bottom of the left menu.

> The developer credit in the footer is fixed and not editable from the admin.

---

## 2. Deploy to Vercel (first time)

1. Push this project (the `Victor/` folder's repo) to GitHub.
2. In Vercel: **Add New… → Project**, import the repo. Vercel auto-detects Vite;
   `vercel.json` already sets the build command (`npm run build`) and output
   (`dist`). Click **Deploy**.

---

## 3. Add storage (one-time, from the Vercel dashboard)

The admin needs two storage products. Both are created inside Vercel and
**inject their own environment variables automatically — you don't type any.**

1. **Vercel Blob** (stores uploaded images)
   - Project → **Storage → Create Database → Blob** → connect it to this project.
   - This adds `BLOB_READ_WRITE_TOKEN` automatically.
2. **Upstash Redis / KV** (stores the site content + the admin password hash)
   - Project → **Storage → Marketplace → Upstash (Redis)** → create → connect to
     this project.
   - This adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` (or the `UPSTASH_…`
     equivalents) automatically.
3. **Redeploy** the project (Deployments → ⋯ → Redeploy) so the functions pick up
   the new variables.

Both have free tiers that are ample for a portfolio site.

---

## 4. Set the admin password (first run)

Nothing to configure — once deployed:

1. Go to `https://your-site.vercel.app/#admin`.
2. You'll see **"Create admin password"** — choose one (min 6 characters) and
   confirm. You're in.
3. From then on that page shows a normal sign-in.

The password is stored only as a **salted hash** in the Redis store — never in the
code, never in plain text. Change it later with **Change password** in the admin.

---

## 5. Local development

- `npm run dev` – runs the site at `http://localhost:5173`.
  There's no backend in this mode, so the admin saves to your **browser only**
  (localStorage) — handy for previewing edits. The first-run password screen
  still works (stored locally in the browser).
- `npm run build` – production build (type-checks and bundles).
- To test the real backend locally, use the Vercel CLI: `vercel link` then
  `vercel dev` (it pulls the Blob/KV env vars from your linked project).

---

## 6. Where everything lives

- **Default content** ships in `src/content/defaultContent.ts` — what a brand-new
  site shows before any edits are saved.
- **Front end** – `src/App.tsx` renders the whole page from the content; the
  admin editor is `src/Admin.tsx`. The client talks to `/api/*` (see
  `src/content/api.ts`).
- **Vercel backend** – `api/` : `content.ts`, `auth.ts`, `login.ts`, `media.ts`
  (+ shared `api/_lib/`). Content & password in Upstash Redis; images in Vercel
  Blob (public URLs). Config in `vercel.json`.

---

## Running on Netlify instead

The repo also ships a Netlify backend (`netlify/functions/` + `netlify.toml`)
using Netlify Functions + Netlify Blobs. If you deploy to Netlify instead of
Vercel, it works the same way (first-run password at `/#admin`), and no
environment variables or extra storage products are needed — Netlify Blobs is
built in. The two backends are independent; each host uses only its own.
