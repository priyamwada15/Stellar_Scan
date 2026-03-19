import React from 'react';

export const Header: React.FC<{ username: string; onSettingsClick?: () => void }> = ({ username, onSettingsClick }) => {
  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-void/95 backdrop-blur-sm border-b border-phosphor/20 shadow-[0_0_15px_rgba(0,255,65,0.1)]">
      <div className="flex items-center gap-4">
        <h1 className="font-headline text-xl font-bold text-phosphor glow-text tracking-widest uppercase">
          STELLAR SCAN
        </h1>
      </div>
      <div className="flex items-center gap-6">
        <span className="font-headline uppercase tracking-widest text-sm text-phosphor hidden sm:inline">
          LOGGED_IN: {username}
        </span>
        <span 
          onClick={onSettingsClick}
          className="material-symbols-outlined text-phosphor hover:bg-phosphor/10 transition-all duration-100 p-1 cursor-pointer"
        >
          settings
        </span>
      </div>
    </header>
  );
};

export const Footer: React.FC<{ activeTab: string; onTabChange: (tab: string) => void }> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 pb-safe px-2 bg-void/95 border-t border-phosphor/30 bg-gradient-to-t from-phosphor/5 to-transparent">
      <button 
        onClick={() => onTabChange('SCANNER')}
        className={`flex flex-col items-center justify-center px-4 sm:px-8 py-2 transition-all ${activeTab === 'SCANNER' ? 'bg-phosphor text-void scale-105 ring-1 ring-phosphor' : 'text-phosphor/50 hover:text-phosphor'}`}
      >
        <span className="material-symbols-outlined mb-1">radar</span>
        <span className="font-headline text-[10px] tracking-tighter uppercase font-bold">SCANNER</span>
      </button>

      <button 
        onClick={() => onTabChange('ARCHIVES')}
        className={`flex flex-col items-center justify-center px-6 py-1 transition-all group ${activeTab === 'ARCHIVES' ? 'text-phosphor' : 'text-phosphor/50 hover:text-phosphor'}`}
      >
        <span className="material-symbols-outlined mb-1">inventory_2</span>
        <span className="font-headline text-[10px] tracking-tighter uppercase">ARCHIVES</span>
      </button>
    </nav>
  );
};
