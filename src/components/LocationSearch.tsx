import React, { useEffect, useRef, useState } from 'react';
import { ScanLocation } from '../types';

const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

interface GeocodeResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

export const LocationSearch: React.FC<{
  location: ScanLocation | null;
  onChange: (location: ScanLocation | null) => void;
}> = ({ location, onChange }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      setSearching(true);
      try {
        const url = `${GEOCODE_URL}?name=${encodeURIComponent(query.trim())}&count=5&language=en&format=json`;
        const res = await fetch(url);
        const data = await res.json();
        setResults(data.results || []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectResult = (r: GeocodeResult) => {
    onChange({ name: r.name, admin1: r.admin1, country: r.country, lat: r.latitude, lon: r.longitude });
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  const clearLocation = () => {
    onChange(null);
    setQuery('');
    setOpen(true);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className="font-body relative group cursor-text"
        onClick={() => { if (!location) { inputRef.current?.focus(); setOpen(true); } }}
      >
        <div className="flex items-start gap-3 md:gap-4">
          <span className="text-phosphor font-bold text-heading">&gt;</span>
          <div className="flex-grow overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-x-3 text-heading uppercase tracking-tighter">
              <span className="text-phosphor/55 whitespace-nowrap">SET_TARGET_LOCATION</span>
              {location ? (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-phosphor underline decoration-2 underline-offset-4 md:underline-offset-8 truncate">
                    {location.name}{location.country ? `, ${location.country}` : ''}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); clearLocation(); }}
                    className="btn-compact btn-outline px-2 py-0.5 flex-shrink-0 normal-case tracking-normal"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                  onFocus={() => setOpen(true)}
                  placeholder="TYPE_A_CITY_NAME"
                  className="bg-transparent border-none outline-none text-phosphor placeholder:text-phosphor/30 w-full min-w-0"
                  autoComplete="off"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {open && !location && (query.trim().length >= 2) && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-void-dark border border-phosphor/30 z-20 max-h-64 overflow-y-auto">
          {searching && (
            <div className="p-3 text-label text-phosphor/55 uppercase tracking-widest">Searching_</div>
          )}
          {!searching && results.length === 0 && (
            <div className="p-3 text-label text-phosphor/55 uppercase tracking-widest">No matches found</div>
          )}
          {!searching && results.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => selectResult(r)}
              className="w-full text-left p-3 hover:bg-phosphor/10 transition-all border-b border-phosphor/10 last:border-b-0"
            >
              <div className="font-body text-body-sm text-phosphor">{r.name}</div>
              <div className="font-body text-label text-phosphor/55 uppercase">
                {[r.admin1, r.country].filter(Boolean).join(', ') || 'Unknown region'}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
