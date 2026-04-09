import type { VercelRequest, VercelResponse } from "@vercel/node";
import db from "../src/constellation-db.json";

interface ConstellationEntry {
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

function getConstellationForDate(dateStr: string): ConstellationEntry {
  // Parse YYYY.MM.DD or YYYY-MM-DD
  const match = dateStr.match(/(\d{4})[.\-\/](\d{2})[.\-\/](\d{2})/);
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

  const { query } = req.body || {};
  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "INVALID_REQUEST: query field required." });
  }

  const constellation = getConstellationForDate(query);
  return res.status(200).json(constellation);
}
