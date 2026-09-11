import React from 'react';

export const Header: React.FC<{ username: string; onSettingsClick?: () => void }> = ({ username, onSettingsClick }) => {
  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-void/95 backdrop-blur-sm border-b border-phosphor/20 shadow-[0_0_15px_rgba(46,204,88,0.1)]">
      <div className="flex items-center gap-4">
        <h1 className="font-headline text-title font-bold text-phosphor glow-text tracking-widest uppercase">
          STELLAR SCAN
        </h1>
      </div>
      <div className="flex items-center gap-6">
        <span
          onClick={onSettingsClick}
          className="btn-compact btn-outline px-2 py-1 cursor-pointer"
        >
          [Config]
        </span>
      </div>
    </header>
  );
};

const FOOTER_TABS = ['SCANNER', 'ARCHIVES'];

export const Footer: React.FC<{ activeTab: string; onTabChange: (tab: string) => void }> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-center items-center gap-10 sm:gap-16 h-16 pb-safe px-2 bg-void/95 backdrop-blur-sm border-t border-phosphor/20">
      {FOOTER_TABS.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`font-body text-label tracking-widest uppercase transition-colors px-3 py-1 ${
              isActive
                ? 'bg-phosphor text-void'
                : 'text-phosphor/55 hover:text-phosphor/70'
            }`}
          >
            {isActive ? `> ${tab}` : tab}
          </button>
        );
      })}
    </nav>
  );
};
