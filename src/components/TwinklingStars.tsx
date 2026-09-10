import React, { useMemo } from 'react';

export const TwinklingStars: React.FC<{ count?: number; className?: string }> = ({ count = 50, className = '' }) => {
  const stars = useMemo(() => (
    Array.from({ length: count }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      minOpacity: Math.random() * 0.2 + 0.2,
      maxOpacity: Math.random() * 0.35 + 0.65,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 4,
    }))
  ), [count]);

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
