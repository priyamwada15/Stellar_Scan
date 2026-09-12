
/**
 * Formats the visibility string from "Visible between latitudes +90° and -65°"
 * to "LAT +90°-LAT -65°"
 */
export const formatVisibility = (visibility: string): string => {
  if (!visibility) return 'N/A';

  // Match the pattern "Visible between latitudes [val1] and [val2]"
  const regex = /Visible between latitudes ([\+\-\d°]+) and ([\+\-\d°]+)/i;
  const match = visibility.match(regex);

  if (match) {
    return `LAT ${match[1]}-LAT ${match[2]}`;
  }

  return visibility;
};

function parseVisibilityBounds(visibility: string): { north: number; south: number } | null {
  const match = visibility.match(/LAT\s*([+-]?\d+)°.*?LAT\s*([+-]?\d+)°/i);
  if (!match) return null;
  return { north: parseInt(match[1], 10), south: parseInt(match[2], 10) };
}

/**
 * Turns a raw "LAT +90°-LAT -65°" range into a plain-language answer to
 * "can I actually see this from where I am" — personalized when the
 * viewer's latitude is known (a fresh scan), general otherwise (e.g. an
 * archived result with no location attached).
 */
export const describeVisibility = (visibility: string, scanLat?: number): string => {
  const bounds = parseVisibilityBounds(visibility);
  if (!bounds) return visibility || 'N/A';
  const { north, south } = bounds;

  if (scanLat !== undefined && Number.isFinite(scanLat)) {
    if (scanLat <= north && scanLat >= south) return 'Visible from your location';
    if (scanLat > north) return 'Not visible from your location — too far north. Best seen closer to the equator or in the Southern Hemisphere.';
    return 'Not visible from your location — too far south. Best seen closer to the equator or in the Northern Hemisphere.';
  }

  if (south <= -80 && north >= 80) return 'Visible from almost anywhere on Earth';
  if (south >= 0) return 'Only visible from the Northern Hemisphere';
  if (north <= 0) return 'Only visible from the Southern Hemisphere';
  if (south <= -40 && north >= 40) return 'Visible from most of Earth, except near the poles';
  return north >= Math.abs(south) ? 'Best seen from the Northern Hemisphere' : 'Best seen from the Southern Hemisphere';
};

// Voyager 1's real heliocentric speed (~17 km/s, the fastest human-made object to
// leave the solar system) is what makes a light-year figure relatable: light itself
// took that many years to arrive, but an actual spacecraft would take vastly longer.
const VOYAGER_SPEED_KM_S = 17;
const LIGHT_SPEED_KM_S = 299792.458;
const YEARS_PER_LIGHT_YEAR_AT_VOYAGER_SPEED = LIGHT_SPEED_KM_S / VOYAGER_SPEED_KM_S; // ~17,636

export const parseLightYears = (distance: string): number | null => {
  const match = distance.match(/([\d,]+(?:\.\d+)?)\s*ly/i);
  if (!match) return null;
  const value = parseFloat(match[1].replace(/,/g, ''));
  return Number.isFinite(value) ? value : null;
};

/** Formats a large year count into something readable, e.g. "23.7 million years". */
export const formatYears = (years: number): string => {
  if (years < 1000) return `~${Math.round(years / 10) * 10} years`;
  if (years < 1_000_000) return `~${Math.round(years / 1000).toLocaleString()},000 years`;
  if (years < 1_000_000_000) return `~${(years / 1_000_000).toFixed(1)} million years`;
  return `~${(years / 1_000_000_000).toFixed(1)} billion years`;
};

/**
 * How long it would actually take to get to something `lightYears` away — not
 * "how long ago the light left" (that's just the light-year count itself), but
 * a genuinely relatable travel time at real spacecraft speed.
 */
export const voyagerTravelTime = (lightYears: number): string =>
  formatYears(lightYears * YEARS_PER_LIGHT_YEAR_AT_VOYAGER_SPEED);
