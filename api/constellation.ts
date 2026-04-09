import { GoogleGenAI, Type } from "@google/genai";

const constellationSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    name: { type: Type.STRING },
    latinName: { type: Type.STRING },
    description: { type: Type.STRING },
    mythology: { type: Type.STRING },
    ra: { type: Type.STRING },
    dec: { type: Type.STRING },
    magnitude: { type: Type.STRING },
    distance: { type: Type.STRING },
    visibility: { type: Type.STRING },
    type: { type: Type.STRING },
    stars: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          x: { type: Type.NUMBER },
          y: { type: Type.NUMBER },
          size: { type: Type.STRING, enum: ["sm", "md", "lg"] },
          name: { type: Type.STRING },
        },
        required: ["x", "y", "size"],
      },
    },
    connections: {
      type: Type.ARRAY,
      items: {
        type: Type.ARRAY,
        items: { type: Type.NUMBER },
      },
      description:
        "Pairs of star indices to connect with lines to form the constellation outline.",
    },
    spectralData: {
      type: Type.OBJECT,
      properties: {
        luminosity: { type: Type.STRING },
        nebulaDensity: { type: Type.STRING },
        signalDrift: { type: Type.STRING },
      },
    },
    observationWindow: { type: Type.STRING },
    skySector: { type: Type.STRING },
  },
  required: [
    "id",
    "name",
    "latinName",
    "description",
    "mythology",
    "ra",
    "dec",
    "type",
    "stars",
    "connections",
  ],
};

export default async function handler(req: Request): Promise<Response> {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers,
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "API_KEY_NOT_FOUND: Server misconfiguration." }),
      { status: 500, headers }
    );
  }

  let query: string;
  try {
    const body = await req.json();
    query = body.query;
    if (!query || typeof query !== "string") throw new Error("Missing query");
  } catch {
    return new Response(
      JSON.stringify({ error: "INVALID_REQUEST: query field required." }),
      { status: 400, headers }
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Generate detailed astronomical data for the constellation or star: ${query}. 
      Include realistic coordinates and a list of 5-10 main stars with their relative x,y positions (0-100) for a map visualization.
      Crucially, provide "connections" as an array of index pairs (e.g., [[0,1], [1,2]]) to draw the constellation's stick-figure outline.
      Also include a "mythology" section describing the origin story of the constellation.
      The "visibility" field should be formatted as "LAT [val1]-LAT [val2]" (e.g., "LAT +90°-LAT -65°").`,
      config: {
        responseMimeType: "application/json",
        responseSchema: constellationSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("EMPTY_RESPONSE_FROM_TEMPORAL_CORE");

    const data = JSON.parse(text);
    return new Response(JSON.stringify(data), { status: 200, headers });
  } catch (error: any) {
    console.error("TEMPORAL_QUERY_FAILED:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "CONNECTION_TO_TEMPORAL_CORE_LOST",
      }),
      { status: 500, headers }
    );
  }
}

export const config = {
  runtime: "edge",
};
