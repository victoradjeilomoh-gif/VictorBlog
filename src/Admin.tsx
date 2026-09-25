import { useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutDashboard,
  Images,
  BookOpen,
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
  MessageCircle,
  Inbox,
  Download,
  Copy,
  Check,
  RefreshCw,
  Palette,
} from 'lucide-react';
import type { SiteContent, WorkItem, ServiceItem, BookItem, ProcessStep, Category, NavLink, SocialLink } from './content/types';
import { defaultContent } from './content/defaultContent';
import { getAuthStatus, saveContent, setPassword as apiSetPassword, uploadImage, verifyPassword, fetchLeads, deleteLead } from './content/api';
import type { Lead } from './content/api';
import { SocialIcon, SOCIAL_PLATFORMS } from './components/SocialIcon';

type View =
  | 'overview'
  | 'look'
  | 'brand'
  | 'hero'
  | 'work'
  | 'books'
  | 'services'
  | 'about'
  | 'process'
  | 'contact'
  | 'whatsapp'
  | 'messages'
  | 'social';

const nav: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'look', label: 'Site look', icon: Palette },
  { id: 'brand', label: 'Brand & menu', icon: Home },
  { id: 'hero', label: 'Hero', icon: Type },
  { id: 'work', label: 'Portfolio', icon: Images },
  { id: 'books', label: 'Books', icon: BookOpen },
  { id: 'services', label: 'Services', icon: Briefcase },
  { id: 'about', label: 'About', icon: ListOrdered },
  { id: 'process', label: 'Process', icon: Wrench },
  { id: 'contact', label: 'Contact & QR', icon: Phone },
  { id: 'whatsapp', label: 'WhatsApp & form', icon: MessageCircle },
  { id: 'messages', label: 'Messages (enquiries)', icon: Inbox },
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

/* ------------------------------------------------------------- site look */

/** Visual theme picker — three complete looks, switchable any time. */
function ThemePicker({ value, onChange }: { value: string; onChange: (t: 'editorial' | 'poster' | 'gallery') => void }) {
  const themes: {
    id: 'editorial' | 'poster' | 'gallery';
    name: string;
    desc: string;
    swatches: string[];
    mini: React.ReactNode;
  }[] = [
    {
      id: 'editorial',
      name: 'Warm editorial',
      desc: 'Bright cream paper, warm orange serif, friendly magazine feel. Welcoming and artsy.',
      swatches: ['#f7f2e9', '#b4551e', '#1faa53'],
      mini: (
        <div className="mini-site mini-editorial">
          <div className="mini-nav"><span>Victor Adjei Lomoh</span><i /></div>
          <div className="mini-body">
            <div className="mini-kicker">Illustration studio</div>
            <div className="mini-head">Stories made <em>visible.</em></div>
            <div className="mini-chips"><span /><span /></div>
          </div>
          <div className="mini-img" />
        </div>
      ),
    },
    {
      id: 'poster',
      name: 'Bold poster',
      desc: 'Near-black stage, huge uppercase type, sharp corners. Confident — the artwork pops like a poster.',
      swatches: ['#0c0c0e', '#22b45e', '#f2f2f0'],
      mini: (
        <div className="mini-site mini-poster">
          <div className="mini-nav"><span>VICTOR A.L</span><i /></div>
          <div className="mini-body">
            <div className="mini-kicker">Illustrator — Accra</div>
            <div className="mini-head">STORIES<br />MADE VISIBLE</div>
            <div className="mini-chips"><span /><span /></div>
          </div>
          <div className="mini-img" />
        </div>
      ),
    },
    {
      id: 'gallery',
      name: 'Refined gallery',
      desc: 'Calm deep navy, elegant gold serif, generous whitespace. Quiet-luxury gallery feel.',
      swatches: ['#0e1520', '#d9a441', '#22b45e'],
      mini: (
        <div className="mini-site mini-gallery">
          <div className="mini-nav"><span>Victor Adjei Lomoh</span><i /></div>
          <div className="mini-body">
            <div className="mini-kicker">Illustration studio</div>
            <div className="mini-head">Stories made <em>visible.</em></div>
            <div className="mini-chips"><span /><span /></div>
          </div>
          <div className="mini-img" />
        </div>
      ),
    },
  ];

  return (
    <div className="theme-cards">
      {themes.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`theme-card${value === t.id ? ' is-selected' : ''}`}
          onClick={() => onChange(t.id)}
          aria-pressed={value === t.id}
        >
          {value === t.id && (
            <span className="theme-check"><Check size={13} /> Live</span>
          )}
          <div className="theme-mini">{t.mini}</div>
          <div className="theme-meta">
            <span className="theme-name">
              {t.name}
              <span className="theme-swatches">
                {t.swatches.map((c) => <i key={c} style={{ background: c }} />)}
              </span>
            </span>
            <span className="theme-desc">{t.desc}</span>
            <span className="theme-apply">{value === t.id ? 'Currently live — press Save changes to keep' : 'Click to switch to this look'}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ whatsapp */

const waLinkNow = (number: string, message: string) =>
  `https://wa.me/${number.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;

const leadWaLink = (lead: Lead, number: string) => {
  const greeting = 'Hi! Thanks for contacting me. I received your message and will get back with you shortly.';
  return waLinkNow(number, `${greeting}\n\nHello ${lead.name}, thank you for your enquiry${lead.service ? ` about ${lead.service}` : ''}.`);
};

const fmtWhen = (ms: number) =>
  new Date(ms).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

function toCsv(leads: Lead[]): string {
  const esc = (v: string) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = [
    ['Date', 'Name', 'Email', 'Phone / WhatsApp', 'Interested in', 'Message'].join(','),
    ...leads.map((l) =>
      [fmtWhen(l.at), l.name, l.email, l.phone, l.service, l.message].map(esc).join(','),
    ),
  ];
  return rows.join('\n');
}

function downloadCsv(leads: Lead[]) {
  const blob = new Blob(['\ufeff' + toCsv(leads)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `victor-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Copy-to-clipboard button with a short “Copied” confirmation. */
function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn-line sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          const ta = document.createElement('textarea');
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          ta.remove();
        }
        setDone(true);
        setTimeout(() => setDone(false), 1800);
      }}
    >
      {done ? <Check size={14} /> : <Copy size={14} />}
      {done ? 'Copied!' : label}
    </button>
  );
}

