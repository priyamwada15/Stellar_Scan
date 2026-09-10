import { Constellation } from "../types";

const API_URL = "/api/constellation";

export async function getConstellationData(date: string, lat: number, lon: number): Promise<Constellation> {
  console.log("INITIALIZING_TEMPORAL_QUERY:", date, lat, lon);

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, lat, lon }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "CONNECTION_TO_TEMPORAL_CORE_LOST");
  }

  const data = await response.json();
  console.log("QUERY_SUCCESSFUL: Data retrieved.");
  return data as Constellation;
}
