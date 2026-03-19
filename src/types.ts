
export interface Star {
  x: number; // 0-100
  y: number; // 0-100
  size: 'sm' | 'md' | 'lg';
  name?: string;
}

export interface Constellation {
  id: string;
  name: string;
  latinName: string;
  description: string;
  mythology: string;
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
}

export type AppScreen = 'BOOT' | 'SCANNER_INPUT' | 'SCANNING' | 'DETAIL' | 'ARCHIVES';
