import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { Constellation } from '../types';
import { formatVisibility } from '../utils';

interface ExportCardProps {
  data: Constellation;
  scanDate: string;
  onClose: () => void;
}

export const ExportCard: React.FC<ExportCardProps> = ({ data, scanDate, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);

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
          ref={cardRef}
          className="relative w-[350px] h-[500px] bg-void-dark border-2 border-phosphor/40 rounded-[20px] overflow-hidden shadow-[0_0_50px_rgba(0,255,65,0.2)] flex flex-col p-6"
        >
          {/* Iridescent Sheen Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.4)_45%,rgba(255,255,255,0.4)_55%,transparent_100%)] bg-[length:200%_100%] animate-[sheen_3s_infinite_linear]"></div>
          
          {/* Card Content */}
          <div className="relative z-10 flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-headline text-2xl font-black text-phosphor glow-text uppercase leading-none">{data.name}</h3>
                <p className="font-headline text-[10px] text-phosphor/60 uppercase tracking-widest">{data.latinName}</p>
              </div>
              <div className="px-2 py-1 border border-phosphor/30 rounded text-[10px] font-headline text-phosphor uppercase">
                SECTOR: {data.skySector || 'N/A'}
              </div>
            </div>

            {/* Visualizer Area */}
            <div className="flex-grow bg-void border border-phosphor/20 rounded-xl relative mb-4 overflow-hidden">
              {/* More prominent dot grid */}
              <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle, #00FF41 1.5px, transparent 1.5px)', backgroundSize: '20px 20px' }}></div>
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="w-full h-full relative">
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
                          stroke="#00FF41"
                          strokeWidth="1"
                          strokeOpacity="0.4"
                        />
                      );
                    })}
                  </svg>
                  {data.stars.map((star, i) => (
                    <div 
                      key={i}
                      className="absolute bg-phosphor shadow-[0_0_8px_#00FF41] rounded-full w-1.5 h-1.5"
                      style={{ top: `${star.y}%`, left: `${star.x}%`, transform: 'translate(-50%, -50%)' }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-void-light p-2 border border-phosphor/10 rounded">
                <div className="text-[8px] text-phosphor/40 uppercase mb-1">Epoch</div>
                <div className="text-xs text-phosphor font-headline">{scanDate}</div>
              </div>
              <div className="bg-void-light p-2 border border-phosphor/10 rounded">
                <div className="text-[8px] text-phosphor/40 uppercase mb-1">Distance</div>
                <div className="text-xs text-phosphor font-headline">{data.distance}</div>
              </div>
              <div className="bg-void-light p-2 border border-phosphor/10 rounded">
                <div className="text-[8px] text-phosphor/40 uppercase mb-1">Visibility</div>
                <div className="text-xs text-phosphor font-headline">{formatVisibility(data.visibility)}</div>
              </div>
              <div className="bg-void-light p-2 border border-phosphor/10 rounded">
                <div className="text-[8px] text-phosphor/40 uppercase mb-1">Spectral Class</div>
                <div className="text-xs text-phosphor font-headline">{data.type}</div>
              </div>
            </div>

            {/* Footer / Serial */}
            <div className="mt-auto flex justify-between items-end border-t border-phosphor/20 pt-3">
              <div className="font-headline text-[8px] text-phosphor/30 uppercase tracking-widest">
                PHOSPHOR_ARCHIVE // {data.id.slice(0, 8)}
              </div>
              <div className="font-headline text-[10px] text-phosphor/60">
                V.8.4
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-2 border border-phosphor/30 text-phosphor font-headline text-xs uppercase hover:bg-phosphor/10 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleDownload}
            className="px-6 py-2 bg-phosphor text-void font-headline text-xs uppercase font-bold hover:scale-105 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">download</span>
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
