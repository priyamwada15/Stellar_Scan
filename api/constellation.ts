import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Redis } from "@upstash/redis";

const GEMINI_MODELS = [
  "gemini-1.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-pro",
];
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

const constellationSchema = {
  type: "OBJECT",
  properties: {
    id: { type: "STRING" },
    name: { type: "STRING" },
    latinName: { type: "STRING" },
    description: { type: "STRING" },
    mythology: { type: "STRING" },
    ra: { type: "STRING" },
    dec: { type: "STRING" },
    magnitude: { type: "STRING" },
    distance: { type: "STRING" },
    visibility: { type: "STRING" },
    type: { type: "STRING" },
    stars: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          x: { type: "NUMBER" },
          y: { type: "NUMBER" },
          size: { type: "STRING", enum: ["sm", "md", "lg"] },
          name: { type: "STRING" },
        },
        required: ["x", "y", "size"],
      },
    },
    connections: {
      type: "ARRAY",
      items: { type: "ARRAY", items: { type: "NUMBER" } },
    },
    spectralData: {
      type: "OBJECT",
      properties: {
        luminosity: { type: "STRING" },
        nebulaDensity: { type: "STRING" },
        signalDrift: { type: "STRING" },
      },
    },
    observationWindow: { type: "STRING" },
    skySector: { type: "STRING" },
  },
  required: [
    "id", "name", "latinName", "description", "mythology",
    "ra", "dec", "type", "stars", "connections",
  ],
};

const PROMPT = (query: string) =>
  `Generate detailed astronomical data for the constellation or star: ${query}.
Include realistic coordinates and a list of 5-10 main stars with their relative x,y positions (0-100) for a map visualization.
Provide "connections" as an array of index pairs (e.g., [[0,1], [1,2]]) to draw the constellation's stick-figure outline.
Include a "mythology" section describing the origin story.
The "visibility" field should be formatted as "LAT [val1]-LAT [val2]" (e.g., "LAT +90°-LAT -65°").`;

function normalizeDateKey(query: string): string | null {
  const match = query.match(/(\d{4})[.\-\/](\d{2})[.\-\/](\d{2})/);
  if (!match) return null;
  return `constellation:${match[1]}.${match[2]}.${match[3]}`;
}

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Try a single model with retry + backoff
async function tryModel(apiKey: string, model: string, query: string): Promise<any> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(`Trying ${model} — attempt ${attempt}/${MAX_RETRIES}`);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPT(query) }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: constellationSchema,
        },
      }),
    });

    // Retryable errors: 503 (overloaded), 429 (rate limit), 500 (transient)
    if ([429, 500, 503].includes(response.status)) {
      const delay = RETRY_DELAY_MS * attempt;
      console.warn(`${model} returned ${response.status} — retrying in ${delay}ms`);
      await sleep(delay);
      continue;
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(`${model} error ${response.status}: ${JSON.stringify(body)}`);
    }

    const result = await response.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error(`${model} returned empty response`);

    return JSON.parse(text);
  }

  throw new Error(`${model} failed after ${MAX_RETRIES} attempts`);
}

// Try each model in order, falling back on failure
async function callGeminiWithFallback(apiKey: string, query: string): Promise<any> {
  let lastError: Error = new Error("No models available");

  for (const model of GEMINI_MODELS) {
    try {
      const data = await tryModel(apiKey, model, query);
      console.log(`SUCCESS with ${model}`);
      return data;
    } catch (err: any) {
      console.warn(`${model} failed: ${err.message}`);
      lastError = err;
    }
  }

  throw lastError;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API_KEY_NOT_FOUND: Server misconfiguration." });
  }

  const { query } = req.body || {};
  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "INVALID_REQUEST: query field required." });
  }

  const cacheKey = normalizeDateKey(query);
  const redis = getRedis();

  // Cache check
  if (cacheKey && redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log(`CACHE_HIT: ${cacheKey}`);
        return res.status(200).json(cached);
      }
      console.log(`CACHE_MISS: ${cacheKey}`);
    } catch (err) {
      console.warn("CACHE_READ_ERROR:", err);
    }
  }

  // Call Gemini with retries + model fallback
  try {
    const data = await callGeminiWithFallback(apiKey, query);

    // Write to cache
    if (cacheKey && redis) {
      try {
        await redis.set(cacheKey, data);
        console.log(`CACHE_WRITE: ${cacheKey}`);
      } catch (err) {
        console.warn("CACHE_WRITE_ERROR:", err);
      }
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("ALL_MODELS_FAILED:", error.message);
    return res.status(503).json({
      error: "TEMPORAL_SYNC_TIMEOUT: Connection to core lost.",
    });
  }
}
