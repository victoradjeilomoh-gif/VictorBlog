import { useMemo, useRef, useState } from 'react';
import {
  LayoutDashboard,
  Images,
  Briefcase,
  ExternalLink,
  LogOut,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Upload,
  Save,
  Lock,
  LogIn,
  Home,
  Type,
  ListOrdered,
  Wrench,
  Phone,
  Share2,
  AlertCircle,
  CheckCircle2,
  Loader,
  RotateCcw,
  X,
} from 'lucide-react';
import type { SiteContent, WorkItem, ServiceItem, ProcessStep, Category, NavLink, SocialLink } from './content/types';
import { defaultContent } from './content/defaultContent';
import { saveContent, uploadImage, verifyPassword } from './content/api';
import { SocialIcon, SOCIAL_PLATFORMS } from './components/SocialIcon';

type View =
  | 'overview'
  | 'brand'
  | 'hero'
  | 'work'
  | 'services'
  | 'about'
  | 'process'
  | 'contact'
  | 'social';

const nav: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'brand', label: 'Brand & menu', icon: Home },
  { id: 'hero', label: 'Hero', icon: Type },
  { id: 'work', label: 'Portfolio', icon: Images },
  { id: 'services', label: 'Services', icon: Briefcase },
  { id: 'about', label: 'About', icon: ListOrdered },
  { id: 'process', label: 'Process', icon: Wrench },
  { id: 'contact', label: 'Contact & QR', icon: Phone },
  { id: 'social', label: 'Social links', icon: Share2 },
];

const SESSION_KEY = 'val-admin-pw';

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function updateItem<T>(arr: T[], i: number, patch: Partial<T>): T[] {
  return arr.map((x, idx) => (idx === i ? { ...x, ...patch } : x));
}
function removeAt<T>(arr: T[], i: number): T[] {
  return arr.filter((_, idx) => idx !== i);
}
function moveAt<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const copy = [...arr];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
}

/* ---------------------------------------------------------------- fields */

