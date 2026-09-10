# CRT Terminal Restyle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle Stellar Scan's phosphor-terminal UI to match the reference CRT-terminal aesthetic (muted true-black palette, bracket-toolbar controls, full window chrome on panels/modals, hatched bracket-meters, a procedurally-dithered visualizer texture, a pixel-block telemetry waveform, and a real curved CRT bezel piloted on one page) per the approved design spec.

**Architecture:** This is a CSS-token + small-component-library restyle on top of the existing React 19 / Tailwind v4 app — no new state management, no new routes, no data-model changes. Four new small, single-purpose presentational components (`WindowPanel`, `Meter`, `DitherField`, `Waveform`, `CrtBezel`) get built once and then wired into existing screens. Global look-and-feel (color, buttons, tabs, scrollbars) ships as CSS-only changes in `index.css` that apply everywhere automatically.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4 (`@theme` token system already in use), Vite. No test runner exists in this project (`npm run lint` = `tsc --noEmit` is the only automated check) — verification for each task is `npm run lint` passing plus a manual visual check in the dev server (`npm run dev`).

## Global Constraints

- Palette: `--color-void: #0d0d0d`, `--color-void-dark: #020302`, `--color-void-light: #0B0D09`, `--color-phosphor: #2ECC58`, `--color-phosphor-dim: rgba(46,204,88,0.4)`, `--color-danger: #ef4444` (unchanged), new `--color-accent: #35E6FF`.
- New opacity convention for phosphor-colored strokes/text introduced by this restyle's new components: borders at 25% (`border-phosphor/25`), text at 70% (`text-phosphor/70`). This applies to the new components built in this plan — do **not** retroactively change pre-existing `/40`, `/50`, `/60` etc. opacity usages elsewhere in the app; those were deliberate secondary-text choices, unrelated to this convention.
- VT323 (`font-headline`) is titles/headers only — never body text, labels, values, or buttons. No new component in this plan uses `font-headline` on non-heading text.
- Every text size must be one of the six existing type-scale tokens (`text-display`, `text-title`, `text-heading`, `text-body`, `text-body-sm`, `text-label`) — no arbitrary pixel values.
- No `border-radius` anywhere except elements that are genuinely circular, **and** the CRT bezel frame in Task 12 (an explicit, spec-approved exception — a physical monitor housing needs rounded corners; document this exception inline where it's used).
- Destructive actions use `--color-danger` only, never a raw Tailwind color.
- `border-style: double` needs at least 3px of border-width to actually render as two visible hairlines in browsers — the spec's "1px double" wording describes the *visual result*, not the literal CSS; implement window-chrome double borders as `border-[3px] border-double`.
- `Constellation` fields (`distance`, `visibility`, `observationWindow`, `skySector`, `spectralData.*`) are all free-form `string`s from an LLM ([types.ts](../../../src/types.ts):9-30), not guaranteed-numeric — only the literal hardcoded `98.4%` "Signal Integrity" value in `MetricGrid` becomes a `Meter`; every other field stays a plain label/value pair. This resolves the spec's open question.

---

### Task 1: Color palette + new tokens

**Files:**
- Modify: `src/index.css:3-23` (the `@theme` block)

**Interfaces:**
- Produces: `--color-void`, `--color-void-dark`, `--color-void-light`, `--color-phosphor`, `--color-phosphor-dim`, `--color-accent` CSS custom properties, and the Tailwind utilities Tailwind v4 auto-generates from any `--color-*` token (`bg-accent`, `text-accent`, `border-accent`, etc. — same mechanism already producing `bg-phosphor`, `text-void`, etc. today).

- [ ] **Step 1: Update the theme block**

Replace the color section of the `@theme` block in `src/index.css`:

```css
  --color-phosphor: #2ECC58;
  --color-phosphor-dim: rgba(46, 204, 88, 0.4);
  --color-void: #0d0d0d;
  --color-void-dark: #020302;
  --color-void-light: #0B0D09;
  --color-danger: #ef4444;
  --color-accent: #35E6FF;
```

- [ ] **Step 2: Run typecheck**

Run: `npm run lint`
Expected: passes (this is a pure CSS value change, no TS surface touched).

- [ ] **Step 3: Visual check**

Run: `npm run dev`, open the app. Every screen should now render in the muted near-black/green palette instead of the old bright green on purple-void. Check the Header, Footer, and any visible panel.

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "restyle: switch to muted field-terminal phosphor palette

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Bracket-toolbar button system

**Files:**
- Modify: `src/index.css:55-86` (the button component layer)

**Interfaces:**
- Consumes: `--color-phosphor` from Task 1.
- Produces: updated `.btn`, `.btn-compact`, `.btn-primary`, `.btn-outline`, `.btn-disabled`, `.btn-danger`, `.btn-danger-outline` classes (same class names, new visual treatment — every existing usage across `ScannerInput.tsx`, `Archives.tsx`, `ExportCard.tsx`, `App.tsx`, `Layout.tsx`, `LocationSearch.tsx`, `DesignSystem.tsx` picks this up automatically, no per-usage changes needed). New optional `.btn-toolbar` container class for future genuine multi-button toolbar rows (none exist yet in the app — every current button group uses spaced pairs, not a touching toolbar row, so this is additive capability, not a retrofit).

- [ ] **Step 1: Replace the button layer**

In `src/index.css`, replace the existing button rules (from `.btn {` through `.btn-danger-outline {...}`) with:

```css
  .btn {
    @apply font-body uppercase tracking-widest transition-all border border-phosphor/25;
    font-size: var(--text-body-sm);
  }

  .btn-compact {
    @apply font-body uppercase tracking-widest transition-all border border-phosphor/25;
    font-size: var(--text-label);
  }

  .btn-primary {
    @apply bg-phosphor text-void font-bold hover:brightness-110 active:scale-95;
  }

  .btn-outline {
    @apply text-phosphor/70 hover:bg-phosphor/10 hover:text-phosphor active:scale-95;
  }

  .btn-disabled {
    @apply bg-phosphor/20 text-phosphor/40 cursor-not-allowed border-phosphor/10;
  }

  .btn-danger {
    @apply bg-danger text-void font-bold hover:brightness-110 active:scale-95 border-danger;
  }

  .btn-danger-outline {
    @apply border-danger/30 text-danger hover:bg-danger/10 active:scale-95;
  }

  /* Row of buttons that should read as one bracket toolbar strip (bordered
     cells sharing edges, no double-border seam) — opt-in via this container,
     not the default for every button group. */
  .btn-toolbar {
    @apply flex;
  }
  .btn-toolbar > .btn + .btn,
  .btn-toolbar > .btn-compact + .btn-compact {
    @apply border-l-0;
  }
```

- [ ] **Step 2: Run typecheck**

Run: `npm run lint`
Expected: passes.

- [ ] **Step 3: Visual check**

Run: `npm run dev`. Check `INITIALIZE_SCAN` / `RESET_INPUT_` on the Scanner screen, `Export to Card` on a constellation detail page, and `[Config]` in the header — all should now show a visible 25%-opacity phosphor border (previously `.btn-outline` had no border at all).

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "restyle: bracket-bordered button system

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Footer tab inverted-fill active state

**Files:**
- Modify: `src/components/Layout.tsx:28-51` (the `Footer` component)

**Interfaces:**
- Consumes: `--color-phosphor`, `--color-void` (Task 1).
- Produces: no signature change — `Footer` keeps its existing `{ activeTab, onTabChange }` props.

- [ ] **Step 1: Replace the active/inactive tab classes**

In `src/components/Layout.tsx`, replace the `Footer` component's tab `<button>` markup:

```tsx
export const Footer: React.FC<{ activeTab: string; onTabChange: (tab: string) => void }> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-center items-center gap-10 sm:gap-16 h-16 pb-safe px-2 bg-void/95 backdrop-blur-sm border-t border-phosphor/20">
      {FOOTER_TABS.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`font-body text-label tracking-widest uppercase transition-colors px-3 py-1 ${
              isActive
                ? 'bg-phosphor text-void'
                : 'text-phosphor/40 hover:text-phosphor/70'
            }`}
          >
            {isActive ? `> ${tab}` : tab}
          </button>
        );
      })}
    </nav>
  );
};
```

This drops the old underline (`border-b` + `glow-text` + blinking cursor) in favor of an inverted solid-fill block for the active tab, matching the highlighted-row convention in the personnel-registry/signal-harmonics reference photos.

- [ ] **Step 2: Run typecheck**

Run: `npm run lint`
Expected: passes.

- [ ] **Step 3: Visual check**

Run: `npm run dev`. In the footer nav, the active tab (`SCANNER` or `ARCHIVES`) should render as a solid phosphor block with void-colored text; the inactive tab stays dim text with a `>` prefix. Click between tabs to confirm both states.

- [ ] **Step 4: Commit**

```bash
git add src/components/Layout.tsx
git commit -m "restyle: inverted-fill active tab in footer nav

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Custom scrollbar styling

**Files:**
- Modify: `src/index.css` — add a new rule block after the `@layer components` block (before the keyframes section).

**Interfaces:**
- Consumes: `--color-phosphor`, `--color-void-light` (Task 1).
- Produces: no component/prop surface — this is a global, selector-based CSS change (`::-webkit-scrollbar` + Firefox's `scrollbar-width`/`scrollbar-color`) that applies to every scrollable element in the app, including the Archives list and the location-search results dropdown in `LocationSearch.tsx:118`.

- [ ] **Step 1: Add scrollbar rules**

In `src/index.css`, after the closing `}` of the `@layer components` block, add:

```css
/* Custom scrollbar — bracket-toolbar track/thumb, arrow-glyph buttons.
   Chromium/WebKit only; Firefox gets the thin/colored fallback below since
   it doesn't support ::-webkit-scrollbar-*. */
