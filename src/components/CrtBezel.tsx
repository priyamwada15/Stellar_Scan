import React, { useEffect, useState } from 'react';

function useViewportSize() {
  const [size, setSize] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 1280,
    h: typeof window !== 'undefined' ? window.innerHeight : 800,
  }));
  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setSize({ w: window.innerWidth, h: window.innerHeight }));
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
  }, []);
  return size;
}

// Built from the ACTUAL viewport pixel dimensions (not a fixed abstract
// coordinate space stretched via `preserveAspectRatio="none"`), and both the
// housing margin and the curve's bulge are a percentage of `Math.min(w, h)`
// — the smaller of the two dimensions — rather than of each axis
// independently. That's the fix for the earlier version: sizing margin/bulge
// off each axis independently let a narrow or short viewport (an aspect
// ratio far from what was tuned against) blow the effective margin up to a
// large fraction of the available content width, clipping real text. Tying
// both to the smaller dimension keeps the effect visually consistent — and
// small in absolute terms — at any viewport size.
// `margin` is the housing's WORST-CASE intrusion depth — the curve pulls in
// to exactly this much at the corners, and less than this everywhere else
// (down to `margin - bulge` at the center of each edge, where the curve
// bulges back out). It's exported via `getCrtMargin` so Header/Footer can
// reserve exactly this much clearance for their own content — keeping them
// physically part of the CRT screen (still under the bezel's scanlines/grain,
// still curved-glass-framed) instead of needing to sit above it.
function getCrtMargin(w: number, h: number) {
  return Math.min(w, h) * 0.018;
}

function buildBarrelPath(w: number, h: number, margin: number) {
  const bulge = Math.min(w, h) * 0.012;

  const left = margin;
  const top = margin;
  const right = w - margin;
  const bottom = h - margin;
  const midX = w / 2;
  const midY = h / 2;

  return `M${left} ${top} Q${midX} ${top - bulge} ${right} ${top} Q${right + bulge} ${midY} ${right} ${bottom} Q${midX} ${bottom + bulge} ${left} ${bottom} Q${left - bulge} ${midY} ${left} ${top} Z`;
}

// A single, viewport-fixed decorative overlay — no `children` prop. It never
// wraps the app's real content (that was the source of the CRT-bezel bug
// class: a `clip-path`/`filter` ancestor breaks `position: fixed`
// descendants). Header, Footer, and every screen render completely normally
// alongside this component, and scroll under it exactly as they did before
// this component existed.
export const CrtBezel: React.FC = () => {
  const { w, h } = useViewportSize();
  const margin = getCrtMargin(w, h);
  const barrelPath = buildBarrelPath(w, h, margin);

  // Published as a CSS custom property (rather than prop-drilled) so any
  // fixed chrome that needs to clear the housing — currently Header/Footer —
  // can reference it without CrtBezel needing to know who's listening.
  useEffect(() => {
    document.documentElement.style.setProperty('--crt-margin', `${margin}px`);
    return () => {
      document.documentElement.style.removeProperty('--crt-margin');
    };
  }, [margin]);

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none" aria-hidden="true">
      {/* Housing: opaque monitor plastic with a barrel-shaped window punched
          through it. Painted, not clipped — real content under the "housing"
          area is simply occluded, never removed from the DOM or hit-testing
          (pointer-events is none on this whole layer anyway). */}
      <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${w} ${h}`}>
        <defs>
          <linearGradient id="crtHousingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1c1c1a" />
            <stop offset="60%" stopColor="#060605" />
            <stop offset="100%" stopColor="#020201" />
          </linearGradient>
        </defs>
        <path d={`M0 0 H${w} V${h} H0 Z ${barrelPath}`} fill="url(#crtHousingGrad)" fillRule="evenodd" />
      </svg>

      {/* Screen effects: scanlines + grain + flicker, clipped to the aperture
          so they only cover the visible "glass," not the housing plastic.
          `clip-path: path(...)` takes real CSS pixels directly — no
          objectBoundingBox conversion or separate SVG <clipPath> needed now
          that the path is already in the element's own pixel space. */}
      <div className="absolute inset-0" style={{ clipPath: `path('${barrelPath}')` }}>
        <div
          className="absolute inset-0 mix-blend-multiply"
          style={{
            backgroundImage:
              'repeating-linear-gradient(180deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 1px, transparent 1px, transparent 3px)',
          }}
        />
        {/* No viewBox on purpose: 1 SVG user unit === 1 CSS pixel, so
            `baseFrequency` describes a real ~2px feature size regardless of
            viewport size. */}
        <svg className="absolute inset-0 w-full h-full mix-blend-screen">
          <defs>
            <filter id="crtGrain" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.42" numOctaves={2} stitchTiles="stitch" result="n" />
              <feColorMatrix
                in="n"
                type="matrix"
                values="0 0 0 0 0.75  0 0 0 0 1  0 0 0 0 0.85  0.5 0.5 0.5 0 -0.6"
              />
            </filter>
            <pattern id="crtGrainTile" patternUnits="userSpaceOnUse" width="300" height="300">
              <rect width="300" height="300" filter="url(#crtGrain)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#crtGrainTile)" opacity="0.10" />
        </svg>
        <div className="absolute inset-0 bg-phosphor/5" style={{ animation: 'crt-bezel-flicker 6s infinite' }} />
      </div>

      {/* Rim glow along the aperture edge, outside the clip so its blur isn't
          itself clipped away. The path is already real CSS pixels, so a
          plain `strokeWidth` needs no non-scaling-stroke workaround. */}
      <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${w} ${h}`} style={{ filter: 'blur(2px)' }}>
        <path d={barrelPath} fill="none" stroke="rgba(46,204,88,0.35)" strokeWidth={2} />
      </svg>
    </div>
  );
};
