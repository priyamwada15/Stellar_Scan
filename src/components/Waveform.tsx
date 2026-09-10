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
