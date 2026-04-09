import { Constellation } from "../types";

const API_URL = "/api/constellation";

export async function getConstellationData(query: string): Promise<Constellation> {
  console.log("INITIALIZING_TEMPORAL_QUERY:", query);

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "CONNECTION_TO_TEMPORAL_CORE_LOST");
  }

  const data = await response.json();
  console.log("QUERY_SUCCESSFUL: Data retrieved.");
  return data as Constellation;
}
