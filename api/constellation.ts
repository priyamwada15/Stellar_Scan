import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as Astronomy from "astronomy-engine";
import db from "../src/constellation-db.json";

export interface ConstellationEntry {
  id: string;
  name: string;
  latinName: string;
  type: string;
  description: string;
  mythology: string;
  ra: string;
  dec: string;
  magnitude: string;
  distance: string;
  visibility: string;
  peakMonth: number;
  peakDay: number;
  stars: { x: number; y: number; size: string; name?: string }[];
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

function parseTargetDate(dateStr: string): { year: number; month: number; day: number } | null {
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
  let bestMagnitude = Infinity;
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
      const magnitude = parseMagnitude(c.magnitude);
      if (magnitude < bestMagnitude) {
        bestMagnitude = magnitude;
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

export default function handler(req: VercelRequest, res: VercelResponse) {
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
  return res.status(200).json(constellation);
}
