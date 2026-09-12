import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Agentation } from 'agentation';
import { Header } from './components/Layout';
import { CrtBezel } from './components/CrtBezel';
import { BootScreen } from './components/BootScreen';
import { ScannerInput } from './components/ScannerInput';
import { ConstellationDetail } from './components/ConstellationDetail';
import { PixelLoader } from './components/PixelLoader';
import { AppScreen, Constellation, ScanLocation } from './types';
import { getConstellationData } from './services/geminiService';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('BOOT');
  const [constellation, setConstellation] = useState<Constellation | null>(null);
  const [scanDate, setScanDate] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
  });
  const [scanLocation, setScanLocation] = useState<ScanLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [crtEnabled, setCrtEnabled] = useState(true);
  const [username] = useState(() => {
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
      setScreen('DETAIL');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'FAILED_TO_DECRYPT_TEMPORAL_DATA');
      setScreen('SCANNER_INPUT');
    } finally {
      setLoading(false);
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
        return constellation ? <ConstellationDetail data={constellation} scanDate={scanDate} scanLocation={scanLocation ?? undefined} /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative">
      <Analytics />
      {import.meta.env.DEV && <Agentation />}
      {/* CrtBezel is a fixed, viewport-covering decorative overlay — it takes
          no children and never wraps the app's real content, so it can't
          break `position: fixed` descendants (Header) the way an
          ancestor clip-path/filter would. The real content scrolls under it
          like a genuine screen. */}
      {crtEnabled && <CrtBezel />}
      {screen !== 'BOOT' && (
        <Header
          username={username}
          onScanAgain={screen === 'SCANNER_INPUT' ? undefined : () => setScreen('SCANNER_INPUT')}
        />
      )}
      {renderScreen()}
    </div>
  );
}
