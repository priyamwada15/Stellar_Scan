import React, { useState } from 'react';
import { Constellation } from '../types';

export const Archives: React.FC<{ items: Constellation[]; onSelect: (c: Constellation) => void }> = ({ items, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.latinName.toLowerCase().includes(query) ||
      item.stars[0]?.name?.toLowerCase().includes(query)
    );
  });

  const getIcon = (type: string) => {
    if (!type) return <span className="material-symbols-outlined text-phosphor">wb_sunny</span>;
    switch (type.toLowerCase()) {
      case 'major': return <span className="material-symbols-outlined text-phosphor">auto_awesome</span>;
      case 'minor': return <span className="material-symbols-outlined text-phosphor">star</span>;
      case 'nebula': return <span className="material-symbols-outlined text-phosphor">cloud</span>;
      default: return <span className="material-symbols-outlined text-phosphor">wb_sunny</span>;
    }
  };

  return (
    <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
      <section className="mb-8 md:mb-12 border-l-4 border-phosphor pl-4 md:pl-6">
        <p className="font-headline text-phosphor text-[10px] md:text-xs tracking-widest uppercase mb-2">Temporal Archives / History</p>
        <h2 className="font-headline text-4xl md:text-7xl font-extrabold text-phosphor uppercase tracking-tighter leading-none">
          Search <span className="text-phosphor/60">History</span>
        </h2>
        <p className="mt-4 max-w-2xl text-phosphor/70 font-body leading-relaxed">
          Access the log of previous celestial scans. Review temporal data coordinates and stellar configurations retrieved during past observation windows.
        </p>
      </section>

      <div className="mb-12">
        <div className="bg-void-dark p-1 flex items-center group focus-within:ring-1 focus-within:ring-phosphor transition-all">
          <span className="material-symbols-outlined text-phosphor mx-4">search</span>
          <input 
            className="w-full bg-transparent border-none focus:ring-0 font-headline text-phosphor placeholder:text-phosphor/30 uppercase tracking-widest text-sm h-14" 
            placeholder="Filter History" 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-phosphor/20">
          <span className="material-symbols-outlined text-phosphor/30 text-6xl mb-4">history</span>
          <p className="font-headline text-phosphor/40 uppercase tracking-widest">No scan history detected</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-px bg-phosphor/10 overflow-hidden">
          <div className="hidden md:grid grid-cols-12 bg-void-light px-6 py-3 border-b border-phosphor/20">
            <div className="col-span-1 font-headline text-[10px] text-phosphor/50 uppercase">ID</div>
            <div className="col-span-4 font-headline text-[10px] text-phosphor/50 uppercase">CONSTELLATION</div>
            <div className="col-span-3 font-headline text-[10px] text-phosphor/50 uppercase">PRIMARY STAR</div>
            <div className="col-span-2 font-headline text-[10px] text-phosphor/50 uppercase">SECTOR</div>
            <div className="col-span-2 font-headline text-[10px] text-phosphor/50 uppercase">VISIBILITY</div>
          </div>

          {filteredItems.map((item, i) => (
            <div 
              key={item.id} 
              onClick={() => onSelect(item)}
              className="grid grid-cols-1 md:grid-cols-12 bg-void px-6 py-6 items-center hover:bg-void-light transition-colors group relative cursor-pointer"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-phosphor scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
              <div className="col-span-1 font-headline text-phosphor/40 mb-2 md:mb-0">{String(i + 1).padStart(3, '0')}</div>
              <div className="col-span-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-void-light flex items-center justify-center">
                  {getIcon(item.type)}
                </div>
                <div>
                  <h3 className="font-headline text-xl text-phosphor font-bold tracking-tight uppercase">{item.name}</h3>
                  <p className="font-headline text-[10px] text-phosphor/60">{item.latinName}</p>
                </div>
              </div>
              <div className="col-span-3 mt-4 md:mt-0">
                <span className="font-body text-phosphor">{item.stars[0]?.name || 'Unknown'}</span>
              </div>
              <div className="col-span-2 font-headline text-xs text-phosphor/60 mt-2 md:mt-0">{item.skySector || 'N/A'}</div>
              <div className="col-span-2 font-headline text-xs text-phosphor/60 mt-2 md:mt-0">{item.visibility || 'Optimal'}</div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};