::-webkit-scrollbar {
  width: 14px;
  height: 14px;
}
::-webkit-scrollbar-track {
  background: var(--color-void-light);
  border: 1px solid rgba(46, 204, 88, 0.25);
}
::-webkit-scrollbar-thumb {
  background-color: var(--color-void-light);
  background-image: repeating-linear-gradient(45deg, var(--color-phosphor) 0, var(--color-phosphor) 2px, transparent 2px, transparent 4px);
  opacity: 0.85;
  border: 1px solid rgba(46, 204, 88, 0.25);
}
::-webkit-scrollbar-button {
  background-color: var(--color-void-light);
  border: 1px solid rgba(46, 204, 88, 0.25);
  height: 14px;
  width: 14px;
}
::-webkit-scrollbar-button:vertical:start {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'%3E%3Cpolygon points='5,0 10,6 0,6' fill='%232ECC58'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
}
::-webkit-scrollbar-button:vertical:end {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'%3E%3Cpolygon points='0,0 10,0 5,6' fill='%232ECC58'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
}

* {
  scrollbar-width: thin;
  scrollbar-color: var(--color-phosphor) var(--color-void-light);
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run lint`
Expected: passes (pure CSS).

- [ ] **Step 3: Visual check**

Run: `npm run dev`. Go to Archives with 15+ history entries (or shrink the window) so the page scrolls, and check the scrollbar in a Chromium-based browser: bordered track, hatched thumb, arrow buttons at each end. Also open the location search dropdown in the Scanner screen with a query that returns 5 results and confirm its scrollbar matches.

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "restyle: bracket-toolbar scrollbar styling

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: `WindowPanel` component

**Files:**
- Create: `src/components/WindowPanel.tsx`

**Interfaces:**
- Produces: `WindowPanel: React.FC<{ title: string; className?: string; children: React.ReactNode }>` — a chrome wrapper (title bar with decorative resize/help glyphs, 3px double border) around arbitrary panel content. Consumed by Task 9 and Task 10.

- [ ] **Step 1: Write the component**

```tsx
import React from 'react';

export const WindowPanel: React.FC<{
  title: string;
  className?: string;
  children: React.ReactNode;
}> = ({ title, className = '', children }) => (
  <div className={`relative border-[3px] border-double border-phosphor/25 ${className}`}>
    <div className="flex items-center justify-between gap-2 px-2 py-1 bg-phosphor/10 border-b border-phosphor/25">
      <span
        aria-hidden="true"
        className="w-3 h-3 flex-shrink-0 border border-phosphor/25 flex items-center justify-center text-[8px] leading-none text-phosphor/70"
      >
        &#8598;
      </span>
      <span className="font-body text-label uppercase tracking-widest text-phosphor/70 truncate">
        {title}
      </span>
      <span
        aria-hidden="true"
        className="w-3 h-3 flex-shrink-0 border border-phosphor/25 flex items-center justify-center text-[8px] leading-none text-phosphor/70"
      >
        ?
      </span>
    </div>
    <div className="p-6">{children}</div>
  </div>
);
```

- [ ] **Step 2: Run typecheck**

Run: `npm run lint`
Expected: passes (new file, no consumers yet — just needs to compile standalone).

- [ ] **Step 3: Commit**

```bash
git add src/components/WindowPanel.tsx
git commit -m "feat: add WindowPanel chrome wrapper component

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: `Meter` component

**Files:**
- Create: `src/components/Meter.tsx`

**Interfaces:**
- Produces: `Meter: React.FC<{ label: string; value: string; percent: number }>` — a bracket-enclosed, diagonal-hatch-filled bar with a right-aligned accent-colored value. Consumed by Task 9.

- [ ] **Step 1: Write the component**

```tsx
import React from 'react';

export const Meter: React.FC<{
  label: string;
  value: string;
  percent: number;
}> = ({ label, value, percent }) => {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="mb-3">
      <div className="font-body text-label uppercase tracking-widest text-phosphor/50 mb-1">
        {label}
      </div>
      <div className="flex items-center gap-1">
        <div className="w-1.5 self-stretch border-t border-b border-l border-phosphor/25" aria-hidden="true" />
        <div className="flex-1 h-4 bg-void-dark overflow-hidden">
          <div
            className="h-full"
            style={{
              width: `${clamped}%`,
              opacity: 0.85,
              backgroundImage:
                'repeating-linear-gradient(45deg, var(--color-phosphor) 0, var(--color-phosphor) 2px, transparent 2px, transparent 4px)',
            }}
          />
        </div>
        <div className="w-1.5 self-stretch border-t border-b border-r border-phosphor/25" aria-hidden="true" />
        <span className="font-body text-body-sm text-accent w-16 text-right flex-shrink-0">
          {value}
        </span>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Run typecheck**

Run: `npm run lint`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/components/Meter.tsx
git commit -m "feat: add Meter hatched bracket-bar component

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 7: `DitherField` component

**Files:**
- Create: `src/components/DitherField.tsx`

**Interfaces:**
- Produces: `DitherField: React.FC<{ size?: number; cell?: number; lightX?: number; lightY?: number; className?: string }>` — an absolutely-positioned SVG dither-noise field (5-shade tonal ramp, radial "light source", hard pixel edges, some cells skipped) meant to sit behind content inside a `position: relative` ancestor. Consumed by Task 10.

- [ ] **Step 1: Write the component**

```tsx
import React, { useMemo } from 'react';

const PALETTE = ['#08170c', '#134321', '#2ECC58', '#8ffcae', '#eafff0'];

function pseudoRandom(row: number, col: number): number {
  const v = Math.sin(row * 12.9898 + col * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

export const DitherField: React.FC<{
  size?: number;
  cell?: number;
  lightX?: number;
  lightY?: number;
  className?: string;
}> = ({ size = 200, cell = 6, lightX = 0.7, lightY = 0.3, className = '' }) => {
  const rects = useMemo(() => {
    const cols = Math.ceil(size / cell);
    const out: { x: number; y: number; fill: string }[] = [];
    for (let row = 0; row < cols; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * cell;
        const y = row * cell;
        const ux = x / size;
        const uy = y / size;
        const dist = Math.sqrt((ux - lightX) ** 2 + (uy - lightY) ** 2);
        const jitter = pseudoRandom(row, col);
        let brightness = Math.max(0, 1 - dist * 1.15) * 0.75 + jitter * 0.5 - 0.15;
        brightness = Math.max(0, Math.min(1, brightness));
        const skipChance = 0.55 - brightness * 0.4;
        if (jitter < skipChance * 0.6) continue;
        const idx = Math.min(PALETTE.length - 1, Math.floor(brightness * PALETTE.length));
        out.push({ x, y, fill: PALETTE[idx] });
      }
    }
    return out;
  }, [size, cell, lightX, lightY]);

  return (
    <svg
      className={`absolute inset-0 pointer-events-none ${className}`}
      width="100%"
      height="100%"
      viewBox={`0 0 ${size} ${size}`}
      shapeRendering="crispEdges"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={cell} height={cell} fill={r.fill} />
      ))}
    </svg>
  );
};
```

- [ ] **Step 2: Run typecheck**

Run: `npm run lint`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/components/DitherField.tsx
git commit -m "feat: add DitherField procedural texture component

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 8: `Waveform` component

**Files:**
- Create: `src/components/Waveform.tsx`

**Interfaces:**
- Produces: `Waveform: React.FC<{ width?: number; height?: number; cell?: number; className?: string }>` — a smooth oscillation plotted as tonal pixel blocks (5-shade ramp, brightness peaking at crests/troughs). Consumed by Task 10.

- [ ] **Step 1: Write the component**

```tsx
import React, { useMemo } from 'react';

