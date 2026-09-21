# Editing the site & deploying to Netlify

The website is fully editable from a built-in admin panel. Every image and every
piece of text on the front page can be changed there, and changes go live
immediately once the site is on Netlify.

---

## 1. How the admin works

- Open the admin by adding **`#admin`** to the site address, e.g.
  `https://your-site.netlify.app/#admin`
- **The very first time**, you'll be asked to **create an admin password** (see
  step 3). After that, you just sign in with it.
- Use the left-hand menu to edit each part of the site:
  - **Brand & menu** – site title/SEO, logo monogram, navigation links, marquee, footer
  - **Hero** – the big opening headline, intro and featured image
  - **Portfolio** – add / edit / delete / reorder pieces, upload artwork, set categories
  - **Services** – the service cards, images and "what's included" lists
  - **About**, **Process** – the wording of those sections
  - **Contact & QR** – email, WhatsApp, location and the "Scan to save my contact" QR image
  - **Social links** – Facebook, Instagram, etc. (the icon is chosen from the platform)
- **Uploading images:** in any image field, click **Upload image** and pick a file.
  It is stored with your site and the field fills in automatically. You can also
  paste an image URL instead.
- Press **Save changes** (top right). On the live Netlify site this saves to the
  server and the public site updates immediately.
- **Change password** and **Sign out** are at the bottom of the left menu.

> While editing you'll see "You have unsaved changes" until you save. **Discard**
> reverts to the last saved version.

---

## 2. Deploy to Netlify (first time)

1. Push this project to a GitHub (or GitLab/Bitbucket) repository.
2. In Netlify: **Add new site → Import an existing project**, and pick the repo.
3. Netlify auto-detects the settings from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
4. Click **Deploy**.

Netlify Blobs (where content, uploaded images **and the admin password hash** are
stored) needs no setup — it's built in and enabled automatically for the site's
functions. **No environment variables are required.**

---

## 3. Set the admin password (first run)

There is **nothing to configure in Netlify** for this. Once the site is deployed:

1. Go to `https://your-site.netlify.app/#admin`.
2. You'll see **"Create admin password"** — choose a password (min 6 characters)
   and confirm it. That's it — you're in.
3. From then on, that page shows a normal sign-in.

The password is stored **only as a secure hash** in Netlify Blobs — never in the
code and never in plain text. To change it later, use **Change password** in the
admin menu (you'll need the current one).

> Optional: if you'd ever rather use a Netlify environment variable instead, set
> `ADMIN_PASSWORD` in **Site configuration → Environment variables** and redeploy.
> It's only used as a fallback when no password has been set from the admin.

---

## 4. Local development

- `npm run dev` – runs the site at `http://localhost:5173`.
  In this mode there is no server, so the admin saves to your **browser only**
  (localStorage) — handy for previewing edits. The first-run password screen
  still works (stored locally in the browser).
- `npm run build` – production build (type-checks and bundles).
- To test the real serverless saving locally, install the Netlify CLI and run
  `netlify dev` (it serves the functions + Blobs alongside the site).

---

## 5. Where everything lives

- **Default content** ships in `src/content/defaultContent.ts` — what a brand-new
  site shows before any edits are saved.
- **Saved content** – JSON in Netlify Blobs (`site` store), via `netlify/functions/content.mts`.
- **Uploaded images** – Netlify Blobs (`media` store), served by `netlify/functions/media.mts` at `/api/media/<id>`.
- **Admin password** – salted hash in Netlify Blobs (`site` store, `auth` key);
  set/verified by `netlify/functions/auth.mts`, `login.mts` and `_auth.mts`.
