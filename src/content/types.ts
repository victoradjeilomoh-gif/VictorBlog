// Central content model for the whole front page.
// Everything visible on the public site is described here so the admin can edit
// it and it can be stored/loaded as a single JSON document.

export type NavLink = { label: string; href: string };

export type Category = { id: string; label: string };

export type WorkItem = {
  id: string;
  title: string;
  categoryId: string; // which filter group this belongs to (matches a Category id)
  label: string; // descriptive line shown on the card / lightbox e.g. "Book illustration"
  year: string;
  client: string;
  scope: string;
  about: string;
  image: string; // full URL, /api/media/… URL, /assets/… path, or data URL
  tag: string; // small corner tag, e.g. "Sample"
};

export type ServiceItem = {
  id: string;
  title: string;
  text: string; // short line on the card
  about: string; // longer copy in the detail panel
  includes: string[];
  image: string;
};

// A published book with its cover, a short description and an optional outbound
// link (to buy or download). When `linkUrl` is empty no button is shown.
export type BookItem = {
  id: string;
  title: string;
  image: string; // cover image
  blurb: string; // a little about the book
  linkUrl: string; // where "Buy / Download" points (empty = no button)
  linkLabel: string; // button text, e.g. "Buy now" or "Download"
};

export type ProcessStep = {
  id: string;
  number: string;
  title: string;
  text: string;
};

// A social channel. `platform` selects which icon is rendered.
export type SocialLink = {
  id: string;
  platform: 'facebook' | 'instagram' | 'whatsapp' | 'x' | 'linkedin' | 'youtube' | 'tiktok' | 'behance' | 'dribbble' | 'website' | 'email';
  label: string;
  url: string;
};

export type SiteContent = {
  __version: number;

  // Which public design the site uses. Changed from Admin → "Site look".
  // "editorial" = warm light magazine · "poster" = bold dark punchy ·
  // "gallery" = refined dark navy/gold.
  designTheme: 'editorial' | 'poster' | 'gallery';

  site: { title: string; description: string };

  // `mark` is the monogram fallback (e.g. "VL"); `logo` is an optional uploaded
  // image that replaces the monogram wherever the brand appears.
  brand: { mark: string; name: string; logo: string };

  nav: NavLink[];

  header: { ctaLabel: string; ctaEmail: string };

  hero: {
    kicker: string;
    title: string;
    intro: string;
    primaryLabel: string;
    secondaryLabel: string;
    image: string;
    imageAlt: string;
    captionTitle: string;
    captionPlace: string;
  };

  marquee: string[];

  workSection: { kicker: string; title: string; intro: string; note: string };
  categories: Category[];
  work: WorkItem[];

  servicesSection: { kicker: string; title: string; intro: string };
  services: ServiceItem[];

  booksSection: { kicker: string; title: string; intro: string };
  books: BookItem[];

  about: {
    kicker: string;
    title: string;
    intro: string;
    lead: string;
    body: string;
    linkLabel: string;
    linkEmail: string;
    quote: string;
    quoteBy: string;
  };

  processSection: { kicker: string; title: string };
  process: ProcessStep[];

  contact: {
    kicker: string;
    title: string;
    intro: string;
    email: string;
    whatsappDisplay: string;
    whatsappNumber: string; // digits only, used for the wa.me link
    whatsappMessage: string;
    location: string;
    qrImage: string; // "Scan to save my contact" QR image
    qrCaption: string;
    // Contact form (submissions are saved to the admin "Messages" inbox and
    // can also be sent straight to Victor's WhatsApp).
    formHeading: string;
    formNote: string;
    formSuccessMessage: string;
    formServices: string[]; // options for the "what are you interested in?" dropdown
    formSubmitLabel: string;
  };

  // Big green floating WhatsApp button shown on every page (bottom corner).
  whatsappButton: {
    enabled: boolean;
    label: string; // text next to the icon; empty = icon only
  };

  // True when Victor has set up / confirmed the WhatsApp greeting below.
  whatsappGreetingSetupDone: boolean;
  // Step-by-step instructions shown in the admin for the automatic greeting.
  whatsappGreetingText: string; // the greeting itself, ready to copy & paste into WhatsApp
  whatsappGreetingSteps: string[]; // instructions shown in the admin

  social: SocialLink[];

  footer: { mark: string; name: string };
};