const PALETTE = ['#134321', '#2ECC58', '#5fe887', '#8ffcae', '#eafff0'];

function pseudoRandom(seed: number): number {
  const v = Math.sin(seed * 12.9898) * 43758.5453;
  return v - Math.floor(v);
}

export const Waveform: React.FC<{
  width?: number;
  height?: number;
  cell?: number;
  className?: string;
}> = ({ width = 240, height = 60, cell = 4, className = '' }) => {
  const blocks = useMemo(() => {
    const midY = height / 2;
    const amp = height * 0.3;
    const out: { x: number; y: number; fill: string; opacity?: number }[] = [];
    for (let x = 0; x < width; x += cell) {
      const t = x / width;
      const yOffset = Math.sin(t * Math.PI * 3.2) * amp * (0.6 + 0.4 * Math.sin(t * Math.PI * 0.8));
      const y = midY + yOffset;
      const py = Math.round(y / cell) * cell;
      const intensity = Math.min(1, Math.abs(yOffset) / amp);
      const jitter = pseudoRandom(x * 0.37) * 0.35;
      const brightness = Math.max(0, Math.min(1, intensity * 0.75 + jitter));
      const idx = Math.min(PALETTE.length - 1, Math.floor(brightness * PALETTE.length));
      out.push({ x, y: py, fill: PALETTE[idx] });
      const trailIdx = Math.max(0, idx - 2);
      out.push({ x, y: py + (yOffset >= 0 ? cell : -cell), fill: PALETTE[trailIdx], opacity: 0.5 });
    }
    return out;
  }, [width, height, cell]);

  return (
    <svg
      className={className}
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {blocks.map((b, i) => (
        <rect key={i} x={b.x} y={b.y} width={cell - 1} height={cell - 1} fill={b.fill} opacity={b.opacity ?? 1} />
      ))}
    </svg>
  );
};
```

- [ ] **Step 2: Run typecheck**

Run: `npm run lint`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/components/Waveform.tsx
git commit -m "feat: add Waveform pixel-block telemetry component

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 9: Apply `WindowPanel` + `Meter` to Constellation Detail panels

**Files:**
- Modify: `src/components/ConstellationDetail.tsx`

**Interfaces:**
- Consumes: `WindowPanel` (Task 5), `Meter` (Task 6).
- Produces: no external prop-surface change — `ConstellationDetail`'s own props (`{ data, scanDate }`) are unchanged.

- [ ] **Step 1: Import the new components**

In `src/components/ConstellationDetail.tsx`, add to the top imports (after the existing `import { formatVisibility } from '../utils';` line):

```tsx
import { WindowPanel } from './WindowPanel';
import { Meter } from './Meter';
```

- [ ] **Step 2: Convert `MetricGrid`'s Signal Integrity to a `Meter`**

Replace the `MetricGrid` component (`src/components/ConstellationDetail.tsx:7-26`) with:

```tsx
const MetricGrid: React.FC<{ data: Constellation }> = ({ data }) => (
  <>
    <div className="bg-void-light p-3 md:p-4 border border-phosphor/10 col-span-2">
      <Meter label="Signal Integrity" value="98.4%" percent={98.4} />
    </div>
    <div className="bg-void-light p-3 md:p-4 border border-phosphor/10">
      <div className="font-body text-label text-phosphor/40 uppercase mb-1 md:mb-2">Distance (LY)</div>
      <div className="font-body text-heading text-phosphor">{data.distance}</div>
    </div>
    <div className="bg-void-light p-3 md:p-4 border border-phosphor/10">
      <div className="font-body text-label text-phosphor/40 uppercase mb-1 md:mb-2">Observation Window</div>
      <div className="font-body text-heading text-phosphor">{data.observationWindow}</div>
    </div>
    <div className="bg-void-light p-3 md:p-4 border border-phosphor/10">
      <div className="font-body text-label text-phosphor/40 uppercase mb-1 md:mb-2">Sky Sector</div>
      <div className="font-body text-heading text-phosphor">{data.skySector}</div>
    </div>
  </>
);
```

`98.4%` is the literal value the app already hardcoded here (not derived from `data`) — see the original at `ConstellationDetail.tsx:11`. Distance/Observation Window/Sky Sector stay plain label/value pairs since they're free-form strings, per the Global Constraints resolution. The grid this renders into is `grid grid-cols-2 gap-4` (desktop) / `grid grid-cols-2 gap-3` (mobile) — `col-span-2` makes the Meter take the full width of its row on both.

Deliberate deviation from the spec's literal "applies to: MetricGrid cards" wording: these four tiles are ~100px stat cells, not full sections — giving each one its own `WindowPanel` title bar (chrome sized for a whole panel) would look cramped and doesn't match the reference photos either, where small individual readouts are plain inline label/value text and only grouped sections get title bars. `MetricGrid`'s tiles keep their existing plain `bg-void-light` boxes; only the panels wrapped in Steps 3-6 below get full window chrome.

- [ ] **Step 3: Wrap "Astronomical Profile" in `WindowPanel`**

Replace the block at `src/components/ConstellationDetail.tsx:179-203` (the `<div className="lg:col-span-5 order-4 lg:order-3 flex flex-col gap-4"><div className="bg-void-light p-6">...Astronomical Profile...</div></div>`) with:

```tsx
<div className="lg:col-span-5 order-4 lg:order-3 flex flex-col gap-4">
  <WindowPanel title="Astronomical Profile">
    <p className="font-body text-body-sm text-phosphor/60 leading-relaxed mb-6">
      {data.description}
    </p>

    <div className="space-y-3">
      <div className="flex justify-between items-end gap-2">
        <span className="font-body text-label uppercase text-phosphor/40">Classification</span>
        <span className="font-body text-body-sm text-phosphor">{data.type}</span>
      </div>
      <div className="flex justify-between items-end gap-2">
        <span className="font-body text-label uppercase text-phosphor/40">Visibility Range</span>
        <span className="font-body text-body-sm text-phosphor">{formatVisibility(data.visibility)}</span>
      </div>
      <div className="flex justify-between items-end gap-2">
        <span className="font-body text-label uppercase text-phosphor/40">Stellar Count</span>
        <span className="font-body text-body-sm text-phosphor">{data.stars.length} Main Stars</span>
      </div>
    </div>
  </WindowPanel>
