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