/** Step-by-step guide: everything Victor must do once for WhatsApp. */
function WhatsAppSetup({ draft, onToggleGreeting }: { draft: SiteContent; onToggleGreeting: () => void }) {
  const number = draft.contact.whatsappNumber.replace(/[^\d]/g, '');
  const steps: { done: boolean; title: string; body: React.ReactNode }[] = [
    {
      done: number.length >= 10,
      title: '1. WhatsApp number is set on the website',
      body: (
        <>
          <p>
            Current number: <strong>{draft.contact.whatsappDisplay || '(not set)'}</strong> — change it in{' '}
            <strong>Contact &amp; QR</strong>. This is the number every button on the site opens.
          </p>
          <p className="wa-test-link">
            <a href={waLinkNow(draft.contact.whatsappNumber, draft.contact.whatsappMessage)} target="_blank" rel="noreferrer">
              Test it — open your WhatsApp chat <ExternalLink size={13} />
            </a>
          </p>
        </>
      ),
    },
    {
      done: draft.whatsappGreetingSetupDone,
      title: '2. Turn on the automatic greeting in WhatsApp',
      body: (
        <>
          <ol className="wa-steps">
            {draft.whatsappGreetingSteps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          <div className="wa-greeting-box">
            <span>Your greeting message (ready to copy):</span>
            <blockquote>{draft.whatsappGreetingText}</blockquote>
            <CopyButton text={draft.whatsappGreetingText} label="Copy greeting" />
          </div>
          <button
            type="button"
            className={`btn-line sm${draft.whatsappGreetingSetupDone ? ' is-done' : ''}`}
            onClick={onToggleGreeting}
          >
            {draft.whatsappGreetingSetupDone ? <Check size={14} /> : <CheckCircle2 size={14} />}
            {draft.whatsappGreetingSetupDone ? 'Greeting is set up ✓ (click to untick)' : 'Mark greeting as set up'}
          </button>
          <p className="wa-note">
            Tick this off after you’ve saved the greeting in WhatsApp, then press <strong>Save changes</strong> at the top.
          </p>
        </>
      ),
    },
    {
      done: false,
      title: '3. Connect Facebook to WhatsApp',
      body: (
        <>
          <p>
            On your <strong>Facebook Page</strong>: open the page → <strong>Settings</strong> →{' '}
            <strong>WhatsApp</strong> (or “Edit action button”) → enter this same number
            ({draft.contact.whatsappDisplay}) and choose <strong>“Send WhatsApp message”</strong> as the button.
            Facebook then shows a green WhatsApp button right on the page.
          </p>
          <p>
            Your Facebook page link is on the site under <strong>Social links</strong>. You can also paste a
            WhatsApp link (the one from step 1) as the page’s button if the automatic option is not offered.
          </p>
        </>
      ),
    },
    {
      done: false, // manual testing — Victor ticks it off in real life
      title: '4. Test everything once',
      body: (
        <ul className="wa-steps">
          <li>Website → the green floating button opens WhatsApp ✓</li>
          <li>Website form (Contact section) → arrives in <strong>Messages (enquiries)</strong> here and opens WhatsApp ✓</li>
          <li>Facebook page → the WhatsApp button opens the same chat ✓</li>
          <li>Send yourself one test message from each place.</li>
        </ul>
      ),
    },
  ];

  return (
    <div className="card-list">
      {steps.map((s, i) => (
        <div className={`ed-card wa-step-card${s.done ? ' is-done' : ''}`} key={i}>
          <div className="ed-card-head">
            <strong>{s.title}</strong>
            <span className={`wa-badge${s.done ? ' ok' : ''}`}>{s.done ? 'Done' : 'To do'}</span>
          </div>
          {s.body}
        </div>
      ))}
    </div>
  );
}

/** Admin inbox: every contact-form enquiry, with one-tap WhatsApp reply. */
function MessagesInbox({ password, whatsappNumber }: { password: string; whatsappNumber: string }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [local, setLocal] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr('');
    const res = await fetchLeads(password);
    setLeads(res.leads);
    setLocal(!!res.local);
    if (res.error) setErr(res.error);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remove = async (id: string) => {
    if (!confirm('Delete this enquiry? This cannot be undone.')) return;
    const res = await deleteLead(id, password);
    if (res.ok) setLeads((ls) => ls.filter((l) => l.id !== id));
    else window.alert(res.error || 'Could not delete.');
  };

  if (loading) {
    return (
      <p className="muted-line" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Loader size={16} className="spin" /> Loading enquiries…
      </p>
    );
  }

  return (
    <>
      {local && (
        <p className="ed-help">
          <strong>Local mode:</strong> there is no live server connected in this browser, so only enquiries
          sent from <em>this</em> browser are listed. On the live website, every enquiry from every visitor
          appears here automatically.
        </p>
      )}
      {err && <p className="ed-err-inline">{err}</p>}

      <div className="inbox-actions">
        <span>
          {leads.length} {leads.length === 1 ? 'enquiry' : 'enquiries'}
        </span>
        <button className="btn-line sm" onClick={load}>
          <RefreshCw size={14} /> Refresh
        </button>
        <button className="btn-line sm" onClick={() => downloadCsv(leads)} disabled={leads.length === 0}>
          <Download size={14} /> Download as Excel/CSV
        </button>
      </div>

      {leads.length === 0 ? (
        <p className="muted-line">
          No enquiries yet. Every message sent through the website contact form will appear here — with the
          person’s name, email, WhatsApp number and question, so you can reply from WhatsApp in one tap.
        </p>
      ) : (
        <div className="card-list">
          {leads.map((l) => (
            <div className="ed-card lead-card" key={l.id}>
              <div className="ed-card-head">
                <strong>{l.name || '(no name)'}</strong>
                <span className="lead-when">{fmtWhen(l.at)}</span>
              </div>
              <div className="lead-facts">
                {l.email && (
                  <span>
                    <small>Email</small> <a href={`mailto:${l.email}`}>{l.email}</a>
                  </span>
                )}
                {l.phone && (
                  <span>
                    <small>Phone / WhatsApp</small> {l.phone}
                  </span>
                )}
                {l.service && (
                  <span>
                    <small>Interested in</small> {l.service}
                  </span>
                )}
              </div>
              <p className="lead-message">{l.message}</p>
              <div className="lead-actions">
                {whatsappNumber && (
                  <a className="btn-solid sm" href={leadWaLink(l, whatsappNumber)} target="_blank" rel="noreferrer">
                    <MessageCircle size={14} /> Reply on WhatsApp
                  </a>
                )}
                <button className="btn-line sm danger" onClick={() => remove(l.id)}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------- auth gate */

// Shows a first-run "create password" screen when no password has been set yet,
// otherwise a normal sign-in screen.
function AuthGate({ onAuthed }: { onAuthed: (pw: string) => void }) {
  const [phase, setPhase] = useState<'checking' | 'setup' | 'login'>('checking');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    let alive = true;
    getAuthStatus().then((s) => {
      if (alive) setPhase(s.configured ? 'login' : 'setup');
    });
    return () => {
      alive = false;
    };
  }, []);

  const finish = (password: string) => {
    try {
      sessionStorage.setItem(SESSION_KEY, password);
    } catch {
      /* ignore */
    }
    onAuthed(password);
  };

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    const res = await verifyPassword(pw);
    setBusy(false);
    if (res.ok) finish(pw);
    else setErr('Incorrect password. Please try again.');
  };

  const submitSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 6) return setErr('Password must be at least 6 characters.');
    if (pw !== pw2) return setErr('The two passwords don’t match.');
    setBusy(true);
    setErr('');
    const res = await apiSetPassword(pw);
    setBusy(false);
    if (res.ok) finish(pw);
    else setErr(res.error || 'Could not set the password.');
  };

  if (phase === 'checking') {
    return (
      <div className="login-screen">
        <div className="login-card">
          <span className="login-mark spin"><Loader size={22} /></span>
          <p style={{ marginTop: 18 }}>Loading…</p>
        </div>
      </div>
    );
  }

  const isSetup = phase === 'setup';

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={isSetup ? submitSetup : submitLogin}>
        <span className="login-mark">{defaultContent.brand.mark}</span>
        <h1>{isSetup ? 'Create admin password' : 'Studio admin'}</h1>
        <p>
          {isSetup
            ? 'Set the password you’ll use to edit this website. Keep it safe — you’ll need it every time.'
            : 'Sign in to edit the website content.'}
        </p>
        <label className="login-input">
          <Lock size={16} />
          <input
            type="password"
            value={pw}
            autoFocus
            placeholder={isSetup ? 'Choose a password (min 6 characters)' : 'Admin password'}
            onChange={(e) => setPw(e.target.value)}
          />
        </label>
        {isSetup && (
          <label className="login-input" style={{ marginTop: 10 }}>
            <Lock size={16} />
            <input
              type="password"
              value={pw2}
              placeholder="Confirm password"
              onChange={(e) => setPw2(e.target.value)}
            />
          </label>
        )}
        {err && (
          <p className="login-err">
            <AlertCircle size={15} /> {err}
          </p>
        )}
        <button type="submit" className="btn-solid" disabled={busy || !pw || (isSetup && !pw2)}>
          {busy ? <Loader size={16} className="spin" /> : <LogIn size={16} />}
          {busy ? (isSetup ? 'Setting…' : 'Checking…') : isSetup ? 'Set password & enter' : 'Sign in'}
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
      <AuthGate
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

  const changePassword = async () => {
    const current = window.prompt('Enter your CURRENT password:');
    if (current === null) return;
    const next = window.prompt('Enter a NEW password (at least 6 characters):');
    if (next === null) return;
    const res = await apiSetPassword(next, current);
    if (res.ok) {
      try {
        sessionStorage.setItem(SESSION_KEY, next);
      } catch {
        /* ignore */
      }
      setPassword(next);
      window.alert('Password changed.');
    } else {
      window.alert(res.error || 'Could not change the password.');
    }
  };

  const title = nav.find((n) => n.id === view)?.label ?? 'Overview';

  return (
    <div className="admin">
      <aside className="admin-side">
        <div className="admin-brand">
          <span className="admin-mark">
            {draft.brand.logo ? <img src={draft.brand.logo} alt={draft.brand.name} /> : draft.brand.mark}
          </span>
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
          <button onClick={changePassword}>
            <Lock size={16} /> Change password
          </button>
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

          {view === 'look' && (
            <div className="ed-section">
              <Panel title="Choose the public design">
                <p className="ed-help">
                  The whole website switches instantly — text, images, WhatsApp buttons and all your content stay
                  exactly the same. Click a design, then press <strong>Save changes</strong> to make it live.
                </p>
                <ThemePicker
                  value={draft.designTheme}
                  onChange={(t) => patch({ designTheme: t })}
                />
              </Panel>
              <Panel title="Good to know">
                <p className="ed-help" style={{ marginBottom: 0 }}>
                  You can switch looks whenever you like — nothing is lost. The green WhatsApp button and the
                  enquiry form adapt to every design automatically.
                </p>
              </Panel>
            </div>
          )}

          {view === 'brand' && (
            <div className="ed-section">
              <Panel title="Site & SEO">
                <div className="ed-grid">
                  <Field label="Browser tab / SEO title" full value={draft.site.title} onChange={(v) => patch({ site: { ...draft.site, title: v } })} />
                  <Area label="SEO description" value={draft.site.description} onChange={(v) => patch({ site: { ...draft.site, description: v } })} />
                </div>
              </Panel>

              <Panel title="Brand identity">
                <ImageField
                  label="Logo image (optional — falls back to the monogram below if empty)"
                  value={draft.brand.logo}
                  password={password}
                  onChange={(v) => patch({ brand: { ...draft.brand, logo: v } })}
                />
                {draft.brand.logo && (
                  <button
                    type="button"
                    className="btn-line sm"
                    style={{ alignSelf: 'flex-start' }}
                    onClick={() => patch({ brand: { ...draft.brand, logo: '' } })}
                  >
                    <X size={14} /> Remove logo (use monogram)
                  </button>
                )}
                <div className="ed-grid">
                  <Field label="Brand / artist name" value={draft.brand.name} onChange={(v) => patch({ brand: { ...draft.brand, name: v } })} />
                  <Field label="Monogram letters (used when no logo)" value={draft.brand.mark} onChange={(v) => patch({ brand: { ...draft.brand, mark: v } })} />
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

          {view === 'books' && (
            <div className="ed-section">
              <Panel title="Books section text">
                <div className="ed-grid">
                  <Field label="Kicker" value={draft.booksSection.kicker} onChange={(v) => patch({ booksSection: { ...draft.booksSection, kicker: v } })} />
                  <Field label="Heading" value={draft.booksSection.title} onChange={(v) => patch({ booksSection: { ...draft.booksSection, title: v } })} />
                  <Area label="Intro paragraph" value={draft.booksSection.intro} onChange={(v) => patch({ booksSection: { ...draft.booksSection, intro: v } })} />
                </div>
              </Panel>

              <Panel
                title={`Books (${draft.books.length})`}
                action={
                  <button
                    className="btn-solid sm"
                    onClick={() => patch({ books: [...draft.books, { id: uid('bk'), title: 'New book', image: '', blurb: '', linkUrl: '', linkLabel: 'Buy / Download' }] })}
                  >
                    <Plus size={15} /> Add book
                  </button>
                }
              >
                <p className="ed-help">Upload each book cover, write a little about it, and paste the link where people can buy or download it. Leave the link blank to hide the button.</p>
                <div className="card-list">
                  {draft.books.map((b: BookItem, i) => (
                    <div className="ed-card" key={b.id}>
                      <div className="ed-card-head">
                        <strong>{b.title || 'Untitled book'}</strong>
                        <RowButtons onUp={() => patch({ books: moveAt(draft.books, i, -1) })} onDown={() => patch({ books: moveAt(draft.books, i, 1) })} onDelete={() => confirm(`Delete “${b.title}”?`) && patch({ books: removeAt(draft.books, i) })} />
                      </div>
                      <ImageField label="Book cover" value={b.image} password={password} onChange={(v) => patch({ books: updateItem(draft.books, i, { image: v }) })} />
                      <div className="ed-grid">
                        <Field label="Title" full value={b.title} onChange={(v) => patch({ books: updateItem(draft.books, i, { title: v }) })} />
                        <Area label="A little about the book" value={b.blurb} onChange={(v) => patch({ books: updateItem(draft.books, i, { blurb: v }) })} />
                        <Field label="Buy / download link (URL)" full value={b.linkUrl} onChange={(v) => patch({ books: updateItem(draft.books, i, { linkUrl: v }) })} placeholder="https://…" />
                        <Field label="Button label" value={b.linkLabel} onChange={(v) => patch({ books: updateItem(draft.books, i, { linkLabel: v }) })} placeholder="Buy / Download" />
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

          {view === 'whatsapp' && (
            <div className="ed-section">
              <Panel title="WhatsApp setup checklist — do these once">
                <p className="ed-help">
                  This is the full WhatsApp connection in four steps. When every box says <strong>Done</strong>,
                  customers can reach Victor on WhatsApp from the website and Facebook, and every enquiry is
                  collected under <strong>Messages (enquiries)</strong>.
                </p>
                <WhatsAppSetup
                  draft={draft}
                  onToggleGreeting={() =>
                    patch({ whatsappGreetingSetupDone: !draft.whatsappGreetingSetupDone })
                  }
                />
              </Panel>

              <Panel title="Floating WhatsApp button (green button on every page)">
                <div className="ed-grid">
                  <label className="ed-field">
                    <span>Show the floating button</span>
                    <select
                      value={draft.whatsappButton.enabled ? 'yes' : 'no'}
                      onChange={(e) => patch({ whatsappButton: { ...draft.whatsappButton, enabled: e.target.value === 'yes' } })}
                    >
                      <option value="yes">Yes — always visible</option>
                      <option value="no">No — hide it</option>
                    </select>
                  </label>
                  <Field
                    label="Text next to the WhatsApp icon (leave blank for icon only)"
                    value={draft.whatsappButton.label}
                    onChange={(v) => patch({ whatsappButton: { ...draft.whatsappButton, label: v } })}
                  />
                </div>
              </Panel>

              <Panel title="Automatic greeting message (copy into WhatsApp)">
                <div className="ed-grid">
                  <Area
                    label="Greeting text — WhatsApp sends this automatically to new chats"
                    value={draft.whatsappGreetingText}
                    onChange={(v) => patch({ whatsappGreetingText: v })}
                  />
                </div>
                <div className="wa-greeting-box" style={{ marginTop: 12 }}>
                  <CopyButton text={draft.whatsappGreetingText} label="Copy greeting" />
                </div>
              </Panel>

              <Panel title="Pre-filled first message (what customers send Victor)">
                <div className="ed-grid">
                  <Area
                    label="Message the customer sends when they tap a WhatsApp button"
                    value={draft.contact.whatsappMessage}
                    onChange={(v) => patch({ contact: { ...draft.contact, whatsappMessage: v } })}
                  />
                </div>
              </Panel>
            </div>
          )}

          {view === 'messages' && (
            <div className="ed-section">
              <Panel title="Customer enquiries from the website form">
                <p className="ed-help">
                  Every contact-form submission is saved here and can also be opened straight in WhatsApp.
                  Reply with the green button — WhatsApp opens with a polite greeting already typed.
                </p>
                <MessagesInbox password={password} whatsappNumber={draft.contact.whatsappNumber} />
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
  const waNumber = draft.contact.whatsappNumber.replace(/[^\d]/g, '');
  const waChecks = [
    waNumber.length >= 10,
    draft.whatsappGreetingSetupDone,
  ];
  const waDone = waChecks.filter(Boolean).length;
  const stats = [
    { label: 'Portfolio pieces', value: draft.work.length, view: 'work' as View },
    { label: 'Books', value: draft.books.length, view: 'books' as View },
    { label: 'Services', value: draft.services.length, view: 'services' as View },
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
      <section className="panel wa-progress-panel">
        <div className="panel-head">
          <h2>WhatsApp connection</h2>
          <button className="btn-line sm" onClick={() => setView('whatsapp')}>
            <MessageCircle size={14} /> Open setup checklist
          </button>
        </div>
        <p className="muted-line" style={{ lineHeight: 1.7 }}>
          Customers can contact Victor on WhatsApp from every page, and every contact-form enquiry is saved
          to <strong>Messages (enquiries)</strong>. Setup status:
        </p>
        <div className="wa-progress">
          <span className="wa-progress-bar">
            <span style={{ width: `${Math.round((waDone / waChecks.length) * 100)}%` }} />
          </span>
          <span className="wa-progress-label">
            {waDone === waChecks.length ? '✓ Fully connected' : `${waDone} of ${waChecks.length} steps done`}
          </span>
        </div>
        {waDone < waChecks.length && (
          <button className="btn-solid" style={{ marginTop: 14 }} onClick={() => setView('whatsapp')}>
            <MessageCircle size={16} /> Finish WhatsApp setup
          </button>
        )}
      </section>

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
            <button onClick={() => setView('look')}><Palette size={16} /> Switch site design</button>
            <button onClick={() => setView('hero')}><Type size={16} /> Edit hero</button>
            <button onClick={() => setView('work')}><Images size={16} /> Manage portfolio</button>
            <button onClick={() => setView('contact')}><Phone size={16} /> Contact & QR</button>
            <button onClick={() => setView('whatsapp')}><MessageCircle size={16} /> WhatsApp &amp; form</button>
            <button onClick={() => setView('messages')}><Inbox size={16} /> Customer messages</button>
            <button onClick={() => setView('social')}><Share2 size={16} /> Social links</button>
          </div>
        </section>
      </div>
    </>
  );
}

export default Admin;
