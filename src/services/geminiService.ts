import { GoogleGenAI, Type } from "@google/genai";
import { Constellation } from "../types";

const getApiKey = () => {
  // Check standard Vite env variable first
  const viteKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (viteKey) return viteKey;

  // Check the "defined" process.env variable (from vite.config.ts)
  const processKey = process.env.GEMINI_API_KEY;
  if (processKey) return processKey;

  return "";
};

const API_KEY = getApiKey();

if (!API_KEY) {
  console.error("CRITICAL_ERROR: GEMINI_API_KEY is missing from the build environment.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

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
          name: { type: Type.STRING }
        },
        required: ["x", "y", "size"]
      }
    },
    connections: {
      type: Type.ARRAY,
      items: {
        type: Type.ARRAY,
        items: { type: Type.NUMBER },
        minItems: 2,
        maxItems: 2
      },
      description: "Pairs of star indices to connect with lines to form the constellation outline."
    },
    spectralData: {
      type: Type.OBJECT,
      properties: {
        luminosity: { type: Type.STRING },
        nebulaDensity: { type: Type.STRING },
        signalDrift: { type: Type.STRING }
      }
    },
    observationWindow: { type: Type.STRING },
    skySector: { type: Type.STRING }
  },
  required: ["id", "name", "latinName", "description", "mythology", "ra", "dec", "type", "stars", "connections"]
};

export async function getConstellationData(query: string): Promise<Constellation> {
  console.log("INITIALIZING_TEMPORAL_QUERY:", query);
  
  if (!API_KEY) {
    throw new Error("API_KEY_NOT_FOUND: Please set VITE_GEMINI_API_KEY in your environment.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate detailed astronomical data for the constellation or star: ${query}. 
      Include realistic coordinates and a list of 5-10 main stars with their relative x,y positions (0-100) for a map visualization.
      Crucially, provide "connections" as an array of index pairs (e.g., [[0,1], [1,2]]) to draw the constellation's stick-figure outline.
      Also include a "mythology" section describing the origin story of the constellation.
      The "visibility" field should be formatted as "LAT [val1]-LAT [val2]" (e.g., "LAT +90°-LAT -65°").`,
      config: {
        responseMimeType: "application/json",
        responseSchema: constellationSchema
      }
    });

    if (!response.text) {
      throw new Error("EMPTY_RESPONSE_FROM_TEMPORAL_CORE");
    }

    console.log("QUERY_SUCCESSFUL: Data retrieved.");
    return JSON.parse(response.text);
  } catch (error: any) {
    console.error("TEMPORAL_QUERY_FAILED:", error);
    throw new Error(error.message || "CONNECTION_TO_TEMPORAL_CORE_LOST");
  }
}
