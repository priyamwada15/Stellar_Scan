import React, { useRef } from 'react';
import { ScanLocation } from '../types';
import { LocationSearch } from './LocationSearch';

export const ScannerInput: React.FC<{
  onScan: (date: string) => void;
  error?: string | null;
  date: string;
  setDate: (date: string) => void;
  location: ScanLocation | null;
  setLocation: (location: ScanLocation | null) => void;
}> = ({ onScan, error, date, setDate, location, setLocation }) => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const ready = date.length === 10 && location !== null;

  const formatAndSetDate = (value: string) => {
    const digits = value.replace(/\D/g, '');
    let formatted = '';
    if (digits.length > 0) {
      formatted += digits.substring(0, 4);
      if (digits.length > 4) formatted += '.' + digits.substring(4, 6);
      if (digits.length > 6) formatted += '.' + digits.substring(6, 8);
    }
    setDate(formatted.substring(0, 10));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && ready) {
      onScan(date);
    }
  };

  return (
    <main className="pt-24 pb-24 px-6 md:px-12 max-w-7xl mx-auto min-h-screen flex flex-col">
      <div className="mb-8 flex flex-wrap items-center gap-2 opacity-60">
        <span className="font-body text-label uppercase tracking-widest">ROOT</span>
        <span className="font-body text-label">&gt;</span>
        <span className="font-body text-label uppercase tracking-widest">TEMPORAL_ARCHIVES</span>
        <span className="font-body text-label">&gt;</span>
        <span className="font-body text-label uppercase tracking-widest text-phosphor">DATE_QUERY</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 flex-grow">
        <div className="lg:col-span-12 flex flex-col gap-8">
          <section>
            <h2 className="font-headline text-display font-extrabold text-phosphor mb-4 tracking-tighter glow-text uppercase">
              INITIALIZE SCANNER
            </h2>
            <p className="font-body text-body text-phosphor/70 mb-8 leading-relaxed">
              System cross-references your date and location against real sky positions to identify the dominant constellation. Specify both to sync.
            </p>

            <div className="space-y-6">
              {error && (
                <div className="bg-danger/10 border border-danger/30 p-4 flex items-center gap-3 animate-shake">
                  <span className="font-body text-danger font-bold">[!]</span>
                  <p className="font-body text-label text-danger uppercase tracking-widest">{error}</p>
                </div>
              )}
              {/* Date + Location Input */}
              <div className="bg-void-dark p-4 md:p-6 font-body">
                <div
                  className="relative group cursor-text"
                  onClick={() => dateInputRef.current?.focus()}
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    <span className="text-phosphor font-bold text-heading">&gt;</span>
                    <div className="flex-grow overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-x-3 text-heading uppercase tracking-tighter">
                        <span className="text-phosphor/40 whitespace-nowrap">SET_TARGET_DATE</span>
                        <div className="relative flex items-center min-w-0">
                          <input
                            ref={dateInputRef}
                            type="tel"
                            inputMode="numeric"
                            value={date}
                            onChange={(e) => formatAndSetDate(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="absolute inset-0 opacity-0 cursor-text w-full z-10"
                            autoFocus
                          />
                          <span className="text-phosphor underline decoration-2 underline-offset-4 md:underline-offset-8 inline-block truncate">
                            {date || 'YYYY.MM.DD'}
                          </span>
                          <span className="w-3 h-6 md:w-4 md:h-8 bg-phosphor cursor-blink ml-1 flex-shrink-0"></span>
                        </div>
                      </div>
                      <div className="mt-3 md:mt-4 text-label text-phosphor/40 font-body tracking-widest">
                        FORMAT: YYYY.MM.DD | STATUS: {date.length === 10 ? 'READY_FOR_SYNC' : 'AWAITING_INPUT'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 md:mt-6">
                  <LocationSearch location={location} onChange={setLocation} />
                </div>
              </div>
            </div>

            <div className="mt-8 md:mt-12 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => ready && onScan(date)}
                disabled={!ready}
                className={`btn w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 font-bold flex items-center justify-center gap-3 ${
                  ready ? 'btn-primary' : 'btn-disabled'
                }`}
              >
                INITIALIZE_SCAN
              </button>
              <button
                onClick={() => { setDate(''); setLocation(null); }}
                className="btn btn-outline w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 font-bold text-center"
              >
                RESET_INPUT_
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};
