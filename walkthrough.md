# Walkthrough: Victor Adjei Lomoh Portfolio Website

We have implemented the full responsive website for **Victor Adjei Lomoh** — Graphic Artist, Creative Illustrator, and International Artist based in Accra, Ghana.

---

## 🌟 Highlights of What Was Built

### 1. Brand Identity & Header
- **Live GMT Time Indicator:** Real-time clock set to `Africa/Accra (GMT)` displaying local time to international publishers and art collectors.
- **Brand Motifs & Colors:** Afro-modern palette featuring Obsidian Black (`#0B0D11`), Ashanti Gold (`#E5A93C`), and Ghanaian Flag/Kente micro-accents.
- **Quick CTAs:** Instant WhatsApp connection button (`+233 59 820 2513`), "Start Commission", and navigation links.

### 2. High-Impact Hero Section
- **Positioning:** *"Bringing Ideas, Stories & Culture to Life Through Art."*
- **The Engineer-Artist Narrative:** Highlights his Electrical Engineering education at Ashaiman Technical Institute (2020–2023) as the foundation for his discipline, spatial precision, patience, and meticulous attention to detail.
- **Visual Showcase:** Embedded visual featuring Victor's portrait with interactive badges (*Art Knows No Borders*, *Ghanaian Creativity Global Impact*, *Create | Illustrate | Educate | Inspire | Connect*).

### 3. Core Specialties Grid (The 8 Services from Flyer)
All 8 signature services from his brand poster are prominently featured with customized icons, descriptions, and deliverables:
1. **Custom Illustrations** (Unique artwork for your ideas)
2. **Book Illustrations** (Stories that inspire & educate)
3. **Coloring-Book Artwork** (Fun, engaging & educational)
4. **Character Design** (Memorable characters with depth)
5. **Book Cover Concepts** (Eye-catching designs that sell)
6. **Promotional Graphics** (For business, events & media)
7. **AI-Assisted Artwork** (Creative & modern hybrid solutions)
8. **International Client Services** (Seamless collaboration worldwide)

### 4. Interactive "Line-Art to Full Color" Comparison Slider
- Interactive slider allowing visitors, authors, and educators to slide between crisp, raw black-and-white coloring page line art and the full, vibrantly colored finished artwork.

### 5. Curated Portfolio & Case Study Modal Viewer
- Category filter tabs: *All Projects*, *Book Illustration*, *Coloring Books*, *Character Design*, *Cultural Heritage*, *Book Covers*, and *AI Concepts*.
- High-res image modal viewer utilizing modern `<dialog>` architecture with light-dismiss, project scopes, client details, and one-click *"Inquire Similar Artwork"* button.

### 6. About the Artist, 5-Step Process & Social Proof
- **The 5-Step Formula:** `Listening` ➔ `Imagining` ➔ `Creating` ➔ `Refining` ➔ `Delivering`.
- **Client Testimonials:** Real-world endorsements from children's book editors, educators, and indie novelists.

### 7. Upcoming Cultural Coloring Book & Education Section
- Highlights Victor's core mission: educating the world on Ghanaian and African culture through coloring books and visual storytelling.
- Spotlight on upcoming release: *Echoes of Ghana: Patterns, People & Folklore*.
- Lead magnet: Free 3-page printable sample coloring sheet download with celebration confetti.

### 8. Interactive Commission Brief & Estimator
- Step-by-step interactive form calculating service type, deliverable volume, target timeline, and budget.
- **One-Click WhatsApp Brief Generator:** Pre-formats the complete commission inquiry and launches directly into chat with Victor at `+233 59 820 2513`.
- **Email Invoicing Route:** Generates structured email to `ritcheveryday@gmail.com`.

### 9. Contact Hub, Digital vCard & QR Code
- **QR Code Scanner:** Matches the flyer's *"Scan to Save My Contact"* functionality.
- **Downloadable `.vcf` vCard:** Allows anyone to save Victor's contact details straight into their smartphone address book with a single click.
- **Direct channels:** Phone/WhatsApp (`+233 59 820 2513`), Email (`ritcheveryday@gmail.com`), Studio headquarters (`Accra, Ghana`).
- **Floating WhatsApp Quick Chat Button:** Persistent, non-intrusive floating badge for mobile and desktop visitors.

---

## 🛠️ Technical Stack & Architecture

| Item | Specification |
| :--- | :--- |
| **Framework** | Vite 8 + React 19 + TypeScript |
| **Styling** | Tailwind CSS v4 + Custom Afro-Modern Luxury Theme |
| **Icons** | Lucide React |
| **Delight** | Canvas Confetti (for sample downloads & inquiries) |
| **Build Status** | `tsc -b && vite build` passed with 0 errors |
| **Local Preview** | Running at `http://localhost:5173/` |

---

## 🚀 How to Run or Deploy

### Running Locally:
```bash
# Start the development server
npm run dev

# Or run the production preview build
npm run preview
```

### Deploying Live (Free on Vercel or Netlify):
1. Push this folder to a GitHub repository.
2. Link the repository to [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
3. Both platforms will automatically detect Vite and deploy the production build in under 1 minute.
