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

  const getTypeCode = (type: string) => {
    if (!type) return 'SOL';
    switch (type.toLowerCase()) {
      case 'major': return 'MAJ';
      case 'minor': return 'MIN';
      case 'nebula': return 'NEB';
      default: return 'SOL';
    }
  };

  return (
    <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
      <section className="mb-8 md:mb-12 pl-4 md:pl-6">
        <p className="font-body text-phosphor text-label tracking-widest uppercase mb-2">Temporal Archives / History</p>
        <h2 className="font-headline text-display font-extrabold text-phosphor uppercase tracking-tighter leading-none">
          Search <span className="text-phosphor/75">History</span>
        </h2>
        <p className="mt-4 max-w-2xl text-phosphor/70 font-body text-body leading-relaxed">
          Every scan here matched a date and location against real sky positions to find the dominant constellation. Revisit past results below.
        </p>
      </section>

      <div className="mb-12">
        <div className="bg-void-dark p-1 flex items-center group focus-within:ring-1 focus-within:ring-phosphor transition-all">
          <span className="font-body text-phosphor mx-4 text-heading">&gt;</span>
          <input
            className="w-full bg-transparent border-none focus:ring-0 font-body text-phosphor placeholder:text-phosphor/30 uppercase tracking-widest text-body-sm h-14"
            placeholder="Filter History" 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-phosphor/20">
          <p className="font-body text-body-sm text-phosphor/55 uppercase tracking-widest">[ No scan history detected ]</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-px bg-phosphor/10 overflow-hidden">
          <div className="hidden md:grid grid-cols-12 bg-void-light px-6 py-3 border-b border-phosphor/20">
            <div className="col-span-1 font-body text-label text-phosphor/50 uppercase">ID</div>
            <div className="col-span-4 font-body text-label text-phosphor/50 uppercase">CONSTELLATION</div>
            <div className="col-span-3 font-body text-label text-phosphor/50 uppercase">PRIMARY STAR</div>
            <div className="col-span-2 font-body text-label text-phosphor/50 uppercase">SECTOR</div>
            <div className="col-span-2 font-body text-label text-phosphor/50 uppercase">VISIBILITY</div>
          </div>

          {filteredItems.map((item, i) => (
            <div 
              key={item.id} 
              onClick={() => onSelect(item)}
              className="grid grid-cols-1 md:grid-cols-12 bg-void px-6 py-6 items-center hover:bg-void-light transition-colors cursor-pointer"
            >
              <div className="col-span-1 font-body text-body-sm text-phosphor/55 mb-2 md:mb-0">{String(i + 1).padStart(3, '0')}</div>
              <div className="col-span-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-void-light border border-phosphor/20 flex items-center justify-center">
                  <span className="font-body text-label text-phosphor tracking-widest">{getTypeCode(item.type)}</span>
                </div>
                <div>
                  <h3 className="font-body text-heading text-phosphor font-bold tracking-tight uppercase">{item.name}</h3>
                  <p className="font-body text-label text-phosphor/75">{item.latinName}</p>
                </div>
              </div>
              <div className="col-span-3 mt-4 md:mt-0">
                <span className="font-body text-body-sm text-phosphor">{item.stars[0]?.name || 'Unknown'}</span>
              </div>
              <div className="col-span-2 font-body text-body-sm text-phosphor/75 mt-2 md:mt-0">{item.skySector || 'N/A'}</div>
              <div className="col-span-2 font-body text-body-sm text-phosphor/75 mt-2 md:mt-0">{item.visibility || 'Optimal'}</div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};
