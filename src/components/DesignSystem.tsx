import React from 'react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-16">
    <h2 className="font-headline text-heading text-phosphor font-bold uppercase mb-6 tracking-tighter border-b border-phosphor/20 pb-3">
      {title}
    </h2>
    {children}
  </section>
);

const Code: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <code className="font-mono text-label text-phosphor/70 bg-void px-1.5 py-0.5 border border-phosphor/10">
    {children}
  </code>
);

const TYPE_TOKENS = [
  { name: 'Display', token: '--text-display', className: 'text-display', font: 'font-headline', usage: 'Page hero titles — Search History, Initialize Scanner, constellation name' },
  { name: 'Title', token: '--text-title', className: 'text-title', font: 'font-headline', usage: 'App title, modal titles, major full-screen status headings' },
  { name: 'Heading', token: '--text-heading', className: 'text-heading', font: 'font-headline', usage: 'Section headers within a page — Astronomical Profile, Observation Metrics' },
  { name: 'Body', token: '--text-body', className: 'text-body', font: 'font-body', usage: 'Primary paragraph text' },
  { name: 'Body Sm', token: '--text-body-sm', className: 'text-body-sm', font: 'font-body', usage: 'Secondary text, data values, button labels' },
  { name: 'Label', token: '--text-label', className: 'text-label', font: 'font-body', usage: 'Uppercase field labels, captions, breadcrumbs, meta text' },
];

const COLOR_TOKENS = [
  { name: 'Phosphor', token: '--color-phosphor', className: 'bg-phosphor', hex: '#00FF41', usage: 'The accent/text color — nearly everything on screen' },
  { name: 'Void', token: '--color-void', className: 'bg-void', hex: '#1F0E18', usage: 'Base page background' },
  { name: 'Void Dark', token: '--color-void-dark', className: 'bg-void-dark', hex: '#190913', usage: 'Recessed/sunken surfaces — input fields, visualizer backgrounds' },
  { name: 'Void Light', token: '--color-void-light', className: 'bg-void-light', hex: '#2C1A24', usage: 'Raised surfaces — cards, panels, modal backgrounds' },
  { name: 'Danger', token: '--color-danger', className: 'bg-danger', hex: '#EF4444', usage: 'Destructive actions only — errors, Clear History, Erase' },
];

const OPACITY_STEPS = [
  { value: 10, className: 'text-phosphor/10' },
  { value: 20, className: 'text-phosphor/20' },
  { value: 30, className: 'text-phosphor/30' },
  { value: 40, className: 'text-phosphor/40' },
  { value: 50, className: 'text-phosphor/50' },
  { value: 60, className: 'text-phosphor/60' },
  { value: 70, className: 'text-phosphor/70' },
];

const BUTTON_VARIANTS: { label: string; classes: string; code: string }[] = [
  { label: 'INITIALIZE_SCAN', classes: 'btn btn-primary px-6 py-3', code: 'btn btn-primary' },
  { label: 'RESET_INPUT_', classes: 'btn btn-outline px-6 py-3', code: 'btn btn-outline' },
  { label: 'INITIALIZE_SCAN', classes: 'btn btn-disabled px-6 py-3', code: 'btn btn-disabled' },
  { label: 'CONFIRM', classes: 'btn btn-danger px-6 py-3', code: 'btn btn-danger' },
  { label: 'ERASE', classes: 'btn btn-danger-outline px-6 py-3', code: 'btn btn-danger-outline' },
  { label: '[Config]', classes: 'btn-compact btn-outline px-2 py-1', code: 'btn-compact btn-outline' },
  { label: '[X]', classes: 'btn-compact btn-outline px-2 py-1', code: 'btn-compact btn-outline' },
];

