import { MoMAObject, MoMADetailedObject } from "./types";

const MOMA_API_BASE = "https://api.moma.org/api";
const MOMA_TOKEN = process.env.MOMA_API_TOKEN;

// ─── Fetch helpers ─────────────────────────────────────────────────────────

async function momaFetch(path: string): Promise<unknown> {
  const sep = path.includes("?") ? "&" : "?";
  const url = `${MOMA_API_BASE}${path}${sep}token=${MOMA_TOKEN}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`MoMA API error ${res.status}: ${path}`);
  return res.json();
}

// ─── Public API ────────────────────────────────────────────────────────────

// Verified MoMA objectIDs confirmed on view — guarantees iconic works in every pool.
// Verified via the MoMA API on 2026-03-27.
const SEED_OBJECT_IDS = [
  79802,  // The Starry Night — Van Gogh
  79018,  // The Persistence of Memory — Dalí
  78389,  // The Red Studio — Matisse
  80220,  // Water Lilies — Monet
  78682,  // Broadway Boogie Woogie — Mondrian
  78386,  // One: Number 31, 1950 — Pollock
  79250,  // Vir Heroicus Sublimis — Newman
  78984,  // I and the Village — Chagall
  78348,  // I See Again in Memory My Dear Udnie — Picabia
  78956,  // The Double Dream of Spring — de Chirico
  140169, // City Night — Norman Lewis
  79551,  // Study for Les Demoiselles D'Avignon — Picasso
  114892, // Woman Reading — Cousturier
];

export async function getRandomOnView(count = 50): Promise<MoMAObject[]> {
  // Fire random calls + fetch each seed ID in parallel for guaranteed variety
  const randomCalls = Array.from({ length: count }, () =>
    momaFetch("/objects/random?onview=1")
  );
  const seedCalls = SEED_OBJECT_IDS.map((id) =>
    momaFetch(`/objects/${id}`).catch(() => null)
  );

  const [randomResults, seedResults] = await Promise.all([
    Promise.allSettled(randomCalls),
    Promise.allSettled(seedCalls),
  ]);

  const fromRandom = randomResults
    .filter((r): r is PromiseFulfilledResult<unknown> => r.status === "fulfilled")
    .flatMap((r) => ((r.value as { objects?: MoMAObject[] })?.objects ?? []));

  const fromSeeds = seedResults
    .filter((r): r is PromiseFulfilledResult<unknown> => r.status === "fulfilled")
    .flatMap((r) => ((r.value as { objects?: MoMAObject[] })?.objects ?? []));

  // Seeds: only include if they are confirmed on view with a usable image
  const validSeeds = fromSeeds.filter(
    (o: MoMAObject) => o.thumbnail && o.currentLocation && o.onView === 1
  );

  const all = [
    ...validSeeds,  // seeds first so Gemini always sees the iconic works
    ...fromRandom.filter((o: MoMAObject) => o.thumbnail && o.currentLocation),
  ];

  // Deduplicate by objectID
  const seen = new Set<number>();
  return all.filter((o: MoMAObject) => {
    if (seen.has(o.objectID)) return false;
    seen.add(o.objectID);
    return true;
  });
}

export async function getObjectDetails(
  objectId: number
): Promise<MoMADetailedObject | null> {
  const data = await momaFetch(`/objects/${objectId}`) as { objects?: MoMADetailedObject[] };
  return data?.objects?.[0] ?? null;
}

export async function searchObjects(
  searchType: string,
  query: string
): Promise<MoMAObject[]> {
  const data = await momaFetch(
    `/objects?searchtype=${searchType}&search=${encodeURIComponent(query)}`
  ) as { objects?: MoMAObject[] };
  return data?.objects ?? [];
}

export async function getArtistWithWorks(artistId: number) {
  return momaFetch(`/artists/${artistId}`);
}

// ─── Image → base64 (server-side only) ────────────────────────────────────

export async function getImageAsBase64(imageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    return Buffer.from(buffer).toString("base64");
  } catch {
    return null;
  }
}
