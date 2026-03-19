import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

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

  useEffect(() => {
    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < BOOT_LOGS.length) {
        setVisibleLogs(prev => [...prev, BOOT_LOGS[logIndex]]);
        logIndex++;
      } else {
        clearInterval(logInterval);
      }
    }, 150);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => {
      clearInterval(logInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <main className="relative z-10 h-screen w-screen flex flex-col p-8 md:p-16 lg:p-24 overflow-hidden bg-void">
      <header className="mb-12 border-b border-phosphor/20 pb-4 flex justify-between items-end">
        <div>
          <h1 className="font-headline font-bold text-2xl tracking-[0.2em] glow-text uppercase">SYSTEM STATUS</h1>
          <p className="font-headline text-xs opacity-60 tracking-widest mt-1">KERNEL V8.4.2-ORBITAL</p>
        </div>
        <div className="text-right font-headline text-xs opacity-40">
          <p>LAT: 40.7128° N</p>
          <p>LNG: 74.0060° W</p>
        </div>
      </header>

      <section className="flex-grow font-mono text-sm md:text-base space-y-2 overflow-hidden flicker">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="material-symbols-outlined text-phosphor">terminal</span>
              <span className="font-headline font-bold text-xl tracking-widest glow-text">INITIALIZING SESSION...</span>
            </div>
            <div className="w-full h-1 bg-void-light relative overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-phosphor shadow-[0_0_10px_#00FF41]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between font-headline text-[10px] tracking-tighter opacity-60">
              <span>TRANSFER RATE: 1.4 GB/S</span>
              <span>STATUS: {progress}% COMPLETE</span>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end space-y-2">
            <div className="bg-phosphor/10 px-3 py-1 border-l-2 border-phosphor">
              <p className="font-headline text-[10px] uppercase tracking-[0.2em] text-phosphor">Authorization: Level 4 Required</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};