</div>
```

Note `WindowPanel` already provides the title/heading — drop the old `<h3>Astronomical Profile</h3>` that used to live inside the `bg-void-light` div.

- [ ] **Step 4: Wrap "Observation Metrics" in `WindowPanel`**

Replace the block at `src/components/ConstellationDetail.tsx:205-225` the same way:

```tsx
<div className="lg:col-span-5 order-5 lg:order-4 flex flex-col gap-4">
  <WindowPanel title="Observation Metrics">
    <div className="space-y-3">
      <div className="flex justify-between items-end gap-2">
        <span className="font-body text-label uppercase text-phosphor/40">Luminosity index</span>
        <span className="font-body text-body-sm text-phosphor">{data.spectralData.luminosity}</span>
      </div>
      <div className="flex justify-between items-end gap-2">
        <span className="font-body text-label uppercase text-phosphor/40">Nebula Density</span>
        <span className="font-body text-body-sm text-phosphor">{data.spectralData.nebulaDensity}</span>
      </div>
      <div className="flex justify-between items-end gap-2">
        <span className="font-body text-label uppercase text-phosphor/40">Signal Drift</span>
        <span className="font-body text-body-sm text-phosphor">{data.spectralData.signalDrift}</span>
      </div>
    </div>
  </WindowPanel>
