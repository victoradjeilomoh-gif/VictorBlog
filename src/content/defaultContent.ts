import type { SiteContent } from './types';

const PHOTO = (id: string, w = 900, h = 600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=${w}&h=${h}`;

// The starting content for the site. This is the fallback used before any admin
// edits are saved, and the seed the admin loads for first-time editing.
export const defaultContent: SiteContent = {
  __version: 1,

  site: {
    title: 'Victor Adjei Lomoh — Artist & Illustrator',
    description:
      'Ghanaian graphic artist and illustrator creating thoughtful work for books, education, culture and communication.',
  },

  brand: { mark: 'VL', name: 'Victor Adjei Lomoh', logo: 'assets/logo.jpeg' },

  nav: [
    { label: 'Work', href: '#work' },
    { label: 'Books', href: '#books' },
    { label: 'Services', href: '#services' },
    { label: 'About', href: '#practice' },
    { label: 'Contact', href: '#contact' },
  ],

  header: { ctaLabel: 'Discuss a project', ctaEmail: 'ritcheveryday@gmail.com' },

  hero: {
    kicker: 'Illustration studio · Accra, Ghana',
    title: 'Stories made visible.',
    intro:
      'Victor Adjei Lomoh is a Ghanaian graphic artist and illustrator creating thoughtful work for books, education, culture and communication.',
    primaryLabel: 'View the work',
    secondaryLabel: 'Start a conversation',
    image: 'assets/black-star-gate.webp',
    imageAlt: 'The Black Star Gate, Independence Square, Accra',
    captionTitle: 'The Black Star Gate',
    captionPlace: 'Accra, Ghana',
  },

  marquee: ['Illustration', 'Publishing', 'Character', 'Culture', 'Visual storytelling'],

  workSection: {
    kicker: 'Selected work',
    title: 'A portfolio of story-led illustration.',
    intro:
      'A cross-section of book, character and cultural projects. Every piece begins with its purpose and is finished for the place it needs to live.',
    note: 'Placeholder photos shown for layout — click any piece to view it larger. Ready to be replaced with Victor’s actual work.',
  },

  categories: [
    { id: 'books', label: 'Books' },
    { id: 'coloring', label: 'Colouring' },
    { id: 'characters', label: 'Characters' },
    { id: 'covers', label: 'Covers' },
    { id: 'culture', label: 'Culture' },
  ],

  work: [
    {
      id: 'w-ananse',
      title: 'Tales of Ananse',
      categoryId: 'books',
      label: 'Book illustration',
      year: '2024',
      client: 'Heritage Kids Publishing',
      scope: '32 interior spreads + cover',
      about:
        'A full-colour children’s storybook bringing the West African folklore of Ananse the spider to life. The work pairs dynamic page compositions and lush palettes with expressive, consistent character acting across all thirty-two spreads.',
      image: PHOTO('1544716278-ca5e3f4abd8c', 800, 1000),
      tag: 'Sample',
    },
    {
      id: 'w-queen',
      title: 'Queen Mother',
      categoryId: 'characters',
      label: 'Character design',
      year: '2024',
      client: 'AfroFiction Studios',
      scope: 'Turnaround · 6 expressions · props',
      about:
        'A hero character sheet for an African warrior queen, combining authentic historical regalia and gold detailing with a modern concept-design sensibility. Delivered with a full turnaround, expression range and prop breakdowns for animation reference.',
      image: PHOTO('1531259683007-016a7b628fc3', 800, 1000),
      tag: 'Sample',
    },
    {
      id: 'w-discover',
      title: 'Discover Ghana',
      categoryId: 'coloring',
      label: 'Colouring book',
      year: '2024',
      client: 'AfroMind Educational Series',
      scope: '40 line-art pages + cover',
      about:
        'An educational colouring book exploring Ghana’s historic castles, the bustle of Makola market, traditional drumming and royal Kente weaving. Drawn in clean, bold vector line work suited to both children and adults.',
      image: PHOTO('1596464716127-f2a82984de30', 800, 1000),
      tag: 'Sample',
    },
    {
      id: 'w-blackstar',
      title: 'The Black Star Gate',
      categoryId: 'culture',
      label: 'Cultural heritage',
      year: '2023',
      client: 'Cultural commission',
      scope: 'Commemorative artwork',
      about:
        'A tribute piece centred on the Black Star Gate and Independence Arch at Accra’s Black Star Square — the enduring symbol of Ghana’s freedom and justice, framed by the national flags and the Atlantic beyond.',
      image: 'assets/black-star-gate.webp',
      tag: 'Sample',
    },
    {
      id: 'w-kumasi',
      title: 'Echoes of Kumasi',
      categoryId: 'covers',
      label: 'Book cover',
      year: '2024',
      client: 'Author Kwesi B. Darko',
      scope: 'Full paperback wrap + 3D mockups',
      about:
        'A cinematic cover for a historical-fiction mystery set in the 19th-century Ashanti kingdom. Built around silhouette lighting and gold-foil typography so it holds attention at full shelf size and as a small online thumbnail.',
      image: PHOTO('1512820790803-83ca734da794', 800, 1000),
      tag: 'Sample',
    },
    {
      id: 'w-neoaccra',
      title: 'Neo-Accra 2088',
      categoryId: 'books',
      label: 'Illustrated series',
      year: '2024',
      client: 'Creative Tech Collective',
      scope: 'Concept art direction',
      about:
        'A solarpunk concept series reimagining Accra as a green, sustainable metropolis of the future — developed through concept sketching and layered digital painting to establish a consistent world and mood.',
      image: PHOTO('1502691876148-a84978e59af8', 800, 1000),
      tag: 'Sample',
    },
    {
      id: 'w-kakum',
      title: 'Kakum Patterns',
      categoryId: 'coloring',
      label: 'Colouring book',
      year: '2023',
      client: 'AfroMind Educational Series',
      scope: 'Pattern & line-art set',
      about:
        'A set of nature-led colouring pages inspired by the wildlife, canopy walkways and plant life of Kakum National Park, arranged as repeatable patterns that stay engaging to fill in.',
      image: PHOTO('1560785496-3c9d27877182', 800, 1000),
      tag: 'Sample',
    },
    {
      id: 'w-market',
      title: 'Market Day',
      categoryId: 'characters',
      label: 'Character study',
      year: '2024',
      client: 'Personal work',
      scope: 'Character illustration',
      about:
        'A personal character study capturing the colour, movement and everyday energy of a Ghanaian market day — an exercise in crowd staging, costume and warm, natural light.',
      image: PHOTO('1542744173-8e7e53415bb0', 800, 1000),
      tag: 'Sample',
    },
  ],

  servicesSection: {
    kicker: 'Selected services',
    title: 'Art with a clear role to play.',
    intro:
      'Every project starts with its purpose. The result should be expressive, culturally considered and ready for the place it needs to live.',
  },

  services: [
    {
      id: 's-custom',
      title: 'Custom illustration',
      text: 'Original artwork shaped around a specific idea, audience and use.',
      about:
        'Bespoke, high-detail illustration built around your brief — editorial pieces, personal commissions, family and heritage portraits or narrative artwork for a brand. Every piece is planned for the exact place it will be seen.',
      includes: ['High-resolution 300 DPI print files', 'Vector assets where relevant', 'Full commercial usage rights'],
      image: PHOTO('1513364776144-60967b0f800f'),
    },
    {
      id: 's-book',
      title: 'Book illustration',
      text: 'Story-led imagery for authors, publishers and educational projects.',
      about:
        'Full-page spreads, interior spot art and consistent characters for children’s books, young-adult titles and educational literature — with the print set-up handled from the start.',
      includes: ['Full-bleed spreads & spot art', 'Consistent character sheets', 'KDP & IngramSpark formatting'],
      image: PHOTO('1544716278-ca5e3f4abd8c'),
    },
    {
      id: 's-colouring',
      title: 'Colouring-book artwork',
      text: 'Clear, engaging line work for creative and educational publishing.',
      about:
        'Clean, captivating black-and-white line art for all ages, often centred on African culture, folklore and creative learning — supplied ready to publish.',
      includes: ['Crisp vector line work', 'Test-colour reference guides', 'Amazon KDP-ready PDFs'],
      image: PHOTO('1596464716127-f2a82984de30'),
    },
    {
      id: 's-character',
      title: 'Character design',
      text: 'Memorable characters developed with personality, expression and purpose.',
      about:
        'From folklore legends to modern protagonists and brand mascots — characters developed with a clear personality and built for reuse across a story or campaign.',
      includes: ['Turnaround models', 'Expression & pose sheets', 'Colour variations & guides'],
      image: PHOTO('1531259683007-016a7b628fc3'),
    },
    {
      id: 's-cover',
      title: 'Book cover concepts',
      text: 'Distinct cover directions designed to be clear at shelf and thumbnail size.',
      about:
        'Genre-aware cover directions engineered to grab attention on a physical shelf and as a small online thumbnail alike, with the full wrap and marketing mockups delivered.',
      includes: ['Front, back & spine wrap', '3D photorealistic mockups', 'Ebook thumbnail optimisation'],
      image: PHOTO('1512820790803-83ca734da794'),
    },
    {
      id: 's-promo',
      title: 'Promotional graphics',
      text: 'Visuals for businesses, events, campaigns and cultural organisations.',
      about:
        'Impactful print and digital assets — event posters, campaign banners and social packs — that carry a consistent visual identity across every touchpoint.',
      includes: ['Social media campaign packs', 'Large-format event posters', 'Digital banner sets'],
      image: PHOTO('1626785774573-4b799315345d'),
    },
    {
      id: 's-ai',
      title: 'AI-assisted artwork',
      text: 'Modern hybrid workflows that pair generative tools with hand-finished craft.',
      about:
        'Where it fits the brief, generative tools speed up exploration and are then hand-finished with digital painting — useful for rapid concepting and mood-setting without losing craft.',
      includes: ['Mood boards & concept iterations', 'Hand over-painted final assets', 'Rapid ideation pipelines'],
      image: PHOTO('1618005182384-a83a8bd57fbe'),
    },
    {
      id: 's-international',
      title: 'International client services',
      text: 'Clear collaboration across timezones for clients anywhere in the world.',
      about:
        'Structured, low-friction collaboration for clients abroad — clear milestones and approvals, transparent invoicing and a clean handover of rights at the end.',
      includes: ['Flexible timezone coordination', 'Invoicing in USD, GBP, EUR, GHS', 'Contract & IP transfer'],
      image: PHOTO('1451187580459-43490279c0fa'),
    },
  ],

  booksSection: {
    kicker: 'Published books',
    title: 'Books to read, colour and collect.',
    intro:
      'A selection of illustrated and cover-designed titles. Tap any book to buy a copy or download it, and read a little about what’s inside.',
  },

  books: [
    {
      id: 'bk-1',
      title: 'Book One',
      image: 'assets/book-1.jpeg',
      blurb: 'A short description of this book goes here — what it’s about and who it’s for. Edit this from the admin panel.',
      linkUrl: '',
      linkLabel: 'Buy / Download',
    },
    {
      id: 'bk-2',
      title: 'Book Two',
      image: 'assets/book-2.jpeg',
      blurb: 'A short description of this book goes here — what it’s about and who it’s for. Edit this from the admin panel.',
      linkUrl: '',
      linkLabel: 'Buy / Download',
    },
    {
      id: 'bk-3',
      title: 'Book Three',
      image: 'assets/book-3.jpeg',
      blurb: 'A short description of this book goes here — what it’s about and who it’s for. Edit this from the admin panel.',
      linkUrl: '',
      linkLabel: 'Buy / Download',
    },
    {
      id: 'bk-4',
      title: 'Book Four',
      image: 'assets/book-4.jpeg',
      blurb: 'A short description of this book goes here — what it’s about and who it’s for. Edit this from the admin panel.',
      linkUrl: '',
      linkLabel: 'Buy / Download',
    },
    {
      id: 'bk-5',
      title: 'Book Five',
      image: 'assets/book-5.jpeg',
      blurb: 'A short description of this book goes here — what it’s about and who it’s for. Edit this from the admin panel.',
      linkUrl: '',
      linkLabel: 'Buy / Download',
    },
  ],

  about: {
    kicker: 'About the artist',
    title: 'Ghanaian perspective, global application.',
    intro:
      'Victor’s work brings together African culture, visual clarity and an instinct for storytelling — across children’s publishing, colouring books, character concepts and campaign graphics.',
    lead: 'The approach is collaborative and grounded in the needs of the final audience.',
    body:
      'Local and international commissions are welcome, prepared for the print or digital use each project calls for.',
    linkLabel: 'Request a relevant portfolio selection',
    linkEmail: 'ritcheveryday@gmail.com',
    quote: 'Illustration should make a story impossible to forget.',
    quoteBy: 'Victor Adjei Lomoh — Artist & illustrator',
  },

  processSection: { kicker: 'Working together', title: 'A simple, considered process.' },

  process: [
    { id: 'p1', number: '01', title: 'Conversation', text: 'We begin with the story, audience, format and practical requirements.' },
    { id: 'p2', number: '02', title: 'Direction', text: 'Initial ideas establish the visual language before detailed work begins.' },
    { id: 'p3', number: '03', title: 'Development', text: 'The selected direction is refined through clear review points.' },
    { id: 'p4', number: '04', title: 'Delivery', text: 'Final artwork is prepared for the agreed print or digital use.' },
  ],

  contact: {
    kicker: 'New commissions',
    title: 'Have a story to bring to life?',
    intro:
      'Share a short note about the project, intended audience, timing and where the artwork will be used. Victor will reply directly.',
    email: 'ritcheveryday@gmail.com',
    whatsappDisplay: '+233 59 820 2513',
    whatsappNumber: '233598202513',
    whatsappMessage: "Hello Victor, I'd like to discuss an illustration project.",
    location: 'Accra, Ghana · Available worldwide',
    qrImage: 'assets/qr-code.jpeg',
    qrCaption: 'Scan to save my contact',
    formHeading: 'Send a message — it goes straight to Victor’s WhatsApp',
    formNote: 'Fill this in and your details reach Victor instantly on WhatsApp — with your name, email and number attached so he can get back to you.',
    formSuccessMessage: 'Thank you! Your message is on its way to Victor’s WhatsApp. If WhatsApp did not open, tap the green button below.',
    formServices: ['Custom illustration', 'Book illustration', 'Colouring-book artwork', 'Character design', 'Book cover concepts', 'Promotional graphics', 'Something else'],
    formSubmitLabel: 'Send via WhatsApp',
  },

  whatsappButton: { enabled: true, label: 'Chat on WhatsApp' },

  whatsappGreetingSetupDone: false,
  whatsappGreetingText:
    'Hi! Thanks for contacting me. I received your message and will get back with you shortly. — Victor Adjei Lomoh',
  whatsappGreetingSteps: [
    'Open WhatsApp on your phone (the one with the number shown on the website).',
    'Tap Settings (⋮ on Android, ⚙︎ on iPhone) → Business tools → Greeting message.',
    'Turn “Send greeting message” ON.',
    'Set “Recipients” to Everyone.',
    'Paste the greeting text below into the message box and save.',
  ],

  social: [
    { id: 'soc-fb', platform: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61594548813874' },
    { id: 'soc-ig', platform: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/victoradjeilomoh/' },
  ],

  footer: { mark: 'VL', name: 'Victor Adjei Lomoh' },
};
