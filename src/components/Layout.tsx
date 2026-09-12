import React from 'react';

export const Header: React.FC<{ username: string; onScanAgain?: () => void }> = ({ username, onScanAgain }) => {
  return (
    <header
      className="fixed top-0 w-full z-50 flex justify-between items-center px-6 bg-void/95 backdrop-blur-sm border-b border-phosphor/20 shadow-[0_0_15px_rgba(46,204,88,0.1)]"
      style={{ height: 'calc(4rem + var(--crt-margin, 0px))', paddingTop: 'var(--crt-margin, 0px)' }}
    >
      <div className="flex items-center gap-4">
        <h1 className="font-headline text-title font-bold text-phosphor glow-text tracking-widest uppercase">
          STELLAR SCAN
        </h1>
      </div>
      <div className="flex items-center gap-6">
        {onScanAgain && (
          <button
            onClick={onScanAgain}
            className="btn btn-outline px-6 py-3 flex items-center justify-center gap-2 flex-shrink-0"
          >
            Scan_Again
          </button>
        )}
      </div>
    </header>
  );
};
