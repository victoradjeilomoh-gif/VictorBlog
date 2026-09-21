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
  };

  social: SocialLink[];

  footer: { mark: string; name: string };
};