</div>
```

- [ ] **Step 5: Wrap "Mythological Origin" in `WindowPanel`**

Replace the block at `src/components/ConstellationDetail.tsx:227-236`:

```tsx
<div className="lg:col-span-5 order-6 lg:order-5 flex flex-col gap-4">
  <WindowPanel title="Mythological Origin">
    <p className="font-body text-body-sm text-phosphor/60 leading-relaxed">
      {data.mythology}
    </p>
  </WindowPanel>
</div>
```

- [ ] **Step 6: Wrap the star-data popover in `WindowPanel`**

Replace the popover block at `src/components/ConstellationDetail.tsx:127-156`:

```tsx
{selectedStar && (
  <div className="absolute top-4 right-4 w-52 z-20 animate-in fade-in slide-in-from-right-4 duration-300">
    <WindowPanel title="Star Data" className="bg-void-dark/90 backdrop-blur-sm">
      <button
        onClick={() => setSelectedStarIndex(null)}
        className="absolute top-1 right-8 text-phosphor hover:text-white font-body text-label font-bold"
        aria-label="Close star data"
      >
        [X]
      </button>
      <div className="space-y-2">
        <div>
          <div className="text-label uppercase text-phosphor/40">Designation</div>
          <div className="text-body-sm text-phosphor font-body">{selectedStar.name || `STAR_${data.name.slice(0,3)}_${selectedStarIndex}`}</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-label uppercase text-phosphor/40">Magnitude</div>
            <div className="text-body-sm text-phosphor font-body">{(Math.random() * 5 + 1).toFixed(2)}</div>
          </div>
          <div>
            <div className="text-label uppercase text-phosphor/40">Class</div>
            <div className="text-body-sm text-phosphor font-body">{['O', 'B', 'A', 'F', 'G', 'K', 'M'][selectedStarIndex % 7]}</div>
          </div>
        </div>
        <div>
          <div className="text-label uppercase text-phosphor/40">Coordinates</div>
          <div className="text-label text-phosphor font-mono">RA: {starToRA(selectedStar.x)} / DEC: {starToDec(selectedStar.y)}</div>
        </div>
      </div>
    </WindowPanel>
  </div>
)}
```

This drops the ad-hoc `border border-phosphor` box + manual header row in favor of `WindowPanel`'s chrome; the close button moves to an absolutely-positioned overlay on top of the panel's own title bar (rather than inside a second header row) since `WindowPanel` doesn't have a slot for a third interactive control in its title bar — a `WindowPanel` with content wide enough to need width padding around `[X]` is not worth adding a title-bar prop for a single one-off usage; simplicity wins here (see Global Constraints — YAGNI applies to component APIs too).

- [ ] **Step 7: Run typecheck**

Run: `npm run lint`
Expected: passes. If it fails on an unused import (e.g. `formatVisibility` no longer referenced somewhere it used to be), fix the import list.

- [ ] **Step 8: Visual check**

Run: `npm run dev`, scan a constellation (or open one from Archives). Confirm: Signal Integrity renders as a hatched bracket-meter; Astronomical Profile / Observation Metrics / Mythological Origin all show the new title-bar chrome with resize/help glyphs and a visible double border; clicking a star shows the popover with the same chrome and a working close button.

- [ ] **Step 9: Commit**

```bash
git add src/components/ConstellationDetail.tsx
git commit -m "restyle: window chrome + hatched meter on constellation detail panels

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 10: `DitherField` behind the star visualizer + `Waveform` in the header

