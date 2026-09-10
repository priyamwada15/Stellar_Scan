import React, { useState } from 'react';
import { Constellation } from '../types';
import { ExportCard } from './ExportCard';
import { TwinklingStars } from './TwinklingStars';
import { formatVisibility } from '../utils';
import { WindowPanel } from './WindowPanel';
import { Meter } from './Meter';
import { DitherField } from './DitherField';

const MetricGrid: React.FC<{ data: Constellation }> = ({ data }) => (
  <>
    <div className="bg-void-light p-3 md:p-4 border border-phosphor/10 col-span-2">
      <Meter label="Signal Integrity" value="98.4%" percent={98.4} />
    </div>
    <div className="bg-void-light p-3 md:p-4 border border-phosphor/10">
      <div className="font-body text-label text-phosphor/40 uppercase mb-1 md:mb-2">Distance (LY)</div>
      <div className="font-body text-heading text-phosphor">{data.distance}</div>
    </div>
    <div className="bg-void-light p-3 md:p-4 border border-phosphor/10">
      <div className="font-body text-label text-phosphor/40 uppercase mb-1 md:mb-2">Observation Window</div>
      <div className="font-body text-heading text-phosphor">{data.observationWindow}</div>
    </div>
    <div className="bg-void-light p-3 md:p-4 border border-phosphor/10">
      <div className="font-body text-label text-phosphor/40 uppercase mb-1 md:mb-2">Sky Sector</div>
      <div className="font-body text-heading text-phosphor">{data.skySector}</div>
    </div>
  </>
);

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
        {/* 1. Header Section - Top on mobile, Top-Right on desktop */}
        <div className="lg:col-span-5 order-1 lg:order-2">
          <div className="inline-block px-3 py-1 bg-void-light mb-4 animate-pulse">
            <span className="font-body text-label text-phosphor tracking-[0.2em] uppercase glow-text">
              Constellation Identified // EPOCH {currentScanDate}
            </span>
          </div>
          <div className="mb-6">
            <h2 className="font-headline text-display font-extrabold tracking-tighter text-phosphor glow-text leading-none uppercase mb-2">
              {data.name}
            </h2>
            <div className="flex items-center gap-2">
              <span className="font-body text-label text-phosphor/40 uppercase tracking-widest">Target Designation:</span>
              <span className="font-body text-body-sm text-phosphor uppercase glow-text">{data.latinName}</span>
            </div>
          </div>
        </div>

        {/* 2. Visualizer Section - Second on mobile, Left Column on desktop */}
        <div className="lg:col-span-7 lg:row-span-3 order-2 lg:order-1 flex flex-col gap-6">
          {/* Visualizer */}
          <div className="aspect-square bg-void-dark relative overflow-hidden group border border-phosphor/10">
            <DitherField size={480} cell={8} className="opacity-60" />
            <TwinklingStars count={70} />
            <div className="absolute inset-0 flex items-center justify-center p-4 md:p-12">
              <div className="relative w-full h-full border border-phosphor/20 p-4 md:p-8">
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
                        <span className={`absolute top-4 left-0 text-label font-mono whitespace-nowrap transition-opacity ${selectedStarIndex === i ? 'opacity-100 font-bold' : 'opacity-40'}`}>
                          {star.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Star Data Overlay */}
                {selectedStar && (
                  <div className="absolute top-4 right-4 w-52 z-20 animate-in fade-in slide-in-from-right-4 duration-300">
                    <WindowPanel title="Star Data" className="bg-void-dark/90 backdrop-blur-sm">
                      <button
                        onClick={() => setSelectedStarIndex(null)}
                        className="absolute top-1 right-8 text-phosphor hover:text-white font-body text-label font-bold"
                        aria-label="Close star data"
                      >
                        [X]
                      </button>
                      <div className="space-y-2">
                        <div>
                          <div className="text-label uppercase text-phosphor/40">Designation</div>
                          <div className="text-body-sm text-phosphor font-body">{selectedStar.name || `STAR_${data.name.slice(0,3)}_${selectedStarIndex}`}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-label uppercase text-phosphor/40">Magnitude</div>
                            <div className="text-body-sm text-phosphor font-body">{(Math.random() * 5 + 1).toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-label uppercase text-phosphor/40">Class</div>
                            <div className="text-body-sm text-phosphor font-body">{['O', 'B', 'A', 'F', 'G', 'K', 'M'][selectedStarIndex % 7]}</div>
                          </div>
                        </div>
                        <div>
                          <div className="text-label uppercase text-phosphor/40">Coordinates</div>
                          <div className="text-label text-phosphor font-mono">RA: {starToRA(selectedStar.x)} / DEC: {starToDec(selectedStar.y)}</div>
                        </div>
                      </div>
                    </WindowPanel>
                  </div>
                )}

                <div className="absolute top-2 left-2 font-body text-label text-phosphor/50">Y_AXIS_V.992</div>
                <div className="absolute bottom-2 right-2 font-body text-label text-phosphor/50">X_AXIS_H.104</div>
              </div>
            </div>
          </div>

          {/* Export Button - Third on mobile */}
          <button
            onClick={() => setShowExport(true)}
            className="btn btn-outline w-full px-6 py-3 flex items-center justify-center gap-2 group order-3 lg:order-none"
          >
            Export to Card
          </button>

          {/* Metrics Grid (Desktop) */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            <MetricGrid data={data} />
          </div>
        </div>

        {/* 3. Profile Sections - Reordered for mobile */}
        <div className="lg:col-span-5 order-4 lg:order-3 flex flex-col gap-4">
          <WindowPanel title="Astronomical Profile">
            <p className="font-body text-body-sm text-phosphor/60 leading-relaxed mb-6">
              {data.description}
            </p>

            <div className="space-y-3">
              <div className="flex justify-between items-end gap-2">
                <span className="font-body text-label uppercase text-phosphor/40">Classification</span>
                <span className="font-body text-body-sm text-phosphor">{data.type}</span>
              </div>
              <div className="flex justify-between items-end gap-2">
                <span className="font-body text-label uppercase text-phosphor/40">Visibility Range</span>
                <span className="font-body text-body-sm text-phosphor">{formatVisibility(data.visibility)}</span>
              </div>
              <div className="flex justify-between items-end gap-2">
                <span className="font-body text-label uppercase text-phosphor/40">Stellar Count</span>
                <span className="font-body text-body-sm text-phosphor">{data.stars.length} Main Stars</span>
              </div>
            </div>
          </WindowPanel>
        </div>

        <div className="lg:col-span-5 order-5 lg:order-4 flex flex-col gap-4">
          <WindowPanel title="Observation Metrics">
            <div className="space-y-3">
              <div className="flex justify-between items-end gap-2">
                <span className="font-body text-label uppercase text-phosphor/40">Luminosity index</span>
                <span className="font-body text-body-sm text-phosphor">{data.spectralData.luminosity}</span>
              </div>
              <div className="flex justify-between items-end gap-2">
                <span className="font-body text-label uppercase text-phosphor/40">Nebula Density</span>
                <span className="font-body text-body-sm text-phosphor">{data.spectralData.nebulaDensity}</span>
              </div>
              <div className="flex justify-between items-end gap-2">
                <span className="font-body text-label uppercase text-phosphor/40">Signal Drift</span>
                <span className="font-body text-body-sm text-phosphor">{data.spectralData.signalDrift}</span>
              </div>
            </div>
          </WindowPanel>
        </div>

        <div className="lg:col-span-5 order-6 lg:order-5 flex flex-col gap-4">
          <WindowPanel title="Mythological Origin">
            <p className="font-body text-body-sm text-phosphor/60 leading-relaxed">
              {data.mythology}
            </p>
          </WindowPanel>
        </div>

        {/* Metrics Grid (Mobile Only) */}
        <div className="lg:hidden order-7 grid grid-cols-2 gap-3">
          <MetricGrid data={data} />
        </div>
      </div>
    </main>
  );
};
