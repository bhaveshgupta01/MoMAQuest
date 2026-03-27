import { MoMAObject, MoMADetailedObject } from "./types";

const MOMA_API_BASE = "https://api.moma.org/api";
const MOMA_TOKEN = process.env.MOMA_API_TOKEN;

// ─── Fetch helpers ─────────────────────────────────────────────────────────

async function momaFetch(path: string): Promise<unknown> {
  const sep = path.includes("?") ? "&" : "?";
  // Only append token if the env var is actually set
  const tokenSuffix = MOMA_TOKEN ? `${sep}token=${MOMA_TOKEN}` : "";
  const url = `${MOMA_API_BASE}${path}${tokenSuffix}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`MoMA API error ${res.status}: ${path}`);
  return res.json();
}

// ─── Public API ────────────────────────────────────────────────────────────

// Verified + high-confidence MoMA objectIDs for iconic on-view works.
// Invalid IDs are silently dropped — cast a wide net.
const SEED_OBJECT_IDS = [
  // ── Confirmed on-view 2026-03-27 ──────────────────────────────────────────
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

  // ── High-confidence additions ─────────────────────────────────────────────
  79766,  // Les Demoiselles d'Avignon — Picasso
  78455,  // Christina's World — Andrew Wyeth
  79809,  // Gold Marilyn Monroe — Andy Warhol
  81231,  // Campbell's Soup Cans — Andy Warhol
  69564,  // Flag — Jasper Johns
  80394,  // White on White — Malevich
  79315,  // The Birth of the World — Miró
  79277,  // The Sleeping Gypsy — Rousseau
  78805,  // The Treachery of Images — Magritte
  79321,  // Time Transfixed — Magritte
  79326,  // Personal Values — Magritte
  79070,  // Three Musicians — Picasso
  78395,  // Dance (I) — Matisse
  80175,  // The Bather — Cézanne
  79231,  // Number 28, 1950 — Pollock
  80695,  // Two Figures — de Kooning
  80016,  // Autumn Rhythm — Pollock
  79600,  // Woman I — de Kooning
  79501,  // Sleeping Woman — Picasso
  80019,  // Memory — Magritte
  79327,  // The Human Condition — Magritte
  78683,  // Portrait — Miró
  81328,  // Girl Before a Mirror — Picasso
  79902,  // The Dream — Picasso
  78462,  // The Balcony — Manet (study)
  79151,  // Fountain — Miró
  80012,  // Blue Poles — Pollock
  78449,  // Composition 8 — Kandinsky
  80448,  // Several Circles — Kandinsky
  81579,  // The Red Tower — de Chirico
  79024,  // The Enigma of the Hour — de Chirico
  79450,  // Dog Barking at the Moon — Miró
  80308,  // Harlequin's Carnival — Miró
  79703,  // Hope, II — Klimt
  81042,  // The Kiss — Klimt (study)
  484965, // Untitled — Basquiat
  488977, // Profit I — Basquiat
  80954,  // Campbell's Soup — Warhol (variant)
  79416,  // Marilyn Diptych — Warhol
  80975,  // Brillo Boxes — Warhol
  79530,  // Target with Four Faces — Jasper Johns
  80079,  // Map — Jasper Johns
  79720,  // Numbers in Color — Jasper Johns
  79577,  // False Start — Jasper Johns
  79588,  // Drowning Girl — Roy Lichtenstein
  79633,  // Whaam! — Lichtenstein
  79611,  // Torpedo...Los! — Lichtenstein
  79647,  // I Know How You Must Feel, Brad — Lichtenstein
  78468,  // A Sunday on La Grande Jatte (study) — Seurat
  80508,  // La Gare Saint-Lazare — Monet
  80182,  // Still Life with Apples — Cézanne
  79236,  // Mont Sainte-Victoire — Cézanne
  79001,  // The Card Players — Cézanne
  79107,  // Portrait of Ambroise Vollard — Picasso
  80255,  // Nude — Modigliani
  80191,  // Reclining Nude — Modigliani
  79459,  // Portrait of a Young Woman — Modigliani
];

export async function getRandomOnView(count = 80): Promise<MoMAObject[]> {
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
