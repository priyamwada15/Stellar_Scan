import React, { useState, useEffect } from 'react';
import { Meter } from './Meter';

const BOOT_LOGS = [
  "BOOT_SEQUENCE_INITIATED...",
  "system checks",
  "CORE_VOLTAGE: STABLE [1.20V]",
  "MEMORY_BANKS: 64GB_ECC_OK",
  "loading star maps...",
  "ASTROMETRICS_BUFFER: CACHED",
  "initializing orbital tracker...",
  "UPLINK_ESTABLISHED: GEO-STATIONARY_NODE_7",
  "PARALLAX_CALIBRATION: COMPLETE",
  "DECRYPTING_EPHEMERIS_DATA...",
  "NEURAL_ARRAY: ONLINE",
  "THERMAL_SENSORS: NOMINAL",
];

export const BootScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  // Preview aid: visit with `?boot=hold` in the URL to let this screen run
  // through its animation and then just sit there instead of auto-advancing
  // — useful for actually looking at it instead of losing it to SCANNER_INPUT
  // after ~3s. Has no effect without the query param.
  const hold = new URLSearchParams(window.location.search).get('boot') === 'hold';

  useEffect(() => {
    // Total time to onComplete is 5s: 50 ticks * 84ms = 4200ms to fill the
    // bar, plus an 800ms pause = 5000ms exactly. The log reveal is scaled by
    // the same factor (150ms -> 250ms) so all 12 lines still finish well
    // before the bar does (3000ms vs 4200ms, the same ~72% fraction as
    // before), leaving room for the AWAITING_USER_HANDSHAKE_ pulse.
    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < BOOT_LOGS.length) {
        setVisibleLogs(prev => [...prev, BOOT_LOGS[logIndex]]);
        logIndex++;
      } else {
        clearInterval(logInterval);
      }
    }, 250);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          if (!hold) setTimeout(onComplete, 800);
          return 100;
        }
        return prev + 2;
      });
    }, 84);

    return () => {
      clearInterval(logInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete, hold]);

  return (
    <main className="relative z-10 h-screen w-screen flex flex-col p-8 md:p-16 lg:p-24 overflow-hidden bg-void">
      <header className="mb-12 border-b border-phosphor/20 pb-4 flex justify-between items-end">
        <div>
          <h1 className="font-headline font-bold text-title tracking-[0.2em] glow-text uppercase">SYSTEM STATUS</h1>
          <div className="bg-phosphor/10 px-3 py-1 inline-block mt-2">
            <p className="font-body text-label uppercase tracking-[0.2em] text-phosphor">Authorization: Level 4 Required</p>
          </div>
        </div>
        <div className="text-right font-body text-label opacity-40">
          <p>LAT: 40.7128° N</p>
          <p>LNG: 74.0060° W</p>
        </div>
      </header>

      <section className="flex-grow font-mono text-body-sm space-y-2 overflow-hidden flicker">
        {visibleLogs.map((log, i) => (
          <div key={i} className="flex items-center space-x-4">
            <span className="opacity-30">[{String(i * 42).padStart(8, '0')}]</span>
            <span className="text-phosphor">{log}</span>
          </div>
        ))}
        {visibleLogs.length === BOOT_LOGS.length && (
          <div className="flex items-center space-x-4 animate-pulse mt-4">
            <span className="opacity-30">[000.9999]</span>
            <span className="text-phosphor font-bold">AWAITING_USER_HANDSHAKE_</span>
          </div>
        )}
      </section>

      <footer className="mt-auto pt-8 border-t border-phosphor/20">
        <div className="w-full">
          <Meter label="INITIALIZING SESSION..." value={`${progress}%`} percent={progress} />
          <div className="font-body text-label tracking-tighter opacity-60 mt-2">
            <span>TRANSFER RATE: 1.4 GB/S</span>
          </div>
        </div>
      </footer>
    </main>
  );
};