export const DesignSystem: React.FC = () => {
  return (
    <main className="pt-16 pb-32 px-6 max-w-5xl mx-auto">
      <header className="mb-4 pt-8">
        <div className="inline-block px-3 py-1 bg-void-light mb-4">
          <span className="font-body text-label text-phosphor tracking-[0.2em] uppercase glow-text">
            Internal Reference // Not User Facing
          </span>
        </div>
        <h1 className="font-headline text-display font-extrabold tracking-tighter text-phosphor glow-text leading-none uppercase mb-3">
          Design System
        </h1>
        <p className="font-body text-body text-phosphor/70 leading-relaxed max-w-2xl">
          The token set and component rules behind Stellar Scan. Every screen in the app should be built
          from what's documented on this page — if a value isn't here, it isn't a sanctioned part of the system.
        </p>
      </header>

      {/* Fonts */}
      <Section title="Fonts">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-void-light p-6 border border-phosphor/10">
            <div className="font-body text-label text-phosphor/40 uppercase mb-2">font-headline</div>
            <div className="font-headline text-heading text-phosphor mb-3">VT323</div>
            <p className="font-body text-body-sm text-phosphor/60 leading-relaxed">
              Titles and headers <span className="text-phosphor">only</span>: page titles, section headers, modal titles.
              Never for body content, labels, values, or buttons.
            </p>
          </div>
          <div className="bg-void-light p-6 border border-phosphor/10">
            <div className="font-body text-label text-phosphor/40 uppercase mb-2">font-body</div>
            <div className="font-body text-heading text-phosphor mb-3">JetBrains Mono</div>
            <p className="font-body text-body-sm text-phosphor/60 leading-relaxed">
              Everything that isn't a title: paragraphs, labels, values, buttons, nav, breadcrumbs, badges.
              This is the default — <Code>body</Code> inherits it globally.
            </p>
          </div>
          <div className="bg-void-light p-6 border border-phosphor/10">
            <div className="font-body text-label text-phosphor/40 uppercase mb-2">font-mono</div>
            <div className="font-mono text-heading text-phosphor mb-3">JetBrains Mono</div>
            <p className="font-body text-body-sm text-phosphor/60 leading-relaxed">
              Reserved for raw technical readouts: boot log lines, star RA/DEC coordinates. Currently the
              same typeface as <Code>font-body</Code> — kept as a separate token since the two roles are
              conceptually distinct and may diverge again later.
            </p>
          </div>
        </div>
      </Section>

      {/* Type Scale */}
      <Section title="Type Scale">
        <p className="font-body text-body-sm text-phosphor/60 mb-6 max-w-2xl leading-relaxed">
          Six semantic sizes. Every piece of text in the app resolves to one of these — no arbitrary{' '}
          <Code>text-[10px]</Code> or ad-hoc <Code>text-sm</Code> values. The sliders in the Type Scale panel
          (top right, dev only) tweak these live.
        </p>
        <div className="flex flex-col gap-px bg-phosphor/10">
          {TYPE_TOKENS.map((t) => (
            <div key={t.name} className="bg-void-light p-4 md:p-6 grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 md:gap-6 items-baseline">
              <div>
                <div className="font-body text-label text-phosphor uppercase tracking-widest">{t.name}</div>
                <Code>{t.token}</Code>
              </div>
              <div className={`${t.font} text-phosphor truncate ${t.className}`}>
                The quick brown fox
              </div>
              <div className="md:col-span-2 font-body text-label text-phosphor/50">{t.usage} — <Code>{t.className}</Code></div>
            </div>
          ))}
        </div>
      </Section>

      {/* Colors */}
      <Section title="Colors">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-phosphor/10 mb-6">
          {COLOR_TOKENS.map((c) => (
            <div key={c.name} className="bg-void-light p-4 flex items-center gap-4">
              <div className={`w-14 h-14 flex-shrink-0 border border-phosphor/20 ${c.className}`} />
              <div className="min-w-0">
                <div className="font-body text-body-sm text-phosphor uppercase tracking-widest">{c.name}</div>
                <div className="flex items-center gap-2 mb-1">
                  <Code>{c.token}</Code>
                  <Code>{c.hex}</Code>
                </div>
                <p className="font-body text-label text-phosphor/50 leading-snug">{c.usage}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="font-body text-body-sm text-phosphor/60 mb-3">
          Muted text uses opacity modifiers on <Code>phosphor</Code> rather than separate color tokens:
        </p>
        <div className="flex flex-wrap gap-3">
          {OPACITY_STEPS.map((o) => (
            <div key={o.value} className="bg-void-light border border-phosphor/10 px-3 py-2 text-center">
              <div className={`font-body text-body-sm ${o.className}`}>Aa</div>
              <Code>/{o.value}</Code>
            </div>
          ))}
        </div>
      </Section>

      {/* Buttons */}
      <Section title="Buttons">
        <p className="font-body text-body-sm text-phosphor/60 mb-6 max-w-2xl leading-relaxed">
          Every button composes exactly one size class (<Code>btn</Code> or <Code>btn-compact</Code>) with
          exactly one fill variant. Padding/width stay per-instance.
        </p>
        <div className="flex flex-wrap gap-4 items-center">
          {BUTTON_VARIANTS.map((b, i) => (
            <div key={i} className="flex flex-col items-start gap-2">
              <button type="button" className={b.classes} tabIndex={-1}>
                {b.label}
              </button>
              <Code>{b.code}</Code>
            </div>
          ))}
        </div>
      </Section>

      {/* Radius */}
      <Section title="Radius &amp; Shape">
        <p className="font-body text-body-sm text-phosphor/60 mb-6 max-w-2xl leading-relaxed">
          Every container, card, and button is a hard right angle — <Code>0px</Code> radius, no exceptions.
          The only curves in the app are things that are actually circles by nature (star points, status dots).
        </p>
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 bg-void-light border border-phosphor/30" />
            <Code>0px radius</Code>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-phosphor shadow-[0_0_10px_#00FF41]" />
            <Code>rounded-full (circles only)</Code>
          </div>
        </div>
      </Section>

      {/* Rules */}
      <Section title="Ground Rules">
        <ul className="font-body text-body-sm text-phosphor/70 space-y-3 list-none">
          <li className="flex gap-3"><span className="text-phosphor">›</span> VT323 (<Code>font-headline</Code>) is for titles and headers only — never body content, labels, values, or buttons.</li>
          <li className="flex gap-3"><span className="text-phosphor">›</span> Every text size must be one of the six type-scale tokens above — no arbitrary pixel values.</li>
          <li className="flex gap-3"><span className="text-phosphor">›</span> Every button composes <Code>.btn</Code>/<Code>.btn-compact</Code> with a single fill variant — no one-off button styling.</li>
          <li className="flex gap-3"><span className="text-phosphor">›</span> Destructive actions use the <Code>danger</Code> color token, never a raw Tailwind color like <Code>red-500</Code>.</li>
          <li className="flex gap-3"><span className="text-phosphor">›</span> No border-radius except on elements that are genuinely circular.</li>
          <li className="flex gap-3"><span className="text-phosphor">›</span> This page is unlinked from the app's navigation by design — it's a reference for whoever's building the UI, not a user-facing feature.</li>
        </ul>
      </Section>
    </main>
  );
};
