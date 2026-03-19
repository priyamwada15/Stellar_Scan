import React, { useState } from 'react';
import { Constellation } from '../types';
import { ExportCard } from './ExportCard';

export const ConstellationDetail: React.FC<{ data: Constellation; scanDate?: string }> = ({ data, scanDate }) => {
  const [showExport, setShowExport] = useState(false);
  const [selectedStarIndex, setSelectedStarIndex] = useState<number | null>(null);
  
  const currentScanDate = scanDate || (() => {
    const now = new Date();
    return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
  })();

  const starToRA = (x: number) => {
    const hours = Math.floor((x / 100) * 24);
    const minutes = Math.floor(((x / 100) * 24 % 1) * 60);
    return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
  };

  const starToDec = (y: number) => {
    const degrees = Math.floor((y / 100) * 180 - 90);
    const minutes = Math.floor((Math.abs((y / 100) * 180 - 90) % 1) * 60);
    return `${degrees > 0 ? '+' : ''}${degrees}° ${minutes}'`;
  };

  const selectedStar = selectedStarIndex !== null ? data.stars[selectedStarIndex] : null;

  return (
    <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
      {showExport && <ExportCard data={data} scanDate={currentScanDate} onClose={() => setShowExport(false)} />}
      
      <div className="grid grid-cols-12 gap-8 relative">
        {/* Left Column: Visualizer, Button & Metrics */}
        <div className="col-span-12 md:col-span-7 flex flex-col gap-8">
          {/* Visualizer */}
          <div className="aspect-square bg-void-dark relative overflow-hidden group border border-phosphor/10">
            <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle, #00FF41 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            <div className="absolute inset-0 flex items-center justify-center p-12">
              <div className="relative w-full h-full border border-phosphor/20 p-8">
                <div className="w-full h-full relative" onClick={() => setSelectedStarIndex(null)}>
                  {/* Connection Lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
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
                          stroke="currentColor"
                          strokeWidth="0.5"
                          className="text-phosphor/30"
                        />
                      );
                    })}
                  </svg>

                  {/* Stars */}
                  {data.stars.map((star, i) => (
                    <div 
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStarIndex(selectedStarIndex === i ? null : i);
                      }}
                      className={`absolute bg-phosphor shadow-[0_0_10px_#00FF41] rounded-full cursor-pointer transition-all duration-300 ${
                        star.size === 'lg' ? 'w-3 h-3' : star.size === 'md' ? 'w-2 h-2' : 'w-1 h-1'
                      } ${selectedStarIndex === i ? 'scale-150 ring-4 ring-phosphor/40' : 'hover:scale-125'}`}
                      style={{ top: `${star.y}%`, left: `${star.x}%`, transform: 'translate(-50%, -50%)' }}
                    >
                      {star.name && (
                        <span className={`absolute top-4 left-0 text-[8px] font-mono whitespace-nowrap transition-opacity ${selectedStarIndex === i ? 'opacity-100 font-bold' : 'opacity-40'}`}>
                          {star.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Star Data Overlay */}
                {selectedStar && (
                  <div className="absolute top-4 right-4 w-48 bg-void-dark/90 border border-phosphor p-3 backdrop-blur-sm animate-in fade-in slide-in-from-right-4 duration-300 z-20">
                    <div className="flex justify-between items-start mb-2 border-b border-phosphor/20 pb-1">
                      <span className="font-headline text-[10px] text-phosphor uppercase">Star Data</span>
                      <button onClick={() => setSelectedStarIndex(null)} className="text-phosphor hover:text-white">
                        <span className="material-symbols-outlined text-xs">close</span>
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-[8px] uppercase text-phosphor/40">Designation</div>
                        <div className="text-xs text-phosphor font-headline">{selectedStar.name || `STAR_${data.name.slice(0,3)}_${selectedStarIndex}`}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-[8px] uppercase text-phosphor/40">Magnitude</div>
                          <div className="text-xs text-phosphor font-headline">{(Math.random() * 5 + 1).toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-[8px] uppercase text-phosphor/40">Class</div>
                          <div className="text-xs text-phosphor font-headline">{['O', 'B', 'A', 'F', 'G', 'K', 'M'][selectedStarIndex % 7]}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-[8px] uppercase text-phosphor/40">Coordinates</div>
                        <div className="text-[10px] text-phosphor font-mono">RA: {starToRA(selectedStar.x)} / DEC: {starToDec(selectedStar.y)}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="absolute top-2 left-2 font-headline text-[10px] text-phosphor/50">Y_AXIS_V.992</div>
                <div className="absolute bottom-2 right-2 font-headline text-[10px] text-phosphor/50">X_AXIS_H.104</div>
              </div>
            </div>
          </div>

          {/* Export Button */}
          <button 
            onClick={() => setShowExport(true)}
            className="w-full px-6 py-3 border border-phosphor/40 text-phosphor font-headline text-xs uppercase hover:bg-phosphor/10 transition-all flex items-center justify-center gap-2 group"
          >
            <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">download</span>
            Export to Card
          </button>

          {/* Metrics 2x2 Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-void-light p-4 border border-phosphor/10">
              <div className="font-headline text-[10px] text-phosphor/40 uppercase mb-2">Signal Integrity</div>
              <div className="font-headline text-2xl text-phosphor">98.4%</div>
            </div>
            <div className="bg-void-light p-4 border border-phosphor/10">
              <div className="font-headline text-[10px] text-phosphor/40 uppercase mb-2">Distance (LY)</div>
              <div className="font-headline text-2xl text-phosphor">{data.distance}</div>
            </div>
            <div className="bg-void-light p-4 border border-phosphor/10">
              <div className="font-headline text-[10px] text-phosphor/40 uppercase mb-2">Observation Window</div>
              <div className="font-headline text-2xl text-phosphor">{data.observationWindow}</div>
            </div>
            <div className="bg-void-light p-4 border border-phosphor/10">
              <div className="font-headline text-[10px] text-phosphor/40 uppercase mb-2">Sky Sector</div>
              <div className="font-headline text-2xl text-phosphor">{data.skySector}</div>
            </div>
          </div>
        </div>

        {/* Right Column: Header & Profile */}
        <div className="col-span-12 md:col-span-5 flex flex-col gap-8">
          {/* Header Section */}
          <div>
            <div className="inline-block px-3 py-1 bg-void-light border-l-4 border-phosphor mb-4 animate-pulse">
              <span className="font-headline text-phosphor text-xs tracking-[0.2em] uppercase glow-text">
                Constellation Identified // EPOCH {currentScanDate}
              </span>
            </div>
            <h2 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter text-phosphor glow-text leading-none uppercase">
              {data.name}
            </h2>
          </div>

          {/* Profile Sections */}
          <div className="flex flex-col gap-4">
            <div className="bg-void-light p-6 border-l border-phosphor/30">
              <h3 className="font-headline text-phosphor text-xl font-bold uppercase mb-4 tracking-tighter flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">info</span>
                Astronomical Profile
              </h3>
              <p className="font-body text-phosphor/60 leading-relaxed text-sm mb-6">
                {data.description}
              </p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-end gap-2">
                  <span className="font-headline text-[10px] uppercase text-phosphor/40">Classification</span>
                  <span className="font-headline text-phosphor text-xs">{data.type}</span>
                </div>
                <div className="flex justify-between items-end gap-2">
                  <span className="font-headline text-[10px] uppercase text-phosphor/40">Visibility Range</span>
                  <span className="font-headline text-phosphor text-xs">{data.visibility}</span>
                </div>
                <div className="flex justify-between items-end gap-2">
                  <span className="font-headline text-[10px] uppercase text-phosphor/40">Stellar Count</span>
                  <span className="font-headline text-phosphor text-xs">{data.stars.length} Main Stars</span>
                </div>
              </div>
            </div>

            <div className="bg-void-light p-6 border-l border-phosphor/30">
              <h3 className="font-headline text-phosphor text-xl font-bold uppercase mb-4 tracking-tighter flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">monitoring</span>
                Observation Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-end gap-2">
                  <span className="font-headline text-[10px] uppercase text-phosphor/40">Luminosity index</span>
                  <span className="font-headline text-phosphor text-xs">{data.spectralData.luminosity}</span>
                </div>
                <div className="flex justify-between items-end gap-2">
                  <span className="font-headline text-[10px] uppercase text-phosphor/40">Nebula Density</span>
                  <span className="font-headline text-phosphor text-xs">{data.spectralData.nebulaDensity}</span>
                </div>
                <div className="flex justify-between items-end gap-2">
                  <span className="font-headline text-[10px] uppercase text-phosphor/40">Signal Drift</span>
                  <span className="font-headline text-phosphor text-xs">{data.spectralData.signalDrift}</span>
                </div>
              </div>
            </div>

            <div className="bg-void-light p-6 border-l border-phosphor/30">
              <h3 className="font-headline text-phosphor text-xl font-bold uppercase mb-4 tracking-tighter flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">history_edu</span>
                Mythological Origin
              </h3>
              <p className="font-body text-phosphor/60 leading-relaxed text-sm">
                {data.mythology}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
