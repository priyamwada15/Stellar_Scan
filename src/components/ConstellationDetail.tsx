import React, { useState } from 'react';
import { useDialKit } from 'dialkit';
import { Constellation } from '../types';
import { ExportCard } from './ExportCard';
import { TwinklingStars } from './TwinklingStars';
import { describeVisibility, parseLightYears, voyagerTravelTime } from '../utils';
import { WindowPanel } from './WindowPanel';
import { DitherField } from './DitherField';
import { Definable } from './Definable';

const CLASSIFICATION_DEFINITIONS: Record<string, string> = {
  Equatorial: 'Straddles the celestial equator, making it visible from most places on Earth.',
  Zodiacal: "Lies along the ecliptic — the sun's apparent yearly path — one of the twelve zodiac constellations.",
  Northern: "Sits in the sky's northern half, closer to the North Celestial Pole.",
  Southern: "Sits in the sky's southern half, closer to the South Celestial Pole.",
};

const METRIC_DEFINITIONS: Record<string, string> = {
  'Luminosity Index': 'How many times more light the brightest star gives off than the Sun (L☉ = one solar luminosity).',
  'Nebula Density': "An estimate of how much interstellar gas and dust surrounds this region of sky.",
  'Signal Drift': "The star pattern's apparent position, changing by this many degrees per year due to real motion through space (proper motion).",
};

const METRIC_LABEL_CLASSES = 'font-body uppercase text-phosphor/55 underline decoration-dotted decoration-phosphor/40 underline-offset-2 hover:bg-phosphor/10';