**Files:**
- Modify: `src/components/ConstellationDetail.tsx` (visualizer background)
- Modify: `src/components/Layout.tsx` (header)

**Interfaces:**
- Consumes: `DitherField` (Task 7), `Waveform` (Task 8).

- [ ] **Step 1: Swap the visualizer's flat dot-grid for `DitherField`**

In `src/components/ConstellationDetail.tsx`, add the import:

```tsx
import { DitherField } from './DitherField';
```

Replace the flat dot-grid `<div>` at `ConstellationDetail.tsx:78` —

```tsx
<div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle, #00FF41 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
```

— with:

```tsx
<DitherField size={480} cell={8} className="opacity-60" />
```

`size` is a fixed generation resolution for the procedural field (it scales via `preserveAspectRatio="none"` to fill whatever the actual rendered box is, per `DitherField`'s own viewBox/percent-sizing — see Task 7); it does not need to match the visualizer's real pixel size.

- [ ] **Step 2: Add a `Waveform` accent to the header**

In `src/components/Layout.tsx`, add the import:

```tsx
import { Waveform } from './Waveform';
```

In the `Header` component, add the waveform between the title and the right-hand group:

```tsx
export const Header: React.FC<{ username: string; onSettingsClick?: () => void }> = ({ username, onSettingsClick }) => {
  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-void/95 backdrop-blur-sm border-b border-phosphor/20 shadow-[0_0_15px_rgba(0,255,65,0.1)]">
      <div className="flex items-center gap-4">
        <h1 className="font-headline text-title font-bold text-phosphor glow-text tracking-widest uppercase">
          STELLAR SCAN
        </h1>
      </div>
      <Waveform width={120} height={28} className="hidden md:block opacity-70" />
      <div className="flex items-center gap-6">
        <span className="font-body uppercase tracking-widest text-body-sm text-phosphor hidden sm:inline">
          LOGGED_IN: {username}
        </span>
        <span
          onClick={onSettingsClick}
          className="btn-compact btn-outline px-2 py-1 cursor-pointer"
        >
          [Config]
        </span>
      </div>
    </header>
  );
};
```

Hidden below `md` since the 64px-tall header has no room for it alongside the title and right-hand group on narrow screens.

- [ ] **Step 3: Run typecheck**

Run: `npm run lint`
Expected: passes.

- [ ] **Step 4: Visual check**

Run: `npm run dev`. On a constellation detail page, the star visualizer's background should show blocky, irregular, tonally-varied dither speckle (not a uniform dot grid) instead of the old plain radial-gradient dots. On a desktop-width viewport, the header should show a small pixel-block waveform between the title and the login/config group.

- [ ] **Step 5: Commit**

```bash
git add src/components/ConstellationDetail.tsx src/components/Layout.tsx
git commit -m "restyle: dithered visualizer texture + header telemetry waveform

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 11: Window-chrome title bar on the Export Card modal

**Files:**
- Modify: `src/components/ExportCard.tsx`

**Interfaces:**
- No new component consumed — `ExportCard`'s 3D-tilt card has its own bespoke layout (`dialkit`-driven font sizes, `motion` transforms) that doesn't fit cleanly inside `WindowPanel`'s wrapper, so this task applies matching chrome markup directly rather than forcing the reusable component in.

- [ ] **Step 1: Add a title-bar strip above the existing header row**

In `src/components/ExportCard.tsx`, in the card's content (`ExportCard.tsx:82` — the `<div className="relative z-10 flex flex-col" ...>` block), add a title-bar strip immediately before the existing `{/* Header */}` div:

```tsx
{/* Title bar */}
<div className="flex items-center justify-between px-1 pb-2 mb-3 border-b border-phosphor/25">
  <span aria-hidden="true" className="w-3 h-3 border border-phosphor/25 flex items-center justify-center text-[8px] leading-none text-phosphor/70">
    &#8598;
  </span>
  <span className="font-body text-label uppercase tracking-widest text-phosphor/70">Export Card</span>
  <span aria-hidden="true" className="w-3 h-3 border border-phosphor/25 flex items-center justify-center text-[8px] leading-none text-phosphor/70">
    ?
  </span>
</div>
```

- [ ] **Step 2: Change the card's outer border to a double border**

In `src/components/ExportCard.tsx:75`, change:

```tsx
className="relative w-full bg-void-dark border-2 border-phosphor/40 shadow-[0_0_50px_rgba(0,255,65,0.2)] flex flex-col p-6"
```

to:

```tsx
className="relative w-full bg-void-dark border-[3px] border-double border-phosphor/25 shadow-[0_0_50px_rgba(0,255,65,0.2)] flex flex-col p-6"
```

- [ ] **Step 3: Run typecheck**

Run: `npm run lint`
Expected: passes.

- [ ] **Step 4: Visual check**

Run: `npm run dev`, open a constellation detail page, click "Export to Card". The exported card preview should now show a thin title-bar strip (`Export Card`, resize/help glyphs) above the constellation name, and a double-line border around the whole card. Click "Save Image" and confirm the downloaded PNG includes the new title bar (the `html-to-image` capture targets `cardRef`, which wraps this content — no change needed to the capture logic itself).

- [ ] **Step 5: Commit**

```bash
git add src/components/ExportCard.tsx
git commit -m "restyle: window-chrome title bar on export card

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 12: `CrtBezel` component

**Files:**
- Create: `src/components/CrtBezel.tsx`
- Modify: `src/index.css` (one new keyframe)

**Interfaces:**
- Produces: `CrtBezel: React.FC<{ children: React.ReactNode }>` — wraps `children` in a physical-monitor frame with a real convex (barrel) screen aperture, bowed scanlines, a rim glow, two-pass bloom, and grain. `children` renders three times internally (two blurred/`inert` decorative clones behind, one real interactive copy on top) — see Step 1's comment for why this is safe. Consumed by Task 13.

- [ ] **Step 1: Add the ambient flicker keyframe**

In `src/index.css`, add a new keyframe near the existing `@keyframes flicker` block (this is a distinct, slower keyframe from the existing 0.15s `.flicker` utility used elsewhere — do not reuse that one, it's a different effect at a different timing):

```css
@keyframes crt-bezel-flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
```

- [ ] **Step 2: Write the component**

```tsx
import React from 'react';

// A quadratic-bezier barrel (convex) outline for the screen aperture, in two
// coordinate spaces:
// - FRACTIONAL (0-1): for the SVG <clipPath clipPathUnits="objectBoundingBox">
//   used to actually clip the screen content — this is what makes the shape
//   scale correctly to any rendered size (a short mobile viewport, a tall
//   scrollable desktop page), instead of being pinned to one fixed pixel box.
// - SCALED (0-100): the same shape, multiplied by 100, for drawing the
//   visible rim-glow stroke and the scanline clip inside a
//   `viewBox="0 0 100 100" preserveAspectRatio="none"` SVG.
const BARREL_PATH_FRACTIONAL =
  'M0.0341 0.0071 Q0.5 -0.0321 0.966 0.0071 Q0.998 0.5 0.966 0.9929 Q0.5 1.0321 0.0341 0.9929 Q0.0023 0.5 0.0341 0.0071 Z';
const BARREL_PATH_100 =
  'M3.41 0.71 Q50 -3.21 96.6 0.71 Q99.8 50 96.6 99.29 Q50 103.21 3.41 99.29 Q0.23 50 3.41 0.71 Z';

const SCANLINES = Array.from({ length: 67 }, (_, i) => {
  const y = i * 1.5;
  const bow = Math.sin((y / 100) * Math.PI) * 1.2;
  return `M0 ${y} Q50 ${(y - bow * 0.4).toFixed(2)} 100 ${y}`;
});

export const CrtBezel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="w-full bg-gradient-to-br from-[#1c1c1a] via-[#060605] to-[#020201] rounded-[34px] p-6 md:p-8 shadow-[0_30px_70px_rgba(0,0,0,0.85)]"
    // Rounded corners here are an explicit, spec-approved exception to the
    // app's no-border-radius rule — this is the physical monitor housing.
  >
    <div className="relative w-full">
      <div className="relative bg-void overflow-hidden" style={{ clipPath: 'url(#crtBarrelClip)' }}>
        <svg width="0" height="0" className="absolute" aria-hidden="true">
          <defs>
            <clipPath id="crtBarrelClip" clipPathUnits="objectBoundingBox">
              <path d={BARREL_PATH_FRACTIONAL} />
            </clipPath>
          </defs>
        </svg>

        {/* Bloom pass 2: wide glow. Rendering `children` again here (rather
            than cloning DOM/innerHTML) keeps every element a real React
            node — `inert` removes this whole copy from focus order, the
            accessibility tree, and pointer events in one attribute, so it's
            purely decorative and never double-announced or double-clickable. */}
        <div
          className="absolute inset-0"
          style={{ filter: 'blur(20px) brightness(1.6)', opacity: 0.45, mixBlendMode: 'screen' }}
          inert={true}
        >
          {children}
        </div>
        {/* Bloom pass 1: tight halo. */}
        <div
          className="absolute inset-0"
          style={{ filter: 'blur(10px) brightness(1.1)', opacity: 0.6, mixBlendMode: 'screen' }}
          inert={true}
        >
          {children}
        </div>
        {/* Sharp, real, interactive layer. */}
        <div className="relative">{children}</div>

        <svg
          className="absolute inset-0 pointer-events-none mix-blend-screen"
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <filter id="crtGrain">
            <feTurbulence type="fractalNoise" baseFrequency="0.42" numOctaves={2} stitchTiles="stitch" result="n" />
            <feColorMatrix
              in="n"
              type="matrix"
              values="0 0 0 0 0.75  0 0 0 0 1  0 0 0 0 0.85  0.5 0.5 0.5 0 -0.6"
            />
          </filter>
          <rect width="100" height="100" filter="url(#crtGrain)" opacity="0.10" />
        </svg>

        <div
          className="absolute inset-0 pointer-events-none bg-phosphor/5"
          style={{ animation: 'crt-bezel-flicker 6s infinite' }}
          aria-hidden="true"
        />
      </div>

      <svg
        className="absolute inset-0 pointer-events-none mix-blend-multiply"
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <g style={{ clipPath: 'url(#crtBarrelClip)' }}>
          {SCANLINES.map((d, i) => (
            <path key={i} d={d} stroke="rgba(0,0,0,0.22)" strokeWidth="0.15" fill="none" />
          ))}
        </g>
      </svg>
      <svg
        className="absolute inset-0 pointer-events-none"
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <filter id="crtRimBlur">
            <feGaussianBlur stdDeviation="0.4" />
          </filter>
        </defs>
        <path d={BARREL_PATH_100} fill="none" stroke="rgba(46,204,88,0.35)" strokeWidth="0.3" filter="url(#crtRimBlur)" />
      </svg>
    </div>
  </div>
);
```

- [ ] **Step 3: Run typecheck**

Run: `npm run lint`
Expected: passes. If TypeScript rejects the `inert={true}` prop (`Property 'inert' does not exist on type 'DetailedHTMLProps<...>'`), the installed React/DOM type definitions don't yet include the `inert` HTML attribute — fix by adding a local type augmentation at the top of `CrtBezel.tsx`:

```tsx
declare module 'react' {
  interface HTMLAttributes<T> {
    inert?: boolean;
  }
}
```

Re-run `npm run lint` after adding this and confirm it now passes.

- [ ] **Step 4: Commit**

```bash
git add src/components/CrtBezel.tsx src/index.css
git commit -m "feat: add CrtBezel barrel-aperture wrapper component

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 13: Pilot `CrtBezel` on the Constellation Detail screen

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `CrtBezel` (Task 12).
- Produces: no change to `App`'s external surface (it's the root component).

- [ ] **Step 1: Import `CrtBezel`**

In `src/App.tsx`, add:

```tsx
import { CrtBezel } from './components/CrtBezel';
```

- [ ] **Step 2: Wrap Header + screen + Footer in `CrtBezel` only on the DETAIL screen**

Replace the render block at `src/App.tsx:136-144`:

```tsx
return (
    <div className="min-h-screen relative">
      <Analytics />
      {import.meta.env.DEV && <Agentation />}
      {crtEnabled && <div className="crt-overlay" />}
      {screen !== 'BOOT' && <Header username={username} onSettingsClick={() => setShowSettings(true)} />}
      {renderScreen()}
      {screen !== 'BOOT' && <Footer activeTab={activeTab} onTabChange={handleTabChange} />}
```

with:

```tsx
  const app = (
    <>
      {screen !== 'BOOT' && <Header username={username} onSettingsClick={() => setShowSettings(true)} />}
      {renderScreen()}
      {screen !== 'BOOT' && <Footer activeTab={activeTab} onTabChange={handleTabChange} />}
    </>
  );

  return (
    <div className="min-h-screen relative">
      <Analytics />
      {import.meta.env.DEV && <Agentation />}
      {screen === 'DETAIL' && crtEnabled ? (
        <CrtBezel>{app}</CrtBezel>
      ) : (
        <>
          {crtEnabled && <div className="crt-overlay" />}
          {app}
        </>
      )}
```

(Keep the existing closing `</div>` and the Settings-modal JSX below it unchanged — this only touches the return statement's opening section, from the `<div className="min-h-screen relative">` line through the old three conditional renders.)

- [ ] **Step 3: Run typecheck**

Run: `npm run lint`
Expected: passes.

- [ ] **Step 4: Visual check**

Run: `npm run dev`. Scan a constellation to reach the `DETAIL` screen — it should now render inside the full CRT bezel (dark frame, curved barrel aperture, bowed scanlines, bloom halo, grain). Navigate to Archives or back to the Scanner input — those screens should render as before (flat `.crt-overlay` scanlines only, no bezel frame). Confirm every interactive element inside the bezel still works: click a star (popover opens/closes), click "Export to Card" (modal opens), use the footer tabs to navigate away and back.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat: pilot CRT bezel on constellation detail screen

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```
