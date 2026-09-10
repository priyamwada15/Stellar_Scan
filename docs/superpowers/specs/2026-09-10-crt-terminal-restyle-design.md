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
| `--color-void` | `#1f0e18` | `#0d0d0d` |
| `--color-void-dark` | `#190913` | `#020302` |
| `--color-void-light` | `#2c1a24` | `#0B0D09` |
| `--color-phosphor` | `#00FF41` | `#2ECC58` |
| `--color-phosphor-dim` | `rgba(0,255,65,0.4)` | `rgba(46,204,88,0.4)` |
| `--color-danger` | `#ef4444` | unchanged |

`--color-void` was retuned from `#050503` to `#0d0d0d` (neutral near-black, no green tint) while live-testing the CRT bezel in §7 — picked directly via a color-picker dial against the actual dithered/bloomed screen content, so it supersedes the original swatch-comparison value.

New token: `--color-accent: #35E6FF` — a cyan used only for numeric readouts inside hatched meters (matches the blue value text in the reference "Enhancement / Deinterlance" bars). Not used anywhere else; this stays a single-purpose accent, not a second theme color.

New tokens for the two opacity dials confirmed while tuning the bezel (§7), but which apply anywhere phosphor color is used, not just inside the bezel:
- `--text-opacity: 0.7` — base phosphor text renders at `rgba(46,204,88,0.7)` rather than fully solid.
- `--border-opacity: 0.25` — phosphor borders (panel outlines, toolbar buttons, meter brackets) render at `rgba(46,204,88,0.25)`.

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

### 7. CRT bezel wrapper — "Overlay Frame + Real Curved Aperture"

Rejected true geometric distortion of DOM content (WebGL/SVG displacement warp of the whole app) — breaks text legibility/selection, requires click-coordinate remapping, continuous render cost, and fights accessibility (zoom, screen readers). What shipped instead is a set of cheap, purely visual layers around and over flat, undistorted content — refined over several rounds of live testing, documented below because two of the early attempts looked wrong for specific, non-obvious reasons worth not re-discovering.

**Bezel frame**: a fixed-position physical-monitor frame — dark gradient plastic housing, large `border-radius`, heavy outer `box-shadow` — wrapping a `.crt-screen` element that holds the actual app content.

**Curved aperture (the part that actually reads as "CRT")**: the first attempt only rounded the *frame's* outer corners while the screen area stayed a straight-edged rectangle — nothing in the middle ever looked curved, because a border-radius on the frame doesn't touch the screen's own boundary. The fix: `.crt-screen` is clipped with a real convex (barrel-shaped) `clip-path`, e.g.
```
clip-path: path('M30 4 Q440 -18 850 4 Q878 280 850 556 Q440 578 30 556 Q2 280 30 4 Z');
```
— each edge bows outward via a quadratic curve. Content near the boundary gets genuinely cropped by the curve, same as real CRT hardware (which is why old console UIs keep a "title-safe" margin) — component layout inside the pilot page needs to respect a safe margin roughly matching the curve's inset at the corners.

**Bowed scanlines**: rendered as individual SVG `<path>` elements (not a CSS `repeating-linear-gradient`) so each line can bow to match the aperture curvature — amplitude peaks at mid-height, tapers to ~0 near top/bottom — clipped to the same barrel `clipPath`.

**Rim glow**: a blurred stroke (`feGaussianBlur`) tracing the identical barrel path, rendered as a separate SVG layer *outside* the clipped content (so the glow itself isn't clipped away).

**Bloom** (soft halo on glowing edges): two stacked, blurred, `mix-blend-mode: screen` clones of the sharp content, positioned identically behind it:
- Pass 1 (tight halo): `blur(10px) brightness(1.10)`, opacity `0.60`
- Pass 2 (wide glow): `blur(20px) brightness(1.60)`, opacity `0.45`

Implementation note: an earlier, stronger version of pass 2 (`blur(28px) brightness(2.2)` at opacity `0.55`) blurred the active tab's solid-fill pill into a large bright blob that visually erased the adjacent low-opacity inactive tab label sitting under it. Bloom strength has to stay proportionate to how solid nearby fills are, or it washes out dim/secondary text — this is a real constraint on how strong bloom can go near any solid-filled control (active tab, filled buttons), not just a tuning preference.

**Grain**: a `feTurbulence`-based noise layer, tuned live to `baseFrequency 0.42`, a `feColorMatrix` contrast multiplier of `0.5` and alpha threshold offset of `-0.6`, rendered at `opacity 0.10`. Two bugs found while tuning this, both worth flagging since they'd silently no-op in a re-implementation:
1. The noise layer's `feColorMatrix` originally output **black** (`0,0,0`) colored speckle with only alpha varying. Combined with `mix-blend-mode: overlay`, this was completely invisible: `overlay` has no effect when the base layer is black, and black speckle blended onto a near-black background is black regardless. Fix: output pale/white-green color (`0.75, 1, 0.85`) instead of black, and use `mix-blend-mode: screen` (which actually lightens a dark base).
2. Rejected: a strong dark vignette (radial-darkened corners) and a diagonal glass-reflection sweep — both were tried and explicitly removed because they darkened/obscured actual UI content rather than reading as ambient screen lighting.

**Border & text opacity**: two more dials confirmed during this pass, documented as global tokens in §1 (`--border-opacity: 0.25`, `--text-opacity: 0.7`) since they're not bezel-specific — they soften the "full window chrome" borders (§3) and base text everywhere so the restyle doesn't read as over-saturated next to the bloom/grain treatment.

**App background**: `--color-void` retuned from `#050503` to `#0d0d0d` (neutral near-black) while looking at it against the tuned bloom/grain — see §1.

No content transform/warp anywhere — every one of the above is a clip-path on the container, an SVG overlay layer, or a CSS filter/blend on a decorative clone. The actual interactive DOM is never touched.

**Rollout**: pilot on one page before applying app-wide. Proposed pilot page: **Constellation Detail** ([ConstellationDetail.tsx](../../../src/components/ConstellationDetail.tsx)) — it has the richest mix of surfaces (panels, meters, visualizer, modal) so it's the best stress test for how the bezel/vignette interacts with the other six changes. Flag if a different page is preferred (e.g. Archives, for a simpler/lower-risk first pass).

Reference implementation of the final tuned state: `.superpowers/brainstorm/1262-1789075512/content/crt-bezel-final.html`.

## Rollout order

1. Color palette (foundation everything else sits on)
2. Buttons, tabs, scrollbars
3. Panel/window chrome, data readouts, visualizer texture, telemetry waveform
4. CRT bezel — pilot on Constellation Detail, then app-wide pending approval

## Open questions

- Confirm pilot page for the CRT bezel (defaulting to Constellation Detail above).
- Telemetry waveform has no assigned placement yet beyond "header / boot / scan-in-progress" — exact component(s) to be decided during implementation.
- Whether the hatched-meter treatment replaces *all* current metric displays (Signal Integrity, Distance, Observation Window, Sky Sector in `MetricGrid`, plus Luminosity/Nebula Density/Signal Drift in Observation Metrics) or only ones that are meaningfully a 0–100%/quantity value — some current fields (e.g. Sky Sector, a text label) aren't really "meter" data and may stay as plain label/value pairs.
