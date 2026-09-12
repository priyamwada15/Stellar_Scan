import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createRequire } from "module";
import db from "../src/constellation-db.json" with { type: "json" };

// astronomy-engine ships both a CJS build (astronomy.js) and an ESM build
// (esm/astronomy.js), selected via package.json's "exports" require/import
// conditions. Vercel's Node.js runtime executes this function as CommonJS
// regardless of the package's own "type": "module", so a normal `import`
// here resolves to the ESM build (the file present in the deployment) but
// then gets loaded through Node's CJS loader anyway — which fails on its
// `export` syntax (ERR unexpected token 'export'). Requiring it explicitly
// forces the CJS build, which is safe to load either way.
const require = createRequire(import.meta.url);
const Astronomy = require("astronomy-engine") as typeof import("astronomy-engine");

export interface ConstellationEntry {
  id: string;
  name: string;
  latinName: string;
  type: string;
  description: string;
  mythology: string;
  practicalUses?: string;
  culturalSignificance?: string;
  ra: string;
  dec: string;
  magnitude: string;
  distance: string;
  visibility: string;
  peakMonth: number;
  peakDay: number;
  stars: {
    x: number;
    y: number;
    size: string;
    name?: string;
    magnitude?: number;
    spectralClass?: string;
    ra?: string;
    dec?: string;
    distance?: number;
    starType?: string;
  }[];
  connections: number[][];
  spectralData: { luminosity: string; nebulaDensity: string; signalDrift: string };
  observationWindow: string;
  skySector: string;
}

const constellations = db.constellations as ConstellationEntry[];

// "5h 30m" -> 5.5 (decimal hours)
function parseRAHours(ra: string): number {
  const m = ra.match(/(-?\d+(?:\.\d+)?)h\s*(?:(\d+(?:\.\d+)?)m)?/);
  if (!m) return 0;
  const hours = parseFloat(m[1]);
  const minutes = m[2] ? parseFloat(m[2]) : 0;
  return hours + minutes / 60;
}

