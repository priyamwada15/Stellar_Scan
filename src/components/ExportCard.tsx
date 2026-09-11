import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useDialKit } from 'dialkit';
import { toPng } from 'html-to-image';
import { Constellation } from '../types';
import { formatVisibility } from '../utils';
import { TwinklingStars } from './TwinklingStars';

interface ExportCardProps {
  data: Constellation;
  scanDate: string;
  onClose: () => void;
}

export const ExportCard: React.FC<ExportCardProps> = ({ data, scanDate, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const fontSizes = useDialKit('Card Fonts', {
    title: [32, 10, 48],
    subtitle: [12, 6, 20],
    sectorTag: [10, 6, 20],
    statLabel: [10, 6, 16],
    statValue: [16, 8, 24],
    buttonText: [14, 8, 24],
  });

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [18, -18]), { stiffness: 300, damping: 25 });
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-18, 18]), { stiffness: 300, damping: 25 });

  const parallaxX = useSpring(useTransform(pointerX, [-0.5, 0.5], [-26, 26]), { stiffness: 300, damping: 25 });
  const parallaxY = useSpring(useTransform(pointerY, [-0.5, 0.5], [-20, 20]), { stiffness: 300, damping: 25 });
  const elevatedTransform = useTransform([parallaxX, parallaxY], ([px, py]: number[]) => `translate3d(${px}px, ${py}px, 85px)`);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerX.set((e.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handlePointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  const handleDownload = async () => {
    if (cardRef.current === null) return;
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `constellation-${data.name.toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export card', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-void/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-8">
        {/* The Card */}
        <div
          className="[perspective:800px]"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <motion.div
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            className="w-[350px]"
          >
            <div
              ref={cardRef}
              className="relative w-full bg-void-dark border-[3px] border-double border-phosphor/25 shadow-[0_0_50px_rgba(46,204,88,0.2)] flex flex-col p-6"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Iridescent Sheen Overlay */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 mix-blend-overlay bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.4)_45%,rgba(255,255,255,0.4)_55%,transparent_100%)] bg-[length:200%_100%] animate-[sheen_3s_infinite_linear]"></div>

              {/* Card Content */}
              <div className="relative z-10 flex flex-col" style={{ transformStyle: 'preserve-3d' }}>
                {/* Title bar */}
                <div className="flex items-center justify-between px-1 pb-2 mb-3 border-b border-phosphor/25">
                  <span aria-hidden="true" className="w-3 h-3 border border-phosphor/25 flex items-center justify-center text-[8px] leading-none text-phosphor/70">
                    &#8598;
                  </span>
                  <span className="font-body text-label uppercase tracking-widest text-phosphor/70">Export Card</span>
                  <span aria-hidden="true" className="w-3 h-3 border border-phosphor/25 flex items-center justify-center text-[8px] leading-none text-phosphor/70">
                    ?
                  </span>
                </div>
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-headline font-black text-phosphor glow-text uppercase leading-none" style={{ fontSize: `${fontSizes.title}px` }}>{data.name}</h3>
                    <p className="font-headline text-phosphor/75 uppercase tracking-widest" style={{ fontSize: `${fontSizes.subtitle}px` }}>{data.latinName}</p>
                  </div>
                  <div className="px-2 py-1 border border-phosphor/30 font-body text-phosphor uppercase" style={{ fontSize: `${fontSizes.sectorTag}px` }}>
                    SECTOR: {data.skySector || 'N/A'}
                  </div>
                </div>

                {/* Visualizer Area: fixed aspect ratio anchor, independent of surrounding text growth */}
                <div className="w-full aspect-[298.8/246.6] relative mb-4" style={{ transformStyle: 'preserve-3d' }}>
                  {/* Flat frame: stays on the card surface, clips the starfield to its bounds */}
                  <div className="absolute inset-0 bg-void border border-phosphor/20 overflow-hidden">
                    {/* Twinkling starfield backdrop */}
                    <TwinklingStars />

                    {/* Contact shadow: grounds the elevated constellation onto the surface below it */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div
                        className="w-[70%] h-[26%]"
                        style={{
                          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.35) 50%, transparent 75%)',
                          filter: 'blur(6px)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Elevated constellation: lifted off the card in Z and parallax-shifted so it appears to float above the surface */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center p-4"
                    style={{ transform: elevatedTransform, transformStyle: 'preserve-3d' }}
                  >
                    <div
                      className="w-full h-full relative"
                      style={{ filter: 'drop-shadow(0 26px 20px rgba(0,0,0,0.65)) drop-shadow(0 0 22px rgba(46,204,88,0.45))' }}
                    >
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {data.connections?.map(([startIdx, endIdx], i) => {
                          const start = data.stars[startIdx];
                          const end = data.stars[endIdx];
                          if (!start || !end) return null;
                          return (
                            <line
                              key={i}
                              x1={`${start.x}%`}
                              y1={`${start.y}%`}
                              x2={`${end.x}%`}
                              y2={`${end.y}%`}
                              stroke="#2ECC58"
                              strokeWidth="1"
                              strokeOpacity="0.4"
                            />
                          );
                        })}
                      </svg>
                      {data.stars.map((star, i) => (
                        <div
                          key={i}
                          className="absolute bg-phosphor shadow-[0_0_8px_#2ECC58] rounded-full w-1.5 h-1.5"
                          style={{ top: `${star.y}%`, left: `${star.x}%`, transform: 'translate(-50%, -50%)' }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-void-light p-2 border border-phosphor/10">
                    <div className="text-phosphor/55 uppercase mb-1" style={{ fontSize: `${fontSizes.statLabel}px` }}>Epoch</div>
                    <div className="text-phosphor font-body" style={{ fontSize: `${fontSizes.statValue}px` }}>{scanDate}</div>
                  </div>
                  <div className="bg-void-light p-2 border border-phosphor/10">
                    <div className="text-phosphor/55 uppercase mb-1" style={{ fontSize: `${fontSizes.statLabel}px` }}>Distance</div>
                    <div className="text-phosphor font-body" style={{ fontSize: `${fontSizes.statValue}px` }}>{data.distance}</div>
                  </div>
                  <div className="bg-void-light p-2 border border-phosphor/10">
                    <div className="text-phosphor/55 uppercase mb-1" style={{ fontSize: `${fontSizes.statLabel}px` }}>Visibility</div>
                    <div className="text-phosphor font-body" style={{ fontSize: `${fontSizes.statValue}px` }}>{formatVisibility(data.visibility)}</div>
                  </div>
                  <div className="bg-void-light p-2 border border-phosphor/10">
                    <div className="text-phosphor/55 uppercase mb-1" style={{ fontSize: `${fontSizes.statLabel}px` }}>Spectral Class</div>
                    <div className="text-phosphor font-body" style={{ fontSize: `${fontSizes.statValue}px` }}>{data.type}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="btn btn-outline px-6 py-2"
            style={{ fontSize: `${fontSizes.buttonText}px` }}
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            className="btn bg-phosphor text-void font-bold hover:scale-105 transition-all px-6 py-2 flex items-center gap-2"
            style={{ fontSize: `${fontSizes.buttonText}px` }}
          >
            Save Image
          </button>
        </div>
      </div>

      <style>{`
        @keyframes sheen {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};
