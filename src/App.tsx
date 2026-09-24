import { useEffect, useState } from 'react';
import { Admin } from './Admin';
import {
  ArrowDownRight,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Globe2,
  Mail,
  Menu,
  MessageCircle,
  Send,
  X,
} from 'lucide-react';
import { loadContent, submitLead } from './content/api';
import { defaultContent } from './content/defaultContent';
import type { SiteContent } from './content/types';
import { SocialIcon } from './components/SocialIcon';

const PLACEHOLDER = 'assets/placeholder.svg';

const onImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  if (!img.dataset.fb) {
    img.dataset.fb = '1';
    img.src = PLACEHOLDER;
  }
};

const waLink = (number: string, message: string) =>
  `https://wa.me/${number.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;

// Contact-form state shared by the form + WhatsApp handoff.
const emptyForm = { name: '', email: '', phone: '', service: '', message: '' };

function ContactForm({ content }: { content: SiteContent }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [lastWa, setLastWa] = useState('');

  const set = (k: keyof typeof emptyForm) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  // Save the enquiry to Victor's records (admin inbox) and open WhatsApp with
  // the customer's details pre-filled. Both happen together.
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Please enter your name.';
    if (!form.phone.trim() && !form.email.trim()) errs.phone = 'Add a phone/WhatsApp number or an email so Victor can reply.';
    if (!form.message.trim()) errs.message = 'Please write a short message.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus('sending');
    const c = content.contact;
    const lines = [
      `Hello Victor, my name is ${form.name.trim()}.`,
      form.service ? `I am interested in: ${form.service}.` : '',
      form.message.trim(),
      '',
      form.email ? `Email: ${form.email.trim()}` : '',
      form.phone ? `Phone/WhatsApp: ${form.phone.trim()}` : '',
      '— sent from your website contact form',
    ].filter(Boolean);

    try {
      await submitLead(
        {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          service: form.service,
          message: form.message.trim(),
        },
        c.whatsappNumber,
      );
    } catch {
      /* WhatsApp still opens even if saving failed */
    }
    const url = waLink(c.whatsappNumber, lines.join('\n'));
    setLastWa(url);
    window.open(url, '_blank', 'noopener');
    setStatus('done');
    setForm(emptyForm);
  };

  const field = (
    key: keyof typeof emptyForm,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <label className={`cf-field${errors[key] ? ' has-error' : ''}`}>
      <span>{label}</span>
      <input
        value={form[key]}
        onChange={(e) => set(key)(e.target.value)}
        {...props}
      />
      {errors[key] && <em>{errors[key]}</em>}
    </label>
  );

  return (
    <form className="contact-form" onSubmit={submit} noValidate>
      <h3>{content.contact.formHeading}</h3>
      {content.contact.formNote && <p className="cf-note">{content.contact.formNote}</p>}

      <div className="cf-grid">
        {field('name', 'Your name *', { autoComplete: 'name', placeholder: 'e.g. Ama Mensah' })}
        {field('email', 'Email address', { type: 'email', autoComplete: 'email', placeholder: 'you@example.com' })}
        {field('phone', 'Phone / WhatsApp number', { type: 'tel', autoComplete: 'tel', placeholder: 'e.g. +233 55 000 0000' })}
        <label className="cf-field">
          <span>I’m interested in</span>
          <select value={form.service} onChange={(e) => set('service')(e.target.value)}>
            <option value="">Choose one (optional)</option>
            {content.contact.formServices.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      <label className={`cf-field${errors.message ? ' has-error' : ''}`}>
        <span>Your message *</span>
        <textarea
          rows={4}
          value={form.message}
          onChange={(e) => set('message')(e.target.value)}
          placeholder="Tell Victor about your project…"
        />
        {errors.message && <em>{errors.message}</em>}
      </label>

      <div className="cf-actions">
        <button type="submit" className="cf-submit" disabled={status === 'sending'}>
          <Send size={16} />
          {status === 'sending' ? 'Sending…' : content.contact.formSubmitLabel}
        </button>
        <a
          className="cf-direct"
          href={waLink(content.contact.whatsappNumber, content.contact.whatsappMessage)}
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle size={16} /> Or chat directly on WhatsApp
        </a>
      </div>

      {status === 'done' && (
        <div className="cf-success" role="status">
          <p>
            <CheckCircle2 size={17} /> {content.contact.formSuccessMessage}
          </p>
          {lastWa && (
            <a className="cf-reopen" href={lastWa} target="_blank" rel="noreferrer">
              <MessageCircle size={15} /> Reopen WhatsApp
            </a>
          )}
        </div>
      )}
    </form>
  );
}

function FloatingWhatsApp({ content }: { content: SiteContent }) {
  const number = content.contact.whatsappNumber.replace(/[^\d]/g, '');
  if (!content.whatsappButton.enabled || !number) return null;
  return (
    <a
      className="wa-float"
      href={waLink(content.contact.whatsappNumber, content.contact.whatsappMessage)}
      target="_blank"
      rel="noreferrer"
      aria-label={`Chat with Victor on WhatsApp: ${content.contact.whatsappDisplay || number}`}
    >
      <svg viewBox="0 0 32 32" width="27" height="27" aria-hidden="true" fill="currentColor">
        <path d="M16 3C9.4 3 4 8.3 4 14.9c0 2.6.8 5 2.3 7L4 29l7.4-2.3c1.9 1 4 1.6 6.3 1.6h.3c6.6 0 12-5.3 12-11.9S22.6 3 16 3zm5.9 16.6c-.3.8-1.7 1.6-2.3 1.6-.6.1-1.4.1-2.2-.1-.5-.2-1.2-.4-2-.8-3.5-1.5-5.8-5-6-5.3-.2-.2-1.4-1.9-1.4-3.6 0-1.7.9-2.6 1.2-2.9.3-.3.7-.4 1-.4h.7c.2 0 .5-.1.8.6.3.8 1.1 2.6 1.2 2.8.1.2.1.4 0 .7-.1.2-.2.5-.4.7l-.6.7c-.2.2-.4.4-.2.8.2.4 1 1.7 2.2 2.7 1.5 1.3 2.8 1.8 3.2 2 .4.2.6.1.9-.1.2-.3 1-1.2 1.3-1.6.3-.4.5-.3.9-.2.4.1 2.4 1.1 2.8 1.3.4.2.7.3.8.5.1.2.1 1-.2 1.8z" />
      </svg>
      {content.whatsappButton.label && <span>{content.whatsappButton.label}</span>}
    </a>
  );
}

function PublicSite({ content }: { content: SiteContent }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [serviceLb, setServiceLb] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<string>('');

  const { work, services, categories, social } = content;
  const filters = [{ id: 'all', label: 'All work' }, ...categories];
  const shown = filter === 'all' ? work : work.filter((w) => w.categoryId === filter);

  // Keep the browser tab title in sync with the editable site title.
  useEffect(() => {
    if (content.site.title) document.title = content.site.title;
  }, [content.site.title]);

  // Highlight the nav link of the section currently on screen.
  useEffect(() => {
    const sections = content.nav
      .map((n) => document.getElementById(n.href.replace('#', '')))
      .filter(Boolean) as HTMLElement[];
    if (sections.length === 0 || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(`#${e.target.id}`);
        });
      },
      { rootMargin: '-35% 0px -55% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [content]);

  // Scroll reveal: segments slide in when they enter view and out when they leave.
  useEffect(() => {
    const selectors =
      '.section-heading, .hero-copy, .hero-featured, .service-card, .work-card, .book-card, .process-grid article, .practice-lead-block, .practice-statement, .contact-details';
    const els = Array.from(document.querySelectorAll<HTMLElement>(selectors));
    els.forEach((el) => el.classList.add('reveal'));
    document.querySelectorAll('.service-grid, .work-grid, .books-grid, .process-grid').forEach((grid) => {
      Array.from(grid.children).forEach((child, i) => {
        (child as HTMLElement).style.transitionDelay = `${Math.min(i, 8) * 55}ms`;
      });
    });

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle('is-visible', e.isIntersecting)),
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [filter, content]);

  // Lightbox: lock scroll and enable keyboard navigation while open.
  useEffect(() => {
    if (lightbox === null) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
      else if (e.key === 'ArrowLeft') setLightbox((v) => (v === null ? v : (v - 1 + shown.length) % shown.length));
      else if (e.key === 'ArrowRight') setLightbox((v) => (v === null ? v : (v + 1) % shown.length));
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox, shown.length]);

  // Service detail: lock scroll and enable keyboard navigation while open.
  useEffect(() => {
    if (serviceLb === null) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setServiceLb(null);
      else if (e.key === 'ArrowLeft') setServiceLb((v) => (v === null ? v : (v - 1 + services.length) % services.length));
      else if (e.key === 'ArrowRight') setServiceLb((v) => (v === null ? v : (v + 1) % services.length));
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [serviceLb, services.length]);

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label={`${content.brand.name}, home`}>
          <span className="brand-mark">
            {content.brand.logo ? (
              <img src={content.brand.logo} alt={content.brand.name} />
            ) : (
              content.brand.mark
            )}
          </span>
          <span className="brand-name">{content.brand.name}</span>
        </a>

        <nav className="desktop-nav" aria-label="Main navigation">
          {content.nav.map((n) => (
            <a key={n.href} href={n.href} className={activeSection === n.href ? 'is-active' : ''}>{n.label}</a>
          ))}
        </nav>

        <a
          className="header-cta wa-header-cta"
          href={waLink(content.contact.whatsappNumber, content.contact.whatsappMessage)}
          target="_blank"
          rel="noreferrer"
          aria-label="Contact Victor on WhatsApp"
        >
          <MessageCircle size={16} /> WhatsApp
        </a>

        <a
          className="header-cta"
          href={`mailto:${content.header.ctaEmail}?subject=Project%20enquiry`}
        >
          {content.header.ctaLabel} <ArrowRight size={16} />
        </a>

        <button
          className="menu-button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        {menuOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            <a
              className="mobile-wa"
              href={waLink(content.contact.whatsappNumber, content.contact.whatsappMessage)}
              target="_blank"
              rel="noreferrer"
              onClick={() => setMenuOpen(false)}
            >
              <MessageCircle size={19} /> Chat on WhatsApp
            </a>
            {content.nav.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setMenuOpen(false)}>
                {n.label}
                <ArrowDownRight size={18} />
              </a>
            ))}
            <a
              className="mobile-email"
              href={`mailto:${content.header.ctaEmail}?subject=Project%20enquiry`}
              onClick={() => setMenuOpen(false)}
            >
              <Mail size={17} /> {content.header.ctaLabel}
            </a>
          </nav>
        )}
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <p className="kicker">{content.hero.kicker}</p>
            <h1>{content.hero.title}</h1>
            <p className="hero-intro">{content.hero.intro}</p>
            <div className="hero-actions">
              <a
                className="button button-wa"
                href={waLink(content.contact.whatsappNumber, content.contact.whatsappMessage)}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={18} /> {content.hero.secondaryLabel}
              </a>
              <a className="button button-ghost" href="#work">
                {content.hero.primaryLabel} <ArrowRight size={17} />
              </a>
            </div>
            <ul className="hero-chips" aria-label="Quick facts">
              <li><Clock3 size={14} /> Fast replies on WhatsApp</li>
              <li><Globe2 size={14} /> {content.contact.location}</li>
            </ul>
            {social.length > 0 && (
              <div className="hero-social" aria-label="Social links">
                {social.map((s) => (
                  <a key={s.id} href={s.url} target="_blank" rel="noreferrer" aria-label={s.label} title={s.label}>
                    <SocialIcon platform={s.platform} size={18} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <figure className="hero-featured">
            <div className="artframe artframe--feature">
              <img src={content.hero.image} alt={content.hero.imageAlt} onError={onImgError} />
            </div>
            <figcaption>
              <span>{content.hero.captionTitle}</span>
              <span>{content.hero.captionPlace}</span>
            </figcaption>
          </figure>
        </section>

        <section className="marquee" aria-label="Areas of practice">
          {content.marquee.map((word, i) => (
            <span key={`${word}-${i}`} className="marquee-item">
              <span>{word}</span>
              {i < content.marquee.length - 1 && <i />}
            </span>
          ))}
        </section>

        <section id="work" className="work-section section-pad">
          <div className="section-heading">
            <p className="kicker">{content.workSection.kicker}</p>
            <h2>{content.workSection.title}</h2>
            <p>{content.workSection.intro}</p>
          </div>

          <div className="work-filters" role="tablist" aria-label="Filter work">
            {filters.map((f) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={filter === f.id}
                className={filter === f.id ? 'is-active' : ''}
                onClick={() => {
                  setFilter(f.id);
                  setLightbox(null);
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="work-grid">
            {shown.map((w, i) => (
              <figure className="work-card" key={w.id}>
                <button
                  type="button"
                  className="artframe frame-btn"
                  onClick={() => setLightbox(i)}
                  aria-label={`View ${w.title}`}
                >
                  <img src={w.image} alt={`${w.label} — ${w.title}`} loading="lazy" onError={onImgError} />
                  {w.tag && <span className="work-tag">{w.tag}</span>}
                  <span className="frame-view">View</span>
                </button>
                <figcaption>
                  <span className="work-title">{w.title}</span>
                  <span className="work-meta">{w.label} · {w.year}</span>
                </figcaption>
              </figure>
            ))}
          </div>

          {content.workSection.note && <p className="work-note">{content.workSection.note}</p>}
        </section>

        {content.books.length > 0 && (
          <section id="books" className="books-section section-pad">
            <div className="section-heading">
              <p className="kicker">{content.booksSection.kicker}</p>
              <h2>{content.booksSection.title}</h2>
              <p>{content.booksSection.intro}</p>
            </div>

            <div className="books-grid">
              {content.books.map((book) => (
                <article className="book-card" key={book.id}>
                  <div className="book-cover">
                    <img src={book.image} alt={book.title} loading="lazy" onError={onImgError} />
                  </div>
                  <div className="book-card-body">
                    <h3>{book.title}</h3>
                    {book.blurb && <p>{book.blurb}</p>}
                    {book.linkUrl && (
                      <a
                        className="book-link"
                        href={book.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {book.linkLabel || 'Buy / Download'} <ArrowRight size={15} />
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section id="services" className="services-section section-pad">
          <div className="section-heading">
            <p className="kicker">{content.servicesSection.kicker}</p>
            <h2>{content.servicesSection.title}</h2>
            <p>{content.servicesSection.intro}</p>
          </div>

          <div className="service-grid">
            {services.map((service, index) => (
              <article className="service-card" key={service.id}>
                <button
                  type="button"
                  className="artframe artframe--wide frame-btn"
                  onClick={() => setServiceLb(index)}
                  aria-label={`About ${service.title}`}
                >
                  <img src={service.image} alt={service.title} loading="lazy" onError={onImgError} />
                  <span className="frame-view">Details</span>
                </button>
                <div className="service-card-body">
                  <span className="service-number">{String(index + 1).padStart(2, '0')}</span>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                  <button type="button" className="service-more" onClick={() => setServiceLb(index)}>
                    Read more <ArrowRight size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="practice" className="practice-section section-pad">
          <div className="section-heading">
            <p className="kicker">{content.about.kicker}</p>
            <h2>{content.about.title}</h2>
            <p>{content.about.intro}</p>
          </div>

          <div className="practice-body">
            <div className="practice-lead-block">
              <p className="practice-lead">{content.about.lead}</p>
              <p>{content.about.body}</p>
              <div className="about-links">
                <a
                  className="text-link"
                  href={`mailto:${content.about.linkEmail}?subject=Portfolio%20request`}
                >
                  {content.about.linkLabel} <ArrowRight size={16} />
                </a>
                <a
                  className="text-link about-wa"
                  href={waLink(
                    content.contact.whatsappNumber,
                    'Hello Victor, could you send me a relevant portfolio selection?',
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle size={15} /> Ask on WhatsApp instead
                </a>
              </div>
            </div>

            <figure className="practice-statement">
              <blockquote>{content.about.quote}</blockquote>
              <figcaption>{content.about.quoteBy}</figcaption>
            </figure>
          </div>
        </section>

        <section id="process" className="process-section section-pad">
          <div className="section-heading process-heading">
            <p className="kicker">{content.processSection.kicker}</p>
            <h2>{content.processSection.title}</h2>
          </div>
          <div className="process-grid">
            {content.process.map((step) => (
              <article key={step.id}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="contact-section section-pad">
          <div className="section-heading">
            <p className="kicker">{content.contact.kicker}</p>
            <h2>{content.contact.title}</h2>
            <p>{content.contact.intro}</p>
          </div>
          <div className="contact-layout">
            <div className="contact-details">
              <a
                className="contact-wa-row"
                href={waLink(content.contact.whatsappNumber, content.contact.whatsappMessage)}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={19} />
                <span>
                  <small>WhatsApp — fastest reply</small>
                  {content.contact.whatsappDisplay}
                </span>
                <span className="wa-pill">Chat now</span>
              </a>
              <a href={`mailto:${content.contact.email}?subject=Project%20enquiry`}>
                <Mail size={19} />
                <span><small>Email</small>{content.contact.email}</span>
                <ArrowRight size={19} />
              </a>
              <div className="location-line"><Globe2 size={18} /> {content.contact.location}</div>

              {social.length > 0 && (
                <div className="contact-social" aria-label="Follow on social media">
                  {social.map((s) => (
                    <a key={s.id} href={s.url} target="_blank" rel="noreferrer" aria-label={s.label} title={s.label}>
                      <SocialIcon platform={s.platform} size={20} />
                      <span>{s.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <ContactForm content={content} />

            {content.contact.qrImage && (
              <figure className="contact-qr">
                <img src={content.contact.qrImage} alt={content.contact.qrCaption} onError={onImgError} />
                <figcaption>{content.contact.qrCaption}</figcaption>
              </figure>
            )}
          </div>
        </section>
      </main>

      <FloatingWhatsApp content={content} />

      <footer className="site-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="footer-mark">
              {content.brand.logo ? (
                <img src={content.brand.logo} alt={content.brand.name} />
              ) : (
                content.footer.mark
              )}
            </span>
            <div>
              <strong>{content.footer.name}</strong>
              <p>{content.site.description}</p>
              {social.length > 0 && (
                <div className="footer-social">
                  {social.map((s) => (
                    <a key={s.id} href={s.url} target="_blank" rel="noreferrer" aria-label={s.label} title={s.label}>
                      <SocialIcon platform={s.platform} size={17} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="footer-col">
            <h4>Explore</h4>
            {content.nav.map((n) => (
              <a key={n.href} href={n.href}>{n.label}</a>
            ))}
          </div>

          <div className="footer-col">
            <h4>Get in touch</h4>
            <a className="footer-wa" href={waLink(content.contact.whatsappNumber, content.contact.whatsappMessage)} target="_blank" rel="noreferrer">
              <MessageCircle size={15} /> {content.contact.whatsappDisplay}
            </a>
            <a href={`mailto:${content.contact.email}`}>
              <Mail size={15} /> {content.contact.email}
            </a>
            <span className="footer-loc"><Globe2 size={15} /> {content.contact.location}</span>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} {content.footer.name}
            {' · '}
            <a className="footer-credit" href="https://solomon-ey.netlify.app/" target="_blank" rel="noreferrer">
              Developer
            </a>
          </p>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>

      {lightbox !== null && shown[lightbox] && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setLightbox(null)}>
          <button className="lb-close" onClick={() => setLightbox(null)} aria-label="Close viewer">
            <X size={22} />
          </button>

          <div className="lb-panel" onClick={(e) => e.stopPropagation()}>
            <div className="lb-image">
              <img src={shown[lightbox].image} alt={shown[lightbox].title} onError={onImgError} />
            </div>

            <div className="lb-info">
              <p className="lb-cat">{shown[lightbox].label}</p>
              <h3 className="lb-title">{shown[lightbox].title}</h3>

              <dl className="lb-facts">
                <div><dt>Year</dt><dd>{shown[lightbox].year}</dd></div>
                <div><dt>Client</dt><dd>{shown[lightbox].client}</dd></div>
                <div><dt>Scope</dt><dd>{shown[lightbox].scope}</dd></div>
              </dl>

              <p className="lb-about">{shown[lightbox].about}</p>

              <div className="lb-footer">
                <button
                  className="lb-nav"
                  onClick={() => setLightbox((v) => (v === null ? v : (v - 1 + shown.length) % shown.length))}
                  aria-label="Previous piece"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="lb-count">{lightbox + 1} / {shown.length}</span>
                <button
                  className="lb-nav"
                  onClick={() => setLightbox((v) => (v === null ? v : (v + 1) % shown.length))}
                  aria-label="Next piece"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {serviceLb !== null && services[serviceLb] && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setServiceLb(null)}>
          <button className="lb-close" onClick={() => setServiceLb(null)} aria-label="Close">
            <X size={22} />
          </button>

          <div className="lb-panel" onClick={(e) => e.stopPropagation()}>
            <div className="lb-image">
              <img src={services[serviceLb].image} alt={services[serviceLb].title} onError={onImgError} />
            </div>

            <div className="lb-info">
              <p className="lb-cat">Service · {String(serviceLb + 1).padStart(2, '0')}</p>
              <h3 className="lb-title">{services[serviceLb].title}</h3>

              <p className="lb-about">{services[serviceLb].about}</p>

              <p className="lb-includes-label">What’s included</p>
              <ul className="lb-includes">
                {services[serviceLb].includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <div className="lb-cta-row">
                <a
                  className="lb-cta-wa"
                  href={waLink(
                    content.contact.whatsappNumber,
                    `Hello Victor, I'm interested in ${services[serviceLb].title}.`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle size={16} /> Ask about this on WhatsApp
                </a>
                <a
                  className="lb-cta"
                  href={`mailto:${content.contact.email}?subject=${encodeURIComponent(
                    services[serviceLb].title + ' enquiry',
                  )}`}
                >
                  Prefer email? <ArrowRight size={15} />
                </a>
              </div>

              <div className="lb-footer">
                <button
                  className="lb-nav"
                  onClick={() => setServiceLb((v) => (v === null ? v : (v - 1 + services.length) % services.length))}
                  aria-label="Previous service"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="lb-count">{serviceLb + 1} / {services.length}</span>
                <button
                  className="lb-nav"
                  onClick={() => setServiceLb((v) => (v === null ? v : (v + 1) % services.length))}
                  aria-label="Next service"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function App() {
  const [hash, setHash] = useState(typeof window !== 'undefined' ? window.location.hash : '');
  const [content, setContent] = useState<SiteContent | null>(null);

  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    let alive = true;
    loadContent().then((c) => {
      if (alive) setContent(c);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (hash === '#admin') {
    return <Admin initialContent={content ?? defaultContent} onSaved={setContent} />;
  }

  if (!content) {
    return (
      <div className="site-loading" role="status" aria-live="polite">
        <span className="site-loading-mark">{defaultContent.brand.mark}</span>
      </div>
    );
  }

  return <PublicSite content={content} />;
}

export default App;
