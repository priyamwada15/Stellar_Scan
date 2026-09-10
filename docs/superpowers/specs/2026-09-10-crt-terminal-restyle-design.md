# CRT Terminal Restyle — Design

## Overview

Restyle Stellar Scan's phosphor-terminal UI to be authentic to a specific reference aesthetic: 1980s-tactical-terminal software photographed off a CRT monitor (floating windowed panels with title-bar chrome, bracket-labeled hatched meters, dithered/pixelated imagery, bracket-style toolbars). The current implementation ([index.css](../../../src/index.css), [DesignSystem.tsx](../../../src/components/DesignSystem.tsx)) already commits to a monochrome-phosphor, hard-edged, VT323/JetBrains-Mono system — this restyle keeps that foundation and pushes it toward the reference material's specific visual language, rather than replacing it.

Reference material: six photos of green-phosphor CRT terminal software (tactical biomech analysis screen, personnel registry, radar/eye enhancement tool, signal diagnostics, field evolution tracker, location tracker map) supplied by the user.

## Goals

- Replace the current bright, purple-void palette with a muted, true-black phosphor palette closer to the references.
- Give every button, tab, and scrollbar a literal bracket-toolbar treatment.
- Give every panel/card/modal actual window chrome (title bar, resize + help glyphs, double border) instead of a flat bordered box.
- Replace flat label/value metric pairs with bracket-enclosed, diagonal-hatch-filled meters.
- Add a procedurally-dithered pixel texture (with real tonal variation, not just alpha) to image/visualizer backgrounds, and a pixel-block telemetry waveform as a new decorative element.
- Wrap the app in CRT-monitor framing (bezel, vignette, edge-curvature cues) without sacrificing usability.

## Non-goals

- True geometric barrel/pincushion distortion of DOM content (rejected — breaks text crispness, click hit-testing, and accessibility; see CRT Bezel decision below).
- Redesigning information architecture, adding new pages, or changing app behavior/data — this is visual restyle only.
- Changing fonts (VT323 / JetBrains Mono stay) or the hard-edge/no-border-radius rule already documented in the design system.

## Decisions

### 1. Color palette — "Muted Field Terminal"

Replace the `@theme` color tokens in [index.css](../../../src/index.css):

| Token | Current | New |
|---|---|---|
| `--color-void` | `#1f0e18` | `#050503` |
| `--color-void-dark` | `#190913` | `#020302` |
| `--color-void-light` | `#2c1a24` | `#0B0D09` |
| `--color-phosphor` | `#00FF41` | `#2ECC58` |
| `--color-phosphor-dim` | `rgba(0,255,65,0.4)` | `rgba(46,204,88,0.4)` |
| `--color-danger` | `#ef4444` | unchanged |

New token: `--color-accent: #35E6FF` — a cyan used only for numeric readouts inside hatched meters (matches the blue value text in the reference "Enhancement / Deinterlance" bars). Not used anywhere else; this stays a single-purpose accent, not a second theme color.

All existing `/10`–`/70` opacity-step usage on `phosphor` carries over unchanged (steps are relative, not tied to the specific hex).

### 2. Buttons, tabs, scrollbars — "Literal Bracket Toolbar"

- **Buttons**: flat rectangles with a 1px solid phosphor border, uppercase label, no fill by default; adjacent buttons in a toolbar share borders (no double-border seam) — i.e. a horizontal strip of bracket-bordered cells, matching the `FIND / SCAN / EXPORT / RESET / SAVE` toolbars in the references. Replaces `.btn-outline`; `.btn-primary` (filled) and `.btn-danger` variants keep their fill but adopt the same border weight.
- **Tabs** (footer nav): active tab becomes an inverted block (phosphor fill, void text) rather than an underline; inactive tabs stay dim text, no border. Matches the highlighted-row convention seen in the personnel-registry and signal-harmonics references.
- **Scrollbars**: custom-styled with a bordered track, up/down arrow-glyph buttons at each end, and a thumb using the same hatched-fill treatment as meters (see §4). No scrollbar styling exists today — this is net-new.

### 3. Panel / window chrome — "Full Window Chrome"

Every panel, card, and modal gets:
- A title bar: resize glyph (⇱, decorative/non-functional) top-left, panel label centered-left, `?` glyph (decorative) top-right.
- A double-line (`border: 1px double`) border around the whole panel.

Applies to: `MetricGrid` cards, "Astronomical Profile" / "Observation Metrics" / "Mythological Origin" panels in [ConstellationDetail.tsx](../../../src/components/ConstellationDetail.tsx), the star-data popover, and the [ExportCard.tsx](../../../src/components/ExportCard.tsx) modal. This is the largest-surface-area change in the restyle.

