import React, { useState, useRef } from 'react';

export const ScannerInput: React.FC<{ onScan: (date: string) => void }> = ({ onScan }) => {
  const [date, setDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const dateInputRef = useRef<HTMLInputElement>(null);

  const formatAndSetDate = (value: string) => {
    const digits = value.replace(/\D/g, '');
    let formatted = '';
    if (digits.length > 0) {
      formatted += digits.substring(0, 4);
      if (digits.length > 4) formatted += '-' + digits.substring(4, 6);
      if (digits.length > 6) formatted += '-' + digits.substring(6, 8);
    }
    setDate(formatted.substring(0, 10));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && date.length === 10) {
      onScan(date);
    }
  };

  return (
    <main className="pt-24 pb-24 px-6 md:px-12 max-w-7xl mx-auto min-h-screen flex flex-col">
      <div className="mb-12 flex items-center gap-2 opacity-60">
        <span className="font-headline text-xs uppercase tracking-widest">ROOT</span>
        <span className="material-symbols-outlined text-[12px]">chevron_right</span>
        <span className="font-headline text-xs uppercase tracking-widest">TEMPORAL_ARCHIVES</span>
        <span className="material-symbols-outlined text-[12px]">chevron_right</span>
        <span className="font-headline text-xs uppercase tracking-widest text-phosphor">DATE_QUERY</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 flex-grow">
        <div className="lg:col-span-12 flex flex-col gap-8">
          <section className="bg-void-light p-8 shadow-[0_0_20px_rgba(0,255,65,0.05)] border-l-4 border-phosphor">
            <h2 className="font-headline text-4xl font-extrabold text-phosphor mb-6 tracking-tighter glow-text uppercase">
              INITIALIZE SCANNER
            </h2>
            <p className="font-body text-phosphor/70 mb-8 leading-relaxed max-w-md">
              System requires specific temporal coordinates to initialize data retrieval. Please specify the target synchronization point.
            </p>

            <div className="space-y-6">
              {/* Date Input */}
              <div 
                className="bg-void-dark p-6 font-headline relative group cursor-text"
                onClick={() => dateInputRef.current?.focus()}
              >
                <div className="flex items-start gap-4">
                  <span className="text-phosphor font-bold text-xl">&gt;</span>
                  <div className="flex-grow">
                    <div className="flex items-center gap-x-3 text-2xl uppercase tracking-tighter">
                      <span className="text-phosphor/90">SET_TARGET_DATE</span>
                      <div className="relative flex items-center">
                        <input
                          ref={dateInputRef}
                          type="text"
                          value={date}
                          onChange={(e) => formatAndSetDate(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="absolute inset-0 opacity-0 cursor-text w-full z-10"
                          autoFocus
                        />
                        <span className="text-phosphor underline decoration-2 underline-offset-8 inline-block">
                          {date || 'YYYY-MM-DD'}
                        </span>
                        <span className="w-4 h-8 bg-phosphor cursor-blink ml-1"></span>
                      </div>
                    </div>
                    <div className="mt-4 text-xs text-phosphor/40 font-headline tracking-widest">
                      FORMAT: YYYY-MM-DD | STATUS: {date.length === 10 ? 'READY_FOR_SYNC' : 'AWAITING_INPUT'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-wrap gap-4">
              <button 
                onClick={() => date.length === 10 && onScan(date)}
                disabled={date.length !== 10}
                className={`px-8 py-4 font-headline font-bold uppercase tracking-widest transition-all flex items-center gap-3 ${
                  date.length === 10
                    ? 'bg-phosphor text-void hover:brightness-110 active:scale-95' 
                    : 'bg-phosphor/20 text-phosphor/40 cursor-not-allowed'
                }`}
              >
                <span className="material-symbols-outlined">bolt</span>
                INITIALIZE_SCAN
              </button>
              <button 
                onClick={() => { setDate(''); }}
                className="border border-phosphor/40 text-phosphor px-8 py-4 font-headline font-bold uppercase tracking-widest hover:bg-phosphor/10 transition-all"
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
