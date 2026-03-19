import React, { useState, useEffect } from 'react';
import { Header, Footer } from './components/Layout';
import { BootScreen } from './components/BootScreen';
import { ScannerInput } from './components/ScannerInput';
import { ConstellationDetail } from './components/ConstellationDetail';
import { Archives } from './components/Archives';
import { PixelLoader } from './components/PixelLoader';
import { AppScreen, Constellation } from './types';
import { getConstellationData } from './services/geminiService';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('BOOT');
  const [activeTab, setActiveTab] = useState('SCANNER');
  const [constellation, setConstellation] = useState<Constellation | null>(null);
  const [scanDate, setScanDate] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
  });
  const [archiveItems, setArchiveItems] = useState<Constellation[]>(() => {
    const saved = localStorage.getItem('phosphor_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [crtEnabled, setCrtEnabled] = useState(true);
  const [username, setUsername] = useState(() => {
    const saved = localStorage.getItem('phosphor_username');
    if (saved) return saved;
    return generateRandomUsername();
  });

  useEffect(() => {
    localStorage.setItem('phosphor_username', username);
  }, [username]);

  function generateRandomUsername() {
    const spaceTerms = ["Nova", "Quasar", "Pulsar", "Nebula", "Void", "Orion", "Lyra", "Draco", "Cygnus", "Zenith", "Nadir", "Astro", "Cosmo"];
    const adjectives = ["Radiant", "Silent", "Ancient", "Frozen", "Burning", "Spectral", "Obsidian", "Phosphor", "Voidborn", "Starcrossed"];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const term = spaceTerms[Math.floor(Math.random() * spaceTerms.length)];
    const num = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${adj}_${term}_${num}`.toUpperCase();
  }

  useEffect(() => {
    localStorage.setItem('phosphor_history', JSON.stringify(archiveItems));
  }, [archiveItems]);

  const handleScan = async (date: string) => {
    setLoading(true);
    setScreen('SCANNING');
    setScanDate(date);
    try {
      const data = await getConstellationData(`Constellation visible on ${date}`);
      setConstellation(data);
      setArchiveItems(prev => {
        // Avoid duplicates by ID if possible, or just prepend
        const exists = prev.find(item => item.id === data.id);
        if (exists) return prev;
        return [data, ...prev].slice(0, 50); // Keep last 50
      });
      setScreen('DETAIL');
    } catch (error) {
      console.error(error);
      setScreen('SCANNER_INPUT');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'SCANNER') {
      setScreen('SCANNER_INPUT');
    } else if (tab === 'ARCHIVES') {
      setScreen('ARCHIVES');
    }
  };

  const renderScreen = () => {
    switch (screen) {
      case 'BOOT':
        return <BootScreen onComplete={() => setScreen('SCANNER_INPUT')} />;
      case 'SCANNER_INPUT':
        return <ScannerInput onScan={handleScan} />;
      case 'SCANNING':
        return (
          <div className="flex flex-col items-center justify-center h-screen bg-void">
            <PixelLoader />
            <h2 className="font-headline text-2xl text-phosphor glow-text animate-pulse">DECRYPTING_TEMPORAL_DATA...</h2>
          </div>
        );
      case 'DETAIL':
        return constellation ? <ConstellationDetail data={constellation} scanDate={scanDate} /> : null;
      case 'ARCHIVES':
        return <Archives items={archiveItems} onSelect={(c) => { setConstellation(c); setScreen('DETAIL'); }} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative">
      {crtEnabled && <div className="crt-overlay" />}
      {screen !== 'BOOT' && <Header username={username} onSettingsClick={() => setShowSettings(true)} />}
      {renderScreen()}
      {screen !== 'BOOT' && <Footer activeTab={activeTab} onTabChange={handleTabChange} />}
      
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-void/80 backdrop-blur-md" onClick={() => setShowSettings(false)}></div>
          <div className="relative bg-void-light border border-phosphor/30 p-8 max-w-md w-full shadow-[0_0_30px_rgba(0,255,65,0.1)]">
            <div className="flex justify-between items-center mb-8 border-b border-phosphor/20 pb-4">
              <h2 className="font-headline text-2xl text-phosphor uppercase tracking-tighter">System Settings</h2>
              <button onClick={() => setShowSettings(false)} className="material-symbols-outlined text-phosphor hover:bg-phosphor/10 p-1">close</button>
            </div>
            
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-headline text-phosphor text-sm uppercase tracking-widest">Username</p>
                  <p className="text-[10px] text-phosphor/40 uppercase">Current Identity: {username}</p>
                </div>
                <button 
                  onClick={() => setUsername(generateRandomUsername())}
                  className="px-4 py-2 border border-phosphor/30 text-phosphor font-headline text-[10px] uppercase hover:bg-phosphor/10 transition-all"
                >
                  Regenerate
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="font-headline text-phosphor text-sm uppercase tracking-widest text-red-500">Clear History</p>
                  <p className="text-[10px] text-phosphor/40 uppercase">Erase all temporal logs</p>
                </div>
                <button 
                  onClick={() => {
                    if (window.confirm('Erase all temporal data logs? This action cannot be undone.')) {
                      setArchiveItems([]);
                      setShowSettings(false);
                    }
                  }}
                  className="px-4 py-2 border border-red-500/30 text-red-500 font-headline text-[10px] uppercase hover:bg-red-500/10 transition-all"
                >
                  Confirm Erase
                </button>
              </div>
            </div>

            <div className="mt-12 pt-4 border-t border-phosphor/10 text-center">
              <p className="font-headline text-[10px] text-phosphor/30 uppercase tracking-[0.2em]">Stellar Scan // V.8.4.2</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