export const ConstellationDetail: React.FC<{ data: Constellation; scanDate?: string; scanLat?: number }> = ({ data, scanDate, scanLat }) => {
  const [showExport, setShowExport] = useState(false);
  const [selectedStarIndex, setSelectedStarIndex] = useState<number | null>(null);

  const currentScanDate = scanDate || (() => {
    const now = new Date();
    return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
  })();

  const selectedStar = selectedStarIndex !== null ? data.stars[selectedStarIndex] : null;

  let brightestStar: Constellation['stars'][number] | null = null;
  for (const star of data.stars) {
    if (star.magnitude === undefined) continue;
    if (brightestStar === null || brightestStar.magnitude === undefined || star.magnitude < brightestStar.magnitude) {
      brightestStar = star;
    }
  }

  const constellationLightYears = parseLightYears(data.distance);

  const panelFonts = useDialKit('Panel Fonts', {
    title: [12, 6, 20],
    label: [12, 6, 16],
    value: [12, 8, 20],
  });

  return (
    <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
      {showExport && <ExportCard data={data} scanDate={currentScanDate} onClose={() => setShowExport(false)} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Visualizer column — the outer wrapper stretches to the full row height (matching
            the taller profile column) so the inner sticky element has an unambiguous
            containing block to stick within; sticky directly on a grid item whose own box
            is shorter than its row track causes a visible snap when it runs out of room. */}
        <div className="lg:col-span-7 lg:self-stretch">
          <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:items-center">
            <div className="aspect-square bg-void-dark relative overflow-hidden group border border-phosphor/10 lg:w-[min(100%,calc(100vh-12rem-var(--crt-margin,0px)))]">
              <DitherField size={480} cell={8} className="opacity-10" />
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
                            className="text-phosphor/50"
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
                        className={`absolute bg-phosphor shadow-[0_0_10px_#2ECC58] rounded-full cursor-pointer transition-all duration-300 ${
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
                      <WindowPanel
                        title="Star Data"
                        className="bg-void-dark/90 backdrop-blur-sm"
                        onClose={() => setSelectedStarIndex(null)}
                        titleFontSize={panelFonts.title}
                      >
                        <div className="space-y-2">
                          <div>
                            <div className="uppercase text-phosphor/55" style={{ fontSize: panelFonts.label }}>Designation</div>
                            <div className="text-phosphor font-body" style={{ fontSize: panelFonts.value }}>{selectedStar.name || `STAR_${data.name.slice(0,3)}_${selectedStarIndex}`}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="uppercase text-phosphor/55" style={{ fontSize: panelFonts.label }}>Magnitude</div>
                              <div className="text-phosphor font-body" style={{ fontSize: panelFonts.value }}>
                                {selectedStar.magnitude !== undefined ? selectedStar.magnitude.toFixed(2) : 'N/A'}
                              </div>
                            </div>
                            <div>
                              <div className="uppercase text-phosphor/55" style={{ fontSize: panelFonts.label }}>Class</div>
                              <div className="text-phosphor font-body" style={{ fontSize: panelFonts.value }}>{selectedStar.spectralClass || 'N/A'}</div>
                            </div>
                          </div>
                          {selectedStar.starType && (
                            <div>
                              <div className="uppercase text-phosphor/55" style={{ fontSize: panelFonts.label }}>Star Type</div>
                              <div className="text-phosphor font-body" style={{ fontSize: panelFonts.value }}>{selectedStar.starType}</div>
                            </div>
                          )}
                          {selectedStar.distance !== undefined && (
                            <div>
                              <div className="uppercase text-phosphor/55" style={{ fontSize: panelFonts.label }}>Distance</div>
                              <div className="text-phosphor font-body" style={{ fontSize: panelFonts.value }}>{selectedStar.distance.toLocaleString()} LY</div>
                              <div className="text-phosphor/55" style={{ fontSize: panelFonts.label }}>{voyagerTravelTime(selectedStar.distance)} by spacecraft</div>
                            </div>
                          )}
                        </div>
                      </WindowPanel>
                    </div>
                  )}

                  <div className="absolute top-2 left-2 font-body text-label text-phosphor/50">Y_AXIS_V.992</div>
                  <div className="absolute bottom-2 right-2 font-body text-label text-phosphor/50">X_AXIS_H.104</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Header, metrics, and profile panels column */}
        <div className="lg:col-span-5 flex flex-col gap-10">
          <div>
            <div className="inline-block pr-3 py-1 bg-void-light mb-4 animate-pulse">
              <span className="font-body text-label text-phosphor tracking-[0.2em] uppercase glow-text">
                Constellation Identified // EPOCH {currentScanDate}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-headline text-display font-extrabold tracking-tighter text-phosphor glow-text leading-none uppercase">
                {data.name}
              </h2>
              <button
                onClick={() => setShowExport(true)}
                className="btn btn-outline px-6 py-3 flex items-center justify-center gap-2 flex-shrink-0"
              >
                Export to Card
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-void-light p-3 md:p-4 border border-phosphor/10">
              <div className="font-body text-label text-phosphor/55 uppercase mb-1 md:mb-2">Distance</div>
              <div className="font-body text-heading text-phosphor">
                {constellationLightYears !== null ? `${constellationLightYears.toLocaleString()} LY` : data.distance}
              </div>
              {constellationLightYears !== null && (
                <div className="font-body text-label text-phosphor/55 mt-1">
                  {voyagerTravelTime(constellationLightYears)} by spacecraft
                </div>
              )}
            </div>
            <div className="bg-void-light p-3 md:p-4 border border-phosphor/10">
              <div className="font-body text-label text-phosphor/55 uppercase mb-1 md:mb-2">Cloud Cover Tonight</div>
              <div className="font-body text-heading text-phosphor">
                {data.cloudCover ? `${data.cloudCover.percent}%` : 'N/A'}
              </div>
              {data.cloudCover && (
                <div className="font-body text-label text-phosphor/55 mt-1">{data.cloudCover.label}</div>
              )}
              {!data.cloudCover && (
                <div className="font-body text-label text-phosphor/55 mt-1">Outside forecast range</div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <WindowPanel title="Astronomical Profile" titleFontSize={panelFonts.title}>
              <p className="font-body text-body-sm text-phosphor/75 leading-relaxed mb-6">
                {data.description}
              </p>

              <div className="space-y-3">
                <div className="flex justify-between items-end gap-2">
                  <span className="font-body uppercase text-phosphor/55" style={{ fontSize: panelFonts.label }}>Classification</span>
                  <Definable
                    label={data.type}
                    definition={CLASSIFICATION_DEFINITIONS[data.type] || data.type}
                    style={{ fontSize: panelFonts.value }}
                  />
                </div>
                <div className="flex justify-between items-end gap-2">
                  <span className="font-body uppercase text-phosphor/55" style={{ fontSize: panelFonts.label }}>Visibility</span>
                  <span className="font-body text-phosphor text-right" style={{ fontSize: panelFonts.value }}>{describeVisibility(data.visibility, scanLat)}</span>
                </div>
                <div className="flex justify-between items-end gap-2">
                  <span className="font-body uppercase text-phosphor/55" style={{ fontSize: panelFonts.label }}>Best Seen</span>
                  <span className="font-body text-phosphor" style={{ fontSize: panelFonts.value }}>{data.observationWindow}</span>
                </div>
                <div className="flex justify-between items-end gap-2">
                  <span className="font-body uppercase text-phosphor/55" style={{ fontSize: panelFonts.label }}>Stellar Count</span>
                  <span className="font-body text-phosphor" style={{ fontSize: panelFonts.value }}>{data.stars.length} Main Stars</span>
                </div>
                {brightestStar && (
                  <div className="flex justify-between items-end gap-2">
                    <span className="font-body uppercase text-phosphor/55" style={{ fontSize: panelFonts.label }}>Brightest Star</span>
                    <span className="font-body text-phosphor" style={{ fontSize: panelFonts.value }}>
                      {brightestStar.name} (mag {brightestStar.magnitude?.toFixed(2)})
                    </span>
                  </div>
                )}
              </div>
            </WindowPanel>

            <WindowPanel title="Observation Metrics" titleFontSize={panelFonts.title}>
              <div className="space-y-3">
                <div className="flex justify-between items-end gap-2">
                  <Definable
                    label="Luminosity Index"
                    definition={METRIC_DEFINITIONS['Luminosity Index']}
                    className={METRIC_LABEL_CLASSES}
                    style={{ fontSize: panelFonts.label }}
                  />
                  <span className="font-body text-phosphor" style={{ fontSize: panelFonts.value }}>{data.spectralData.luminosity}</span>
                </div>
                <div className="flex justify-between items-end gap-2">
                  <Definable
                    label="Nebula Density"
                    definition={METRIC_DEFINITIONS['Nebula Density']}
                    className={METRIC_LABEL_CLASSES}
                    style={{ fontSize: panelFonts.label }}
                  />
                  <span className="font-body text-phosphor" style={{ fontSize: panelFonts.value }}>{data.spectralData.nebulaDensity}</span>
                </div>
                <div className="flex justify-between items-end gap-2">
                  <Definable
                    label="Signal Drift"
                    definition={METRIC_DEFINITIONS['Signal Drift']}
                    className={METRIC_LABEL_CLASSES}
                    style={{ fontSize: panelFonts.label }}
                  />
                  <span className="font-body text-phosphor" style={{ fontSize: panelFonts.value }}>{data.spectralData.signalDrift}</span>
                </div>
              </div>
            </WindowPanel>

            <WindowPanel title="Mythological Origin" titleFontSize={panelFonts.title}>
              <p className="font-body text-body-sm text-phosphor/75 leading-relaxed">
                {data.mythology}
              </p>
            </WindowPanel>

            {data.practicalUses && (
              <WindowPanel title="Practical Uses" titleFontSize={panelFonts.title}>
                <p className="font-body text-body-sm text-phosphor/75 leading-relaxed">
                  {data.practicalUses}
                </p>
              </WindowPanel>
            )}

            {data.culturalSignificance && (
              <WindowPanel title="Cultural Significance" titleFontSize={panelFonts.title}>
                <p className="font-body text-body-sm text-phosphor/75 leading-relaxed">
                  {data.culturalSignificance}
                </p>
              </WindowPanel>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