function Field({
  label,
  value,
  onChange,
  placeholder,
  full,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  full?: boolean;
}) {
  return (
    <label className={`ed-field${full ? ' full' : ''}`}>
      <span>{label}</span>
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="ed-field full">
      <span>{label}</span>
      <textarea value={value} rows={rows} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function ImageField({
  label,
  value,
  onChange,
  password,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  password: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr('');
    const res = await uploadImage(file, password);
    setBusy(false);
    if (res.ok && res.url) onChange(res.url);
    else setErr(res.error || 'Upload failed.');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="img-field">
      <span className="ed-label">{label}</span>
      <div className="img-field-row">
        <div className="img-thumb">
          {value ? (
            <img
              src={value}
              alt=""
              onError={(ev) => {
                (ev.currentTarget as HTMLImageElement).style.opacity = '0.25';
              }}
            />
          ) : (
            <span>No image</span>
          )}
        </div>
        <div className="img-field-controls">
          <button type="button" className="btn-line" onClick={() => inputRef.current?.click()} disabled={busy}>
            {busy ? <Loader size={15} className="spin" /> : <Upload size={15} />}
            {busy ? 'Uploading…' : 'Upload image'}
          </button>
          <input
            className="img-url"
            value={value}
            placeholder="…or paste an image URL"
            onChange={(e) => onChange(e.target.value)}
          />
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={onFile} />
          {err && <p className="ed-err-inline">{err}</p>}
        </div>
      </div>
    </div>
  );
}

function StringList({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="ed-field full">
      <span>{label}</span>
      <div className="str-list">
        {items.map((item, i) => (
          <div className="str-row" key={i}>
            <input
              value={item}
              placeholder={placeholder}
              onChange={(e) => onChange(items.map((x, idx) => (idx === i ? e.target.value : x)))}
            />
            <button type="button" aria-label="Remove" onClick={() => onChange(removeAt(items, i))}>
              <X size={15} />
            </button>
          </div>
        ))}
        <button type="button" className="btn-line sm" onClick={() => onChange([...items, ''])}>
          <Plus size={14} /> Add
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- login gate */

function Login({ onAuthed }: { onAuthed: (pw: string) => void }) {
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    const res = await verifyPassword(pw);
    setBusy(false);
    if (res.ok) {
      try {
        sessionStorage.setItem(SESSION_KEY, pw);
      } catch {
        /* ignore */
      }
      onAuthed(pw);
    } else {
      setErr('Incorrect password. Please try again.');
    }
  };

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={submit}>
        <span className="login-mark">{defaultContent.brand.mark}</span>
        <h1>Studio admin</h1>
        <p>Sign in to edit the website content.</p>
        <label className="login-input">
          <Lock size={16} />
          <input
            type="password"
            value={pw}
            autoFocus
            placeholder="Admin password"
            onChange={(e) => setPw(e.target.value)}
          />
        </label>
        {err && (
          <p className="login-err">
            <AlertCircle size={15} /> {err}
          </p>
        )}
        <button type="submit" className="btn-solid" disabled={busy || !pw}>
          {busy ? <Loader size={16} className="spin" /> : <LogIn size={16} />}
          {busy ? 'Checking…' : 'Sign in'}
        </button>
        <a className="login-back" href="#top" onClick={() => (window.location.hash = '')}>
          ← Back to the site
        </a>
      </form>
    </div>
  );
}

/* ---------------------------------------------------------------- editor */

export function Admin({
  initialContent,
  onSaved,
}: {
  initialContent: SiteContent;
  onSaved: (c: SiteContent) => void;
}) {
  const stored = (() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) || '';
    } catch {
      return '';
    }
  })();

  const [password, setPassword] = useState(stored);
  const [authed, setAuthed] = useState(!!stored);
  const [view, setView] = useState<View>('overview');
  const [draft, setDraft] = useState<SiteContent>(() => structuredClone(initialContent));
  const [saved, setSaved] = useState<SiteContent>(() => structuredClone(initialContent));
  const [status, setStatus] = useState<'idle' | 'saving' | 'ok' | 'local' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  if (!authed) {
    return (
      <Login
        onAuthed={(pw) => {
          setPassword(pw);
          setAuthed(true);
        }}
      />
    );
  }

  const patch = (p: Partial<SiteContent>) => setDraft((d) => ({ ...d, ...p }));

  const save = async () => {
    setStatus('saving');
    setStatusMsg('');
    const res = await saveContent(draft, password);
    if (res.ok) {
      setSaved(structuredClone(draft));
      onSaved(draft);
      setStatus(res.local ? 'local' : 'ok');
      setStatusMsg(res.local ? 'Saved locally (no server) — deploy to Netlify for live saving.' : 'All changes are live.');
      setTimeout(() => setStatus((s) => (s === 'ok' || s === 'local' ? 'idle' : s)), 4000);
    } else {
      setStatus('error');
      setStatusMsg(res.error || 'Could not save.');
    }
  };

  const resetAll = () => {
    if (confirm('Discard all unsaved changes and reload the last saved version?')) {
      setDraft(structuredClone(saved));
    }
  };

  const signOut = () => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    setAuthed(false);
    setPassword('');
  };

  const title = nav.find((n) => n.id === view)?.label ?? 'Overview';

  return (
    <div className="admin">
      <aside className="admin-side">
        <div className="admin-brand">
          <span className="admin-mark">{draft.brand.mark}</span>
          <span>
            <strong>{draft.brand.name}</strong>
            <small>Studio admin</small>
          </span>
        </div>

        <nav className="admin-nav">
          {nav.map(({ id, label, icon: Icon }) => (
            <button key={id} className={view === id ? 'active' : ''} onClick={() => setView(id)}>
              <Icon size={18} strokeWidth={1.8} />
              {label}
            </button>
          ))}
        </nav>

        <div className="admin-side-foot">
          <a href="#top" onClick={() => (window.location.hash = '')}>
            <ExternalLink size={16} /> View live site
          </a>
          <button onClick={signOut}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-top">
          <div>
            <h1>{title}</h1>
            <p>{dirty ? 'You have unsaved changes' : 'Everything is saved'}</p>
          </div>
          <div className="save-bar">
            {status !== 'idle' && (
              <span className={`save-status is-${status}`}>
                {status === 'saving' && <Loader size={15} className="spin" />}
                {(status === 'ok' || status === 'local') && <CheckCircle2 size={15} />}
                {status === 'error' && <AlertCircle size={15} />}
                {status === 'saving' ? 'Saving…' : statusMsg}
              </span>
            )}
            {dirty && (
              <button className="btn-line" onClick={resetAll} title="Discard changes">
                <RotateCcw size={15} /> Discard
              </button>
            )}
            <button className="btn-solid" onClick={save} disabled={status === 'saving' || !dirty}>
              <Save size={16} /> {dirty ? 'Save changes' : 'Saved'}
            </button>
          </div>
        </header>

        <div className="admin-body">
          {view === 'overview' && <Overview draft={draft} setView={setView} dirty={dirty} onSave={save} />}

          {view === 'brand' && (
            <div className="ed-section">
              <Panel title="Site & SEO">
                <div className="ed-grid">
                  <Field label="Browser tab / SEO title" full value={draft.site.title} onChange={(v) => patch({ site: { ...draft.site, title: v } })} />
                  <Area label="SEO description" value={draft.site.description} onChange={(v) => patch({ site: { ...draft.site, description: v } })} />
                </div>
              </Panel>

              <Panel title="Brand identity">
                <div className="ed-grid">
                  <Field label="Brand monogram (e.g. VL)" value={draft.brand.mark} onChange={(v) => patch({ brand: { ...draft.brand, mark: v } })} />
                  <Field label="Brand / artist name" value={draft.brand.name} onChange={(v) => patch({ brand: { ...draft.brand, name: v } })} />
                  <Field label="Header button label" value={draft.header.ctaLabel} onChange={(v) => patch({ header: { ...draft.header, ctaLabel: v } })} />
                  <Field label="Header button email" value={draft.header.ctaEmail} onChange={(v) => patch({ header: { ...draft.header, ctaEmail: v } })} />
                </div>
              </Panel>

              <Panel
                title="Navigation menu"
                action={
                  <button className="btn-line sm" onClick={() => patch({ nav: [...draft.nav, { label: 'New', href: '#work' }] })}>
                    <Plus size={14} /> Add link
                  </button>
                }
              >
                {draft.nav.map((n: NavLink, i) => (
                  <div className="ed-inline-row" key={i}>
                    <input value={n.label} placeholder="Label" onChange={(e) => patch({ nav: updateItem(draft.nav, i, { label: e.target.value }) })} />
                    <input value={n.href} placeholder="#anchor" onChange={(e) => patch({ nav: updateItem(draft.nav, i, { href: e.target.value }) })} />
                    <RowButtons onUp={() => patch({ nav: moveAt(draft.nav, i, -1) })} onDown={() => patch({ nav: moveAt(draft.nav, i, 1) })} onDelete={() => patch({ nav: removeAt(draft.nav, i) })} />
                  </div>
                ))}
              </Panel>

              <Panel title="Marquee strip">
                <StringList label="Rotating words shown under the hero" items={draft.marquee} placeholder="Word" onChange={(marquee) => patch({ marquee })} />
              </Panel>

              <Panel title="Footer">
                <div className="ed-grid">
                  <Field label="Footer monogram" value={draft.footer.mark} onChange={(v) => patch({ footer: { ...draft.footer, mark: v } })} />
                  <Field label="Footer name" value={draft.footer.name} onChange={(v) => patch({ footer: { ...draft.footer, name: v } })} />
                </div>
              </Panel>
            </div>
          )}

          {view === 'hero' && (
            <div className="ed-section">
              <Panel title="Hero content">
                <div className="ed-grid">
                  <Field label="Kicker (small label above heading)" full value={draft.hero.kicker} onChange={(v) => patch({ hero: { ...draft.hero, kicker: v } })} />
                  <Field label="Main heading" full value={draft.hero.title} onChange={(v) => patch({ hero: { ...draft.hero, title: v } })} />
                  <Area label="Intro paragraph" value={draft.hero.intro} onChange={(v) => patch({ hero: { ...draft.hero, intro: v } })} />
                  <Field label="Primary button label" value={draft.hero.primaryLabel} onChange={(v) => patch({ hero: { ...draft.hero, primaryLabel: v } })} />
                  <Field label="Secondary link label" value={draft.hero.secondaryLabel} onChange={(v) => patch({ hero: { ...draft.hero, secondaryLabel: v } })} />
                </div>
              </Panel>
              <Panel title="Hero image">
                <ImageField label="Featured image" value={draft.hero.image} password={password} onChange={(v) => patch({ hero: { ...draft.hero, image: v } })} />
                <div className="ed-grid">
                  <Field label="Image alt text" full value={draft.hero.imageAlt} onChange={(v) => patch({ hero: { ...draft.hero, imageAlt: v } })} />
                  <Field label="Caption title" value={draft.hero.captionTitle} onChange={(v) => patch({ hero: { ...draft.hero, captionTitle: v } })} />
                  <Field label="Caption location" value={draft.hero.captionPlace} onChange={(v) => patch({ hero: { ...draft.hero, captionPlace: v } })} />
                </div>
              </Panel>
            </div>
          )}

          {view === 'work' && (
            <div className="ed-section">
              <Panel title="Portfolio section text">
                <div className="ed-grid">
                  <Field label="Kicker" value={draft.workSection.kicker} onChange={(v) => patch({ workSection: { ...draft.workSection, kicker: v } })} />
                  <Field label="Heading" value={draft.workSection.title} onChange={(v) => patch({ workSection: { ...draft.workSection, title: v } })} />
                  <Area label="Intro paragraph" value={draft.workSection.intro} onChange={(v) => patch({ workSection: { ...draft.workSection, intro: v } })} />
                  <Area label="Note under the gallery (leave blank to hide)" value={draft.workSection.note} onChange={(v) => patch({ workSection: { ...draft.workSection, note: v } })} />
                </div>
              </Panel>

              <Panel
                title="Filter categories"
                action={
                  <button className="btn-line sm" onClick={() => patch({ categories: [...draft.categories, { id: uid('cat'), label: 'New' }] })}>
                    <Plus size={14} /> Add category
                  </button>
                }
              >
                {draft.categories.map((c: Category, i) => (
                  <div className="ed-inline-row" key={c.id}>
                    <input value={c.label} placeholder="Label" onChange={(e) => patch({ categories: updateItem(draft.categories, i, { label: e.target.value }) })} />
                    <span className="ed-hint-tag">id: {c.id}</span>
                    <RowButtons onUp={() => patch({ categories: moveAt(draft.categories, i, -1) })} onDown={() => patch({ categories: moveAt(draft.categories, i, 1) })} onDelete={() => patch({ categories: removeAt(draft.categories, i) })} />
                  </div>
                ))}
              </Panel>

              <Panel
                title={`Portfolio pieces (${draft.work.length})`}
                action={
                  <button
                    className="btn-solid sm"
                    onClick={() =>
                      patch({
                        work: [
                          { id: uid('w'), title: 'New piece', categoryId: draft.categories[0]?.id ?? '', label: '', year: String(new Date().getFullYear()), client: '', scope: '', about: '', image: '', tag: 'Sample' },
                          ...draft.work,
                        ],
                      })
                    }
                  >
                    <Plus size={15} /> Add piece
                  </button>
                }
              >
                <div className="card-list">
                  {draft.work.map((w: WorkItem, i) => (
                    <div className="ed-card" key={w.id}>
                      <div className="ed-card-head">
                        <strong>{w.title || 'Untitled piece'}</strong>
                        <RowButtons onUp={() => patch({ work: moveAt(draft.work, i, -1) })} onDown={() => patch({ work: moveAt(draft.work, i, 1) })} onDelete={() => confirm(`Delete “${w.title}”?`) && patch({ work: removeAt(draft.work, i) })} />
                      </div>
                      <ImageField label="Artwork image" value={w.image} password={password} onChange={(v) => patch({ work: updateItem(draft.work, i, { image: v }) })} />
                      <div className="ed-grid">
                        <Field label="Title" value={w.title} onChange={(v) => patch({ work: updateItem(draft.work, i, { title: v }) })} />
                        <label className="ed-field">
                          <span>Filter category</span>
                          <select value={w.categoryId} onChange={(e) => patch({ work: updateItem(draft.work, i, { categoryId: e.target.value }) })}>
                            {draft.categories.map((c) => (
                              <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                          </select>
                        </label>
                        <Field label="Card label (e.g. Book illustration)" value={w.label} onChange={(v) => patch({ work: updateItem(draft.work, i, { label: v }) })} />
                        <Field label="Year" value={w.year} onChange={(v) => patch({ work: updateItem(draft.work, i, { year: v }) })} />
                        <Field label="Client" value={w.client} onChange={(v) => patch({ work: updateItem(draft.work, i, { client: v }) })} />
                        <Field label="Scope" value={w.scope} onChange={(v) => patch({ work: updateItem(draft.work, i, { scope: v }) })} />
                        <Field label="Corner tag (e.g. Sample)" value={w.tag} onChange={(v) => patch({ work: updateItem(draft.work, i, { tag: v }) })} />
                        <Area label="About this piece" value={w.about} onChange={(v) => patch({ work: updateItem(draft.work, i, { about: v }) })} />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          )}

          {view === 'services' && (
            <div className="ed-section">
              <Panel title="Services section text">
                <div className="ed-grid">
                  <Field label="Kicker" value={draft.servicesSection.kicker} onChange={(v) => patch({ servicesSection: { ...draft.servicesSection, kicker: v } })} />
                  <Field label="Heading" value={draft.servicesSection.title} onChange={(v) => patch({ servicesSection: { ...draft.servicesSection, title: v } })} />
                  <Area label="Intro paragraph" value={draft.servicesSection.intro} onChange={(v) => patch({ servicesSection: { ...draft.servicesSection, intro: v } })} />
                </div>
              </Panel>

              <Panel
                title={`Services (${draft.services.length})`}
                action={
                  <button
                    className="btn-solid sm"
                    onClick={() => patch({ services: [...draft.services, { id: uid('s'), title: 'New service', text: '', about: '', includes: [], image: '' }] })}
                  >
                    <Plus size={15} /> Add service
                  </button>
                }
              >
                <div className="card-list">
                  {draft.services.map((s: ServiceItem, i) => (
                    <div className="ed-card" key={s.id}>
                      <div className="ed-card-head">
                        <strong>{s.title || 'Untitled service'}</strong>
                        <RowButtons onUp={() => patch({ services: moveAt(draft.services, i, -1) })} onDown={() => patch({ services: moveAt(draft.services, i, 1) })} onDelete={() => confirm(`Delete “${s.title}”?`) && patch({ services: removeAt(draft.services, i) })} />
                      </div>
                      <ImageField label="Service image" value={s.image} password={password} onChange={(v) => patch({ services: updateItem(draft.services, i, { image: v }) })} />
                      <div className="ed-grid">
                        <Field label="Title" full value={s.title} onChange={(v) => patch({ services: updateItem(draft.services, i, { title: v }) })} />
                        <Area label="Short line (card)" value={s.text} onChange={(v) => patch({ services: updateItem(draft.services, i, { text: v }) })} rows={2} />
                        <Area label="Full description (detail panel)" value={s.about} onChange={(v) => patch({ services: updateItem(draft.services, i, { about: v }) })} />
                      </div>
                      <StringList label="What’s included" items={s.includes} placeholder="Deliverable" onChange={(includes) => patch({ services: updateItem(draft.services, i, { includes }) })} />
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          )}

          {view === 'about' && (
            <div className="ed-section">
              <Panel title="About section">
                <div className="ed-grid">
                  <Field label="Kicker" value={draft.about.kicker} onChange={(v) => patch({ about: { ...draft.about, kicker: v } })} />
                  <Field label="Heading" value={draft.about.title} onChange={(v) => patch({ about: { ...draft.about, title: v } })} />
                  <Area label="Intro paragraph" value={draft.about.intro} onChange={(v) => patch({ about: { ...draft.about, intro: v } })} />
                  <Area label="Lead statement" value={draft.about.lead} onChange={(v) => patch({ about: { ...draft.about, lead: v } })} rows={2} />
                  <Area label="Supporting paragraph" value={draft.about.body} onChange={(v) => patch({ about: { ...draft.about, body: v } })} />
                  <Field label="Link label" value={draft.about.linkLabel} onChange={(v) => patch({ about: { ...draft.about, linkLabel: v } })} />
                  <Field label="Link email" value={draft.about.linkEmail} onChange={(v) => patch({ about: { ...draft.about, linkEmail: v } })} />
                  <Area label="Pull quote" value={draft.about.quote} onChange={(v) => patch({ about: { ...draft.about, quote: v } })} rows={2} />
                  <Field label="Quote attribution" full value={draft.about.quoteBy} onChange={(v) => patch({ about: { ...draft.about, quoteBy: v } })} />
                </div>
              </Panel>
            </div>
          )}

          {view === 'process' && (
            <div className="ed-section">
              <Panel title="Process section heading">
                <div className="ed-grid">
                  <Field label="Kicker" value={draft.processSection.kicker} onChange={(v) => patch({ processSection: { ...draft.processSection, kicker: v } })} />
                  <Field label="Heading" value={draft.processSection.title} onChange={(v) => patch({ processSection: { ...draft.processSection, title: v } })} />
                </div>
              </Panel>
              <Panel
                title={`Process steps (${draft.process.length})`}
                action={
                  <button className="btn-line sm" onClick={() => patch({ process: [...draft.process, { id: uid('p'), number: String(draft.process.length + 1).padStart(2, '0'), title: 'New step', text: '' }] })}>
                    <Plus size={14} /> Add step
                  </button>
                }
              >
                <div className="card-list">
                  {draft.process.map((step: ProcessStep, i) => (
                    <div className="ed-card" key={step.id}>
                      <div className="ed-card-head">
                        <strong>Step {step.number}</strong>
                        <RowButtons onUp={() => patch({ process: moveAt(draft.process, i, -1) })} onDown={() => patch({ process: moveAt(draft.process, i, 1) })} onDelete={() => patch({ process: removeAt(draft.process, i) })} />
                      </div>
                      <div className="ed-grid">
                        <Field label="Number" value={step.number} onChange={(v) => patch({ process: updateItem(draft.process, i, { number: v }) })} />
                        <Field label="Title" value={step.title} onChange={(v) => patch({ process: updateItem(draft.process, i, { title: v }) })} />
                        <Area label="Text" value={step.text} onChange={(v) => patch({ process: updateItem(draft.process, i, { text: v }) })} />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          )}

          {view === 'contact' && (
            <div className="ed-section">
              <Panel title="Contact section">
                <div className="ed-grid">
                  <Field label="Kicker" value={draft.contact.kicker} onChange={(v) => patch({ contact: { ...draft.contact, kicker: v } })} />
                  <Field label="Heading" value={draft.contact.title} onChange={(v) => patch({ contact: { ...draft.contact, title: v } })} />
                  <Area label="Intro paragraph" value={draft.contact.intro} onChange={(v) => patch({ contact: { ...draft.contact, intro: v } })} />
                  <Field label="Email address" value={draft.contact.email} onChange={(v) => patch({ contact: { ...draft.contact, email: v } })} />
                  <Field label="WhatsApp (shown on site)" value={draft.contact.whatsappDisplay} onChange={(v) => patch({ contact: { ...draft.contact, whatsappDisplay: v } })} />
                  <Field label="WhatsApp number (digits only, for the link)" value={draft.contact.whatsappNumber} onChange={(v) => patch({ contact: { ...draft.contact, whatsappNumber: v } })} />
                  <Area label="WhatsApp pre-filled message" value={draft.contact.whatsappMessage} onChange={(v) => patch({ contact: { ...draft.contact, whatsappMessage: v } })} rows={2} />
                  <Field label="Location line" full value={draft.contact.location} onChange={(v) => patch({ contact: { ...draft.contact, location: v } })} />
                </div>
              </Panel>
              <Panel title="Contact QR code">
                <ImageField label="QR code image (“Scan to save my contact”)" value={draft.contact.qrImage} password={password} onChange={(v) => patch({ contact: { ...draft.contact, qrImage: v } })} />
                <div className="ed-grid">
                  <Field label="QR caption (leave blank to hide the QR)" full value={draft.contact.qrCaption} onChange={(v) => patch({ contact: { ...draft.contact, qrCaption: v } })} />
                </div>
              </Panel>
            </div>
          )}

          {view === 'social' && (
            <div className="ed-section">
              <Panel
                title={`Social links (${draft.social.length})`}
                action={
                  <button className="btn-solid sm" onClick={() => patch({ social: [...draft.social, { id: uid('soc'), platform: 'facebook', label: 'Facebook', url: '' }] })}>
                    <Plus size={15} /> Add link
                  </button>
                }
              >
                <p className="ed-help">These appear as icons in the hero and the contact section. Choose the platform to set the icon.</p>
                <div className="card-list">
                  {draft.social.map((s: SocialLink, i) => (
                    <div className="ed-card social-card" key={s.id}>
                      <span className="social-preview"><SocialIcon platform={s.platform} size={22} /></span>
                      <div className="ed-grid social-grid">
                        <label className="ed-field">
                          <span>Platform (icon)</span>
                          <select value={s.platform} onChange={(e) => patch({ social: updateItem(draft.social, i, { platform: e.target.value as SocialLink['platform'] }) })}>
                            {SOCIAL_PLATFORMS.map((p) => (
                              <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>
                            ))}
                          </select>
                        </label>
                        <Field label="Label" value={s.label} onChange={(v) => patch({ social: updateItem(draft.social, i, { label: v }) })} />
                        <Field label="URL" full value={s.url} onChange={(v) => patch({ social: updateItem(draft.social, i, { url: v }) })} />
                      </div>
                      <RowButtons onUp={() => patch({ social: moveAt(draft.social, i, -1) })} onDown={() => patch({ social: moveAt(draft.social, i, 1) })} onDelete={() => patch({ social: removeAt(draft.social, i) })} />
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- small helpers */

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function RowButtons({ onUp, onDown, onDelete }: { onUp: () => void; onDown: () => void; onDelete: () => void }) {
  return (
    <div className="row-buttons">
      <button type="button" aria-label="Move up" onClick={onUp}><ChevronUp size={15} /></button>
      <button type="button" aria-label="Move down" onClick={onDown}><ChevronDown size={15} /></button>
      <button type="button" aria-label="Delete" className="danger" onClick={onDelete}><Trash2 size={15} /></button>
    </div>
  );
}

function Overview({ draft, setView, dirty, onSave }: { draft: SiteContent; setView: (v: View) => void; dirty: boolean; onSave: () => void }) {
  const stats = [
    { label: 'Portfolio pieces', value: draft.work.length, view: 'work' as View },
    { label: 'Services', value: draft.services.length, view: 'services' as View },
    { label: 'Process steps', value: draft.process.length, view: 'process' as View },
    { label: 'Social links', value: draft.social.length, view: 'social' as View },
  ];
  return (
    <>
      <div className="stat-row">
        {stats.map((s) => (
          <button className="stat-card as-button" key={s.label} onClick={() => setView(s.view)}>
            <span className="stat-num">{s.value}</span>
            <span className="stat-label">{s.label}</span>
            <span className="stat-sub">Manage →</span>
          </button>
        ))}
      </div>
      <div className="admin-cols">
        <section className="panel">
          <div className="panel-head"><h2>Welcome</h2></div>
          <p className="muted-line" style={{ lineHeight: 1.7 }}>
            Edit any part of the website from the menu on the left — text, images, portfolio pieces,
            services, contact details and social links. Upload images directly; they’re stored with
            your site. When you’re happy, press <strong>Save changes</strong> and the live site
            updates immediately.
          </p>
          {dirty && (
            <button className="btn-solid" style={{ marginTop: 18 }} onClick={onSave}>
              <Save size={16} /> Save changes now
            </button>
          )}
        </section>
        <section className="panel">
          <div className="panel-head"><h2>Jump to a section</h2></div>
          <div className="quick">
            <button onClick={() => setView('hero')}><Type size={16} /> Edit hero</button>
            <button onClick={() => setView('work')}><Images size={16} /> Manage portfolio</button>
            <button onClick={() => setView('contact')}><Phone size={16} /> Contact & QR</button>
            <button onClick={() => setView('social')}><Share2 size={16} /> Social links</button>
          </div>
        </section>
      </div>
    </>
  );
}

export default Admin;
