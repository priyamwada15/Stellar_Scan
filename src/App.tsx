import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Agentation } from 'agentation';
import { Header, Footer } from './components/Layout';
import { CrtBezel } from './components/CrtBezel';
import { BootScreen } from './components/BootScreen';
import { ScannerInput } from './components/ScannerInput';
import { ConstellationDetail } from './components/ConstellationDetail';
import { Archives } from './components/Archives';
import { PixelLoader } from './components/PixelLoader';
import { AppScreen, Constellation, ScanLocation } from './types';
import { getConstellationData } from './services/geminiService';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('BOOT');
  const [activeTab, setActiveTab] = useState('SCANNER');
  const [constellation, setConstellation] = useState<Constellation | null>(null);
  const [scanDate, setScanDate] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
  });
  const [scanLocation, setScanLocation] = useState<ScanLocation | null>(null);
  const [archiveItems, setArchiveItems] = useState<Constellation[]>(() => {
    const saved = localStorage.getItem('phosphor_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [crtEnabled, setCrtEnabled] = useState(true);
  const [username, setUsername] = useState(() => {
    const saved = localStorage.getItem('phosphor_username');
    if (saved) return saved;
    return generateRandomUsername();
  });

  const [showConfirmErase, setShowConfirmErase] = useState(false);

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
    if (!scanLocation) return;
    setLoading(true);
    setError(null);
    setScreen('SCANNING');
    setScanDate(date);

    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("TEMPORAL_SYNC_TIMEOUT: Connection to core lost.")), 15000)
    );

    try {
      // Ensure the scanning screen is visible for at least 1 second
      const delayPromise = new Promise(resolve => setTimeout(resolve, 1000));

      // Race the API call against the timeout
      const [data] = await Promise.all([
        Promise.race([
          getConstellationData(date, scanLocation.lat, scanLocation.lon),
          timeoutPromise
        ]) as Promise<Constellation>,
        delayPromise
      ]);

      setConstellation(data);
      setArchiveItems(prev => {
        const exists = prev.find(item => item.id === data.id);
        if (exists) return prev;
        return [data, ...prev].slice(0, 50);
      });
      setScreen('DETAIL');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'FAILED_TO_DECRYPT_TEMPORAL_DATA');
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
        return (
          <ScannerInput
            date={scanDate}
            setDate={setScanDate}
            location={scanLocation}
            setLocation={setScanLocation}
            onScan={handleScan}
            error={error}
          />
        );
      case 'SCANNING':
        return (
          <div className="flex flex-col items-center justify-center h-screen bg-void">
            <PixelLoader />
            <h2 className="font-headline text-title text-phosphor glow-text animate-pulse">DECRYPTING_TEMPORAL_DATA...</h2>
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

  const app = (
    <>
      {screen !== 'BOOT' && <Header username={username} onSettingsClick={() => setShowSettings(true)} />}
      {renderScreen()}
      {screen !== 'BOOT' && <Footer activeTab={activeTab} onTabChange={handleTabChange} />}
    </>
  );

  return (
    <div className="min-h-screen relative">
      <Analytics />
      {import.meta.env.DEV && <Agentation />}
      {screen === 'DETAIL' && crtEnabled ? (
        <CrtBezel>{app}</CrtBezel>
      ) : (
        <>
          {crtEnabled && <div className="crt-overlay" />}
          {app}
        </>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-void/80 backdrop-blur-md" onClick={() => setShowSettings(false)}></div>
          <div className="relative bg-void-light border border-phosphor/30 p-8 max-w-md w-full shadow-[0_0_30px_rgba(0,255,65,0.1)]">
            <div className="flex justify-between items-center mb-8 border-b border-phosphor/20 pb-4">
              <h2 className="font-headline text-title text-phosphor uppercase tracking-tighter">System Settings</h2>
              <button onClick={() => setShowSettings(false)} className="btn-compact btn-outline px-2 py-1">[X]</button>
            </div>

            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-body text-phosphor text-body-sm uppercase tracking-widest mb-2">Username</p>
                  <p className="text-label text-phosphor/40 uppercase">{username}</p>
                </div>
                <button
                  onClick={() => setUsername(generateRandomUsername())}
                  className="btn-compact btn-outline w-32 py-2"
                >
                  Regenerate
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="font-body text-danger text-body-sm uppercase tracking-widest mb-2">Clear History</p>
                  <p className="text-label text-phosphor/40 uppercase">Erase all temporal logs</p>
                </div>
                {!showConfirmErase ? (
                  <button
                    onClick={() => setShowConfirmErase(true)}
                    className="btn-compact btn-danger-outline w-32 py-2"
                  >
                    Erase
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setArchiveItems([]);
                        setShowConfirmErase(false);
                        setShowSettings(false);
                      }}
                      className="btn-compact btn-danger px-3 py-2"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setShowConfirmErase(false)}
                      className="btn-compact btn-outline px-3 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-12 pt-4 border-t border-phosphor/10 text-center">
              <p className="font-body text-label text-phosphor/30 uppercase tracking-[0.2em]">Stellar Scan // V.8.4.2</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