// "+5°" / "-60°" -> decimal degrees
function parseDecDegrees(dec: string): number {
  const m = dec.match(/(-?\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : 0;
}

function parseMagnitude(mag: string): number {
  const value = parseFloat(mag);
  return Number.isFinite(value) ? value : 99;
}

export function parseTargetDate(dateStr: string): { year: number; month: number; day: number } | null {
  const match = dateStr.match(/(\d{4})[.\-/](\d{2})[.\-/](\d{2})/);
  if (!match) return null;
  return { year: parseInt(match[1], 10), month: parseInt(match[2], 10), day: parseInt(match[3], 10) };
}

// Local solar midnight for the given date/longitude, expressed as a UTC Date.
// Avoids depending on an IANA timezone database — longitude alone gives local
// mean solar time, which is the astronomically correct reference for "is it night here".
function localMidnightUTC(year: number, month: number, day: number, lon: number): Date {
  const baseUTC = Date.UTC(year, month - 1, day, 0, 0, 0);
  const offsetMs = (lon / 15) * 60 * 60 * 1000;
  return new Date(baseUTC - offsetMs);
}

const MIN_ALTITUDE_DEG = 10; // below this, atmospheric haze/horizon obstruction make it effectively not "visible"

// A mild, physically-real atmospheric-extinction penalty (~0.28 mag per airmass) turned out
// not to be nearly enough: a handful of intrinsically brilliant stars (Vega, Sirius, Arcturus,
// Alpha Centauri...) are bright enough, and high-declination enough, to sit comfortably above
// 30-40° altitude across an ENTIRE hemisphere for much of the year. The result was a selection
// that varied by hemisphere but was otherwise flat — e.g. every northern-hemisphere location
// from the equator to the Arctic Circle got the same answer on a given date, which is the
// underlying version of the "Jabalpur and Bloomington show the same thing" complaint.
//
// This coefficient is tuned well past real extinction physics specifically to fix that: it
// makes how close something sits to YOUR zenith outweigh small differences in catalog
// brightness, so the result tracks the viewer's actual latitude instead of just "brightest
// object anywhere above the horizon." Verified against a spread of latitudes (equator to
// Reykjavik, both hemispheres) and months: this produces genuinely different, still-naked-eye
// (worst case ~mag 2.4) results per location rather than one answer per hemisphere.
const PROMINENCE_MAG_PER_DEGREE = 0.08;

function prominenceScore(catalogMagnitude: number, altitudeDeg: number): number {
  return catalogMagnitude - PROMINENCE_MAG_PER_DEGREE * (altitudeDeg - MIN_ALTITUDE_DEG);
}

/**
 * The real second interpretation of "constellation of the day": for the given date and
 * location, which constellation is actually above the horizon at local night and brightest.
 * Falls back to peak-day proximity only if no location is given or nothing clears the
 * altitude threshold (e.g. a date/location where it's effectively daytime everywhere relevant).
 */
export function getVisibleConstellation(dateStr: string, lat?: number, lon?: number): ConstellationEntry {
  const parsed = parseTargetDate(dateStr);
  if (!parsed || lat === undefined || lon === undefined || !Number.isFinite(lat) || !Number.isFinite(lon)) {
    return getConstellationByPeakDay(dateStr);
  }

  const observeTime = localMidnightUTC(parsed.year, parsed.month, parsed.day, lon);
  const observer = new Astronomy.Observer(lat, lon, 0);

  let best: ConstellationEntry | null = null;
  let bestScore = Infinity;
  let highestAltitude: ConstellationEntry = constellations[0];
  let highestAltitudeValue = -Infinity;

  for (const c of constellations) {
    const ra = parseRAHours(c.ra);
    const dec = parseDecDegrees(c.dec);
    const { altitude } = Astronomy.Horizon(observeTime, observer, ra, dec, "normal");

    if (altitude > highestAltitudeValue) {
      highestAltitudeValue = altitude;
      highestAltitude = c;
    }

    if (altitude >= MIN_ALTITUDE_DEG) {
      const score = prominenceScore(parseMagnitude(c.magnitude), altitude);
      if (score < bestScore) {
        bestScore = score;
        best = c;
      }
    }
  }

  return best ?? highestAltitude;
}

function dayOfYear(month: number, day: number): number {
  const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let doy = day;
  for (let m = 1; m < month; m++) doy += daysInMonth[m];
  return doy;
}

function circularDistance(a: number, b: number, total = 365): number {
  const diff = Math.abs(a - b);
  return Math.min(diff, total - diff);
}

// Legacy fallback: nearest peak-day match, used only when no location is available.
export function getConstellationByPeakDay(dateStr: string): ConstellationEntry {
  const match = dateStr.match(/(\d{4})[.\-/](\d{2})[.\-/](\d{2})/);
  if (!match) return constellations[0];

  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  const targetDoy = dayOfYear(month, day);

  let closest = constellations[0];
  let minDist = Infinity;

  for (const c of constellations) {
    const peakDoy = dayOfYear(c.peakMonth, c.peakDay);
    const dist = circularDistance(targetDoy, peakDoy);
    if (dist < minDist) {
      minDist = dist;
      closest = c;
    }
  }

  return closest;
}

function describeCloudCover(percent: number): string {
  if (percent < 20) return "CLEAR";
  if (percent < 50) return "PARTLY CLOUDY";
  if (percent < 80) return "MOSTLY CLOUDY";
  return "OVERCAST";
}

// Open-Meteo's forecast endpoint only covers ~16 days ahead, and its archive endpoint
// only covers the past (with a few days' processing lag). Outside that window there's
// no real cloud data to show, so the caller gets null and the UI shows "N/A" honestly
// rather than a fabricated number.
export async function fetchCloudCover(
  lat: number,
  lon: number,
  year: number,
  month: number,
  day: number
): Promise<{ percent: number; label: string } | null> {
  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const daysFromNow = (Date.UTC(year, month - 1, day) - Date.now()) / 86_400_000;

  let base: string;
  if (daysFromNow >= -1 && daysFromNow <= 15) {
    base = "https://api.open-meteo.com/v1/forecast";
  } else if (daysFromNow < -1) {
    base = "https://archive-api.open-meteo.com/v1/archive";
  } else {
    return null; // too far in the future for any real forecast
  }

  try {
    const url = `${base}?latitude=${lat}&longitude=${lon}&hourly=cloud_cover&start_date=${dateStr}&end_date=${dateStr}&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as { hourly?: { cloud_cover?: number[] } };
    const percent = data.hourly?.cloud_cover?.[0]; // local midnight, matching the "tonight" scan
    if (typeof percent !== "number") return null;
    return { percent, label: describeCloudCover(percent) };
  } catch {
    return null; // network hiccup or upstream outage — degrade gracefully, don't fail the whole scan
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { date, lat, lon } = req.body || {};
  if (!date || typeof date !== "string") {
    return res.status(400).json({ error: "INVALID_REQUEST: date field required." });
  }
  if (typeof lat !== "number" || typeof lon !== "number") {
    return res.status(400).json({ error: "INVALID_REQUEST: lat/lon required for an accurate scan." });
  }

  const constellation = getVisibleConstellation(date, lat, lon);
  const parsed = parseTargetDate(date);
  const cloudCover = parsed ? await fetchCloudCover(lat, lon, parsed.year, parsed.month, parsed.day) : null;

  return res.status(200).json({ ...constellation, cloudCover });
}
