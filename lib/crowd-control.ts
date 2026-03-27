import { supabase } from "./supabase";
import { MoMAObject, FloorCrowdSummary, FloorCrowdCount, CrowdLevel } from "./types";

// ─── Extract floor label from location string ──────────────────────────────

export function extractFloor(location: string): string {
  if (!location) return "Unknown";
  const match = location.match(/floor\s*(\d+)/i);
  return match ? `Floor ${match[1]}` : location.split(",")[0].trim();
}

function crowdLevel(count: number): CrowdLevel {
  if (count < 5) return "low";
  if (count < 15) return "moderate";
  return "high";
}

// ─── Read crowd data from Supabase ────────────────────────────────────────

export async function getFloorCrowdCounts(): Promise<FloorCrowdSummary[]> {
  const { data, error } = await supabase
    .from("floor_crowd_counts")
    .select("*");

  if (error || !data) return [];

  return (data as FloorCrowdCount[]).map((row) => ({
    floor: row.floor,
    count: row.visitor_count,
    level: crowdLevel(row.visitor_count),
  }));
}

// ─── Register / update visitor location ───────────────────────────────────

export async function upsertVisitorLocation(
  sessionId: string,
  floor: string,
  gallery?: string,
  artworkId?: number
): Promise<void> {
  // Ensure session exists
  await supabase.from("visitor_sessions").upsert(
    { session_id: sessionId, last_seen: new Date().toISOString() },
    { onConflict: "session_id" }
  );

  // Upsert location (one row per session)
  await supabase.from("visitor_locations").upsert(
    {
      session_id: sessionId,
      floor,
      gallery: gallery ?? null,
      artwork_id: artworkId ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "session_id" }
  );
}

// ─── Bias artwork list toward less-crowded floors ─────────────────────────

export function applyFloorBias(
  artworks: MoMAObject[],
  crowdSummary: FloorCrowdSummary[]
): MoMAObject[] {
  const countByFloor = Object.fromEntries(
    crowdSummary.map((f) => [f.floor, f.count])
  );

  return [...artworks].sort((a, b) => {
    const floorA = extractFloor(a.currentLocation);
    const floorB = extractFloor(b.currentLocation);
    const countA = countByFloor[floorA] ?? 0;
    const countB = countByFloor[floorB] ?? 0;
    return countA - countB; // prefer less-crowded floors first
  });
}
