import React from 'react';
import { motion } from 'motion/react';

export const PixelLoader: React.FC = () => {
  // 5x5 grid of pixels
  const pixels = Array.from({ length: 25 });

  return (
    <div className="relative w-24 h-24 mb-8">
      {/* Pixel Grid */}
      <div className="grid grid-cols-5 grid-rows-5 gap-1 w-full h-full">
        {pixels.map((_, i) => (
          <motion.div
            key={i}
            className="bg-phosphor rounded-[1px]"
            initial={{ opacity: 0.05 }}
            animate={{
              opacity: [0.05, 0.4, 0.9, 0.2, 0.05],
              scale: [0.9, 1, 1.1, 1, 0.9],
            }}
            transition={{
              duration: Math.random() * 2 + 1,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "linear"
            }}
          />
        ))}
      </div>
    </div>
  );
};
