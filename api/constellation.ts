import type { VercelRequest, VercelResponse } from "@vercel/node";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

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
      items: {
        type: "ARRAY",
        items: { type: "NUMBER" },
      },
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

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Generate detailed astronomical data for the constellation or star: ${query}. 
Include realistic coordinates and a list of 5-10 main stars with their relative x,y positions (0-100) for a map visualization.
Provide "connections" as an array of index pairs (e.g., [[0,1], [1,2]]) to draw the constellation's stick-figure outline.
Include a "mythology" section describing the origin story.
The "visibility" field should be formatted as "LAT [val1]-LAT [val2]" (e.g., "LAT +90°-LAT -65°").`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: constellationSchema,
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      console.error("Gemini API error:", errBody);
      return res.status(response.status).json({ error: JSON.stringify(errBody) });
    }

    const result = await response.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({ error: "EMPTY_RESPONSE_FROM_TEMPORAL_CORE" });
    }

    const data = JSON.parse(text);
    return res.status(200).json(data);
  } catch (error: any) {
    console.error("TEMPORAL_QUERY_FAILED:", error);
    return res.status(500).json({
      error: error.message || "CONNECTION_TO_TEMPORAL_CORE_LOST",
    });
  }
}
