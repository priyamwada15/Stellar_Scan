
export interface Star {
  x: number; // 0-100
  y: number; // 0-100
  size: 'sm' | 'md' | 'lg';
  name?: string;
  magnitude?: number; // real apparent visual magnitude (lower = brighter)
  spectralClass?: string; // real spectral classification, e.g. "A0V", "M1-2Ia"
  ra?: string; // real right ascension, e.g. "18h 37m"
  dec?: string; // real declination, e.g. "+38° 47'"
  distance?: number; // real distance from Earth, in light-years
  starType?: string; // plain-language description, e.g. "Red supergiant"
}

export interface Constellation {
  id: string;
  name: string;
  latinName: string;
  description: string;
  mythology: string;
  practicalUses?: string;
  culturalSignificance?: string;
  ra: string;
  dec: string;
  magnitude: string;
  distance: string;
  visibility: string;
  type: string;
  stars: Star[];
  connections: [number, number][];
  spectralData: {
    luminosity: string;
    nebulaDensity: string;
    signalDrift: string;
  };
  observationWindow: string;
  skySector: string;
  cloudCover?: { percent: number; label: string } | null;
}

export type AppScreen = 'BOOT' | 'SCANNER_INPUT' | 'SCANNING' | 'DETAIL' | 'ARCHIVES';

export interface ScanLocation {
  name: string;
  admin1?: string;
  country?: string;
  lat: number;
  lon: number;
}
