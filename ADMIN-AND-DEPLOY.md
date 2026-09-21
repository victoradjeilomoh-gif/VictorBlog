# Editing the site & deploying to Netlify

The website is now fully editable from a built-in admin panel. Every image and
every piece of text on the front page can be changed there, and changes go live
immediately once the site is on Netlify.

---

## 1. How the admin works

- Open the admin by adding **`#admin`** to the site address, e.g.
  `https://your-site.netlify.app/#admin`
- Sign in with the **admin password** (see step 3 below).
- Use the left-hand menu to edit each part of the site:
  - **Brand & menu** – site title/SEO, logo monogram, navigation links, marquee, footer
  - **Hero** – the big opening headline, intro and featured image
  - **Portfolio** – add / edit / delete / reorder pieces, upload artwork, set categories
  - **Services** – the eight (or more) service cards, images and "what's included" lists
  - **About**, **Process** – the wording of those sections
  - **Contact & QR** – email, WhatsApp, location and the "Scan to save my contact" QR image
  - **Social links** – Facebook, Instagram, etc. (the icon is chosen from the platform)
- **Uploading images:** in any image field, click **Upload image** and pick a file.
  It is stored with your site and the field fills in automatically. You can also
  paste an image URL instead.
- Press **Save changes** (top right). On the live Netlify site this saves to the
  server and the public site updates immediately.

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

Netlify Blobs (where content and uploaded images are stored) needs no setup —
it's built in and enabled automatically for the site's functions.

---

## 3. Set the admin password (required)

The admin is protected by a single password stored **on Netlify**, never in the
code.

1. In Netlify: **Site configuration → Environment variables → Add a variable**.
2. Key: `ADMIN_PASSWORD`  Value: *(choose a strong password)*
3. **Redeploy** the site (Deploys → Trigger deploy) so the functions pick it up.

Until `ADMIN_PASSWORD` is set, saving from the admin will show a message asking
you to configure it.

To change the password later, edit the same variable and redeploy.

---

## 4. Local development

- `npm run dev` – runs the site at `http://localhost:5173`.
  In this mode there is no server, so the admin saves to your **browser only**
  (localStorage) and any password is accepted — handy for previewing edits.
- `npm run build` – production build (type-checks and bundles).
- To test the real serverless saving locally, install the Netlify CLI and run
  `netlify dev` (it serves the functions + Blobs alongside the site). Set
  `ADMIN_PASSWORD` in a local `.env` for that.

---

## 5. Where content lives

- **Default content** ships in `src/content/defaultContent.ts` — this is what a
  brand-new site shows before any edits are saved.
- **Saved content** is stored as JSON in Netlify Blobs (`site` store) and served
  by `netlify/functions/content.mts`.
- **Uploaded images** are stored in Netlify Blobs (`media` store) and served by
  `netlify/functions/media.mts` at `/api/media/<id>`.
- The password check lives in `netlify/functions/login.mts` and is re-checked on
  every save.
