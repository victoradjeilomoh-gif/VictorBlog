import { useEffect, useState } from 'react';
import { Admin } from './Admin';
import {
  ArrowDownRight,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Globe2,
  Mail,
  Menu,
  MessageCircle,
  X,
} from 'lucide-react';
import { loadContent } from './content/api';
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

function PublicSite({ content }: { content: SiteContent }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [serviceLb, setServiceLb] = useState<number | null>(null);

  const { work, services, categories, social } = content;
  const filters = [{ id: 'all', label: 'All work' }, ...categories];
  const shown = filter === 'all' ? work : work.filter((w) => w.categoryId === filter);

  // Keep the browser tab title in sync with the editable site title.
  useEffect(() => {
    if (content.site.title) document.title = content.site.title;
  }, [content.site.title]);

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
            <a key={n.href} href={n.href}>{n.label}</a>
          ))}
        </nav>

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
            {content.nav.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setMenuOpen(false)}>
                {n.label}
                <ArrowDownRight size={18} />
              </a>
            ))}
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
              <a className="button button-dark" href="#work">
                {content.hero.primaryLabel} <ArrowRight size={17} />
              </a>
              <a className="text-link" href="#contact">{content.hero.secondaryLabel}</a>
            </div>
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
              <a
                className="text-link"
                href={`mailto:${content.about.linkEmail}?subject=Portfolio%20request`}
              >
                {content.about.linkLabel} <ArrowRight size={16} />
              </a>
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
              <a href={`mailto:${content.contact.email}?subject=Project%20enquiry`}>
                <Mail size={19} />
                <span><small>Email</small>{content.contact.email}</span>
                <ArrowRight size={19} />
              </a>
              <a
                href={waLink(content.contact.whatsappNumber, content.contact.whatsappMessage)}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={19} />
                <span><small>WhatsApp</small>{content.contact.whatsappDisplay}</span>
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

            {content.contact.qrImage && (
              <figure className="contact-qr">
                <img src={content.contact.qrImage} alt={content.contact.qrCaption} onError={onImgError} />
                <figcaption>{content.contact.qrCaption}</figcaption>
              </figure>
            )}
          </div>
        </section>
      </main>

      <footer>
        <span className="footer-mark">
          {content.brand.logo ? (
            <img src={content.brand.logo} alt={content.brand.name} />
          ) : (
            content.footer.mark
          )}
        </span>
        <p>
          © {new Date().getFullYear()} {content.footer.name}
          {' · '}
          <a className="footer-credit" href="https://solomon-ey.netlify.app/" target="_blank" rel="noreferrer">
            Developer
          </a>
        </p>
        <a href="#top">Back to top ↑</a>
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

              <a
                className="lb-cta"
                href={`mailto:${content.contact.email}?subject=${encodeURIComponent(
                  services[serviceLb].title + ' enquiry',
                )}`}
              >
                Enquire about this <ArrowRight size={15} />
              </a>

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
