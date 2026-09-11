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