### 4. Data readouts — "Hatched Bracket-Meters"

Replace flat `label` / `value` pairs (e.g. Signal Integrity, Distance) with a bracket-enclosed bar:
- `[` / `]` drawn as line-brackets (border-top + border-bottom + border-left/right on a thin flanking element), not literal bracket characters.
- Filled portion uses a repeating 45° diagonal hatch (`repeating-linear-gradient(45deg, phosphor 0 2px, transparent 2px 4px)`), not a solid fill.
- Numeric value rendered in the new `--color-accent` cyan, right-aligned outside the bracket.
- The same hatched-fill treatment is reused for scrollbar thumbs (§2) so bars and scrollbars read as one visual language.

### 5. Visualizer / image texture — "Procedural Dither Field"

Background texture behind the star map (and candidate for other image-bearing surfaces) is generated, not a static tiled pattern:
- A 5-step tonal ramp: `#08170c` (near-black-green) → `#134321` → `#2ECC58` (phosphor) → `#8ffcae` → `#eafff0` (near-white-green).
- Each cell (~6px) independently colored by a simulated radial "light source" plus per-cell pseudo-random jitter — this is what makes it read as dithered image noise rather than a repeating grid (the first two attempts at this failed for exactly that reason: uniform tiles read as a dot-grid, and single-hue-with-opacity reads as fog, not dither).
- Rendered with `shape-rendering="crispEdges"` (hard pixel edges, no anti-aliasing) — pixelation is structural, not a blur/filter effect.
- Some cells are skipped entirely (void shows through) to avoid a solid fill.

Reference implementation of the generation logic is in the approved mockup: `.superpowers/brainstorm/1262-1789075512/content/visualizer-texture-v4.html` (inline `<script>` at the bottom).

### 6. Telemetry waveform (new element)

A decorative oscilloscope-style waveform, candidate placements: header area, boot/scan-in-progress states.
- Shape: a genuine smooth oscillation (`sin`-based), not a stepped/staircase square wave.
- Rendering: plotted as discrete pixel blocks (no stroked line), each block colored from the same 5-step tonal ramp as §5 — brightness peaks near-white at crests/troughs, dims through zero-crossings, plus per-pixel jitter for texture consistency with the dither field.
- Reference implementation: `.superpowers/brainstorm/1262-1789075512/content/bars-and-wave-v2.html`.

### 7. CRT bezel wrapper — "Overlay Frame + Edge Curvature" (Option 2)

Rejected true geometric distortion (WebGL/SVG displacement warp of DOM content) — breaks text legibility/selection, requires click-coordinate remapping, continuous render cost, and fights accessibility (zoom, screen readers). Approved approach:
- A fixed bezel frame around the viewport: rounded outer corners, dark frame, on top of the existing `.crt-overlay` scanline layer in [index.css](../../../src/index.css).
- A subtle radial vignette (brighter center, darker corners) plus a light `border-radius` on the content area itself, to *suggest* curved glass at the edges — content stays flat, fully readable, fully interactive everywhere.
- No content transform/warp anywhere.

**Rollout**: pilot on one page before applying app-wide. Proposed pilot page: **Constellation Detail** ([ConstellationDetail.tsx](../../../src/components/ConstellationDetail.tsx)) — it has the richest mix of surfaces (panels, meters, visualizer, modal) so it's the best stress test for how the bezel/vignette interacts with the other six changes. Flag if a different page is preferred (e.g. Archives, for a simpler/lower-risk first pass).

## Rollout order

1. Color palette (foundation everything else sits on)
2. Buttons, tabs, scrollbars
3. Panel/window chrome, data readouts, visualizer texture, telemetry waveform
4. CRT bezel — pilot on Constellation Detail, then app-wide pending approval

## Open questions

- Confirm pilot page for the CRT bezel (defaulting to Constellation Detail above).
- Telemetry waveform has no assigned placement yet beyond "header / boot / scan-in-progress" — exact component(s) to be decided during implementation.
- Whether the hatched-meter treatment replaces *all* current metric displays (Signal Integrity, Distance, Observation Window, Sky Sector in `MetricGrid`, plus Luminosity/Nebula Density/Signal Drift in Observation Metrics) or only ones that are meaningfully a 0–100%/quantity value — some current fields (e.g. Sky Sector, a text label) aren't really "meter" data and may stay as plain label/value pairs.
