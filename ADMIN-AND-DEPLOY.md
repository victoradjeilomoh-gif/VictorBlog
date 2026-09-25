# Editing the site & deploying

The website is fully editable from a built-in admin panel. Every image and every
piece of text on the front page can be changed there, and changes go live
immediately.

The site runs on **Vercel** (the primary setup below). It can also run on Netlify
— see the note at the end.

---

## 0. WhatsApp setup (do this once — plain English)

The goal: **someone finds the site → taps WhatsApp → chats with Victor → the
enquiry is saved for follow-up.** Everything below is done in the admin panel
(`/#admin` → **WhatsApp & form**), plus one setting inside WhatsApp itself.

1. **Check the WhatsApp number** — Admin → **Contact & QR** → “WhatsApp number”.
   This one number powers every button on the site (the green floating button,
   the header button, and the contact section).
2. **Turn on the automatic greeting in WhatsApp** — in the admin → **WhatsApp &
   form** there is a ready-made greeting and a **Copy greeting** button. Open
   WhatsApp on Victor's phone → Settings → Business tools → Greeting message →
   turn it ON, set Recipients to *Everyone*, paste the greeting, save. Then tick
   “Mark greeting as set up” in the admin and press **Save changes**.
3. **Connect Facebook to WhatsApp** — on Victor's Facebook Page: **Settings →
   WhatsApp**, enter the same number, and set the page button to **“Send
   WhatsApp message”**. (Facebook support changes sometimes; if the option isn't
   there, use “Edit action button” → WhatsApp. This step is done on Facebook,
   not in the website admin.)
4. **Test everything once** —
   - Website → green floating button → WhatsApp chat opens ✓
   - Website → contact form → message appears in Admin → **Messages
     (enquiries)** AND a WhatsApp chat opens with the customer's details
     pre-filled ✓
   - Facebook → WhatsApp button opens the same chat ✓

**Where customer details live:** every form submission is saved to Admin →
**Messages (enquiries)** — name, email, WhatsApp number, what they're
interested in and their message. From there Victor can reply on WhatsApp with
one tap (a polite greeting is pre-typed) or download all enquiries as a
CSV/Excel file.

The contact form itself, the floating button and the pre-filled message are all
editable in Admin → **WhatsApp & form** (and Admin → **Contact & QR** for the
number itself). Everything works on both Vercel and Netlify.

---

## 1. How the admin works

- Open the admin by adding **`#admin`** to the site address, e.g.
  `https://your-site.vercel.app/#admin`
- **The very first time**, you'll be asked to **create an admin password** (see
  step 4). After that, you just sign in with it.
- Use the left-hand menu to edit each part of the site:
  - **Site look** – switch the whole design between three complete looks:
    **Warm editorial** (bright cream + orange serif), **Bold poster** (near-black,
    huge uppercase type) and **Refined gallery** (deep navy + gold serif).
    Click a card, press **Save changes**, and the live site switches instantly —
    all text, images and WhatsApp features stay exactly the same. You can change
    it as often as you like.
  - **Brand & menu** – site title/SEO, logo monogram, navigation links, marquee, footer
  - **Hero** – the big opening headline, intro and featured image
  - **Portfolio** – add / edit / delete / reorder pieces, upload artwork, set categories
  - **Services** – the service cards, images and "what's included" lists
  - **About**, **Process** – the wording of those sections
  - **Contact & QR** – email, WhatsApp, location and the "Scan to save my contact" QR image
  - **WhatsApp & form** – the WhatsApp setup checklist, floating button, automatic greeting and the pre-filled message customers send
  - **Messages (enquiries)** – every contact-form submission (name, email, WhatsApp number, message) with one-tap WhatsApp reply and CSV/Excel export
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
