import React, { useMemo } from 'react';

export const TwinklingStars: React.FC<{
  count?: number;
  className?: string;
  minOpacityRange?: [number, number];
  maxOpacityRange?: [number, number];
}> = ({ count = 50, className = '', minOpacityRange = [0.2, 0.4], maxOpacityRange = [0.65, 1] }) => {
  const stars = useMemo(() => {
    const [minLo, minHi] = minOpacityRange;
    const [maxLo, maxHi] = maxOpacityRange;
    return Array.from({ length: count }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      minOpacity: minLo + Math.random() * (minHi - minLo),
      maxOpacity: maxLo + Math.random() * (maxHi - maxLo),
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 4,
    }));
  }, [count, minOpacityRange, maxOpacityRange]);

  return (
    <div className={`absolute inset-0 ${className}`}>
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-phosphor"
          style={{
            top: `${star.y}%`,
            left: `${star.x}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: `twinkle ${star.duration}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
            ['--twinkle-min' as string]: star.minOpacity,
            ['--twinkle-max' as string]: star.maxOpacity,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};
