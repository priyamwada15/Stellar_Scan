import React from 'react';

// A quadratic-bezier barrel (convex) outline for the screen aperture, in two
// coordinate spaces:
// - FRACTIONAL (0-1): for the SVG <clipPath clipPathUnits="objectBoundingBox">
//   used to actually clip the screen content — this is what makes the shape
//   scale correctly to any rendered size (a short mobile viewport, a tall
//   scrollable desktop page), instead of being pinned to one fixed pixel box.
// - SCALED (0-100): the same shape, multiplied by 100, for drawing the
//   visible rim-glow stroke inside a
//   `viewBox="0 0 100 100" preserveAspectRatio="none"` SVG.
//
// Everything that is NOT the aperture outline (scanlines, grain, rim stroke
// width and its blur) must render at a genuine CSS-pixel scale: the element
// this bezel wraps is as tall as the whole scrollable page, so any length
// expressed in the stretched 0-100 viewBox space would grow with page height.
// Hence: scanlines are a CSS repeating-linear-gradient (fixed px pitch), the
// grain is a userSpaceOnUse-tiled pattern in an un-viewBoxed (1 unit = 1px)
// SVG, and the rim uses a non-scaling stroke plus a CSS blur on the <svg> box.
const BARREL_PATH_FRACTIONAL =
  'M0.0341 0.0071 Q0.5 -0.0321 0.966 0.0071 Q0.998 0.5 0.966 0.9929 Q0.5 1.0321 0.0341 0.9929 Q0.0023 0.5 0.0341 0.0071 Z';
const BARREL_PATH_100 =
  'M3.41 0.71 Q50 -3.21 96.6 0.71 Q99.8 50 96.6 99.29 Q50 103.21 3.41 99.29 Q0.23 50 3.41 0.71 Z';

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

        {/* Grain. No viewBox on purpose: 1 SVG user unit === 1 CSS pixel, so
            `baseFrequency` describes a real ~2px feature size no matter how
            tall the page is. The noise is generated once into a 300x300
            userSpaceOnUse pattern tile (seamless via stitchTiles) and tiled,
            rather than running feTurbulence over the full page area. */}
        <svg
          className="absolute inset-0 pointer-events-none mix-blend-screen"
          width="100%"
          height="100%"
          aria-hidden="true"
        >
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

        <div
          className="absolute inset-0 pointer-events-none bg-phosphor/5"
          style={{ animation: 'crt-bezel-flicker 6s infinite' }}
          aria-hidden="true"
        />
      </div>

      {/* Scanlines: a fixed 3px-pitch / 1px-bar CSS gradient, clipped to the
          same barrel aperture. The original SVG version bowed each line by a
          fraction of a viewBox unit, which is invisible at a real 3px pitch —
          so a flat gradient reads identically and can't drift with page size. */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-multiply"
        style={{
          clipPath: 'url(#crtBarrelClip)',
          backgroundImage:
            'repeating-linear-gradient(180deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 1px, transparent 1px, transparent 3px)',
        }}
        aria-hidden="true"
      />
      {/* Rim glow. `vector-effect: non-scaling-stroke` pins the stroke to 2 CSS
          px despite the non-uniformly stretched viewBox, and the soft halo is a
          CSS blur on the <svg> box (CSS px) rather than an feGaussianBlur in
          stretched user units. */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ filter: 'blur(2px)' }}
        aria-hidden="true"
      >
        <path
          d={BARREL_PATH_100}
          fill="none"
          stroke="rgba(46,204,88,0.35)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  </div>
);
