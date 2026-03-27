import { MoMAObject, MoMADetailedObject, UserPreferences, FloorCrowdSummary, ChallengeResult } from "./types";
// VisualHuntChallenge is the return type of buildVisualHuntUserMessage prompts

// ─── System prompts ────────────────────────────────────────────────────────

export const PAINTING_POOL_SYSTEM = `You are a MoMA collection expert with deep knowledge of every artwork in the Museum of Modern Art, New York. Return ONLY valid JSON — no markdown, no backticks, no preamble.`;

export function buildPaintingPoolPrompt(count: number): string {
  return `Return a JSON array of ${count} MoMA paintings. Each object has exactly these fields:
{"objectID":number,"title":string,"displayName":string,"dated":string,"medium":string,"department":"Painting & Sculpture","classification":"Painting","onView":1,"currentLocation":string,"thumbnail":"","provenance":"","objectNumber":"","accessionDate":"","objectStatusID":1,"imageID":"","lastModifiedDate":"","alphaSort":string,"role":"Artist","artistID":number,"creditLine":"","dimensions":"","dateBegin":number,"dateEnd":number,"fullImage":"","imageID":""}

The "displayName" field is the ARTIST full name (e.g. "Vincent van Gogh"), NOT the painting title.
The "alphaSort" field is "LastName, FirstName" (e.g. "van Gogh, Vincent").

Known MoMA objectIDs to include: 79802 (The Starry Night, displayName="Vincent van Gogh", Gallery 703 Floor 5), 79018 (The Persistence of Memory, displayName="Salvador Dali", Gallery 706 Floor 5), 79766 (Les Demoiselles d Avignon, displayName="Pablo Picasso", Gallery 501 Floor 5), 78455 (Christinas World, displayName="Andrew Wyeth", Gallery 630 Floor 4), 79809 (Gold Marilyn Monroe, displayName="Andy Warhol", Gallery 407 Floor 4), 78682 (Broadway Boogie Woogie, displayName="Piet Mondrian", Gallery 720 Floor 5), 78386 (One Number 31, displayName="Jackson Pollock", Gallery 620 Floor 4), 78389 (The Red Studio, displayName="Henri Matisse", Gallery 501 Floor 5), 80220 (Water Lilies, displayName="Claude Monet", Gallery 710 Floor 5), 78984 (I and the Village, displayName="Marc Chagall", Gallery 511 Floor 5), 79588 (Drowning Girl, displayName="Roy Lichtenstein", Gallery 419 Floor 4), 78805 (The Treachery of Images, displayName="Rene Magritte", Gallery 511 Floor 5), 80394 (White on White, displayName="Kazimir Malevich", Gallery 507 Floor 5), 79250 (Vir Heroicus Sublimis, displayName="Barnett Newman", Gallery 621 Floor 4), 79600 (Woman I, displayName="Willem de Kooning", Gallery 620 Floor 4).

Fill remaining slots with other famous MoMA paintings you know. Spread across floors. Return ONLY valid JSON array, no markdown.`;
}

export const QUEST_SYSTEM = `You are an expert MoMA curator and visitor experience designer. Your job is to analyze a visitor's preferences and create a personalized museum quest that:
1. Fights museum fatigue by limiting stops to 5-7 paintings
2. Creates a logical walking route that minimizes backtracking between floors
3. Balances familiar masterpieces with surprising discoveries
4. Builds a narrative arc — each painting connects thematically to the next
5. Considers crowd distribution — if possible, start on less-visited floors
6. CRITICAL: Every stop must use a DIFFERENT objectID — never repeat the same artwork

Respond with valid JSON only. No markdown, no backticks, no preamble.`;

export const VISUAL_HUNT_SYSTEM = `You are the Art Detective game master at MoMA. A visitor is standing in front of a painting. Your job is to make them LOOK — really look — by giving them a Visual Hunt challenge.

Rules for the Visual Hunt:
- Generate exactly 6 objects. Roughly 3-4 should be PRESENT in the painting, 2-3 should NOT be present (plausible distractors).
- Objects must be specific and concrete — not "a person" but "a figure in red", not "an animal" but "a black crow". Vague objects make bad gameplay.
- Objects that ARE present should require careful looking to spot — hidden details, background elements, symbolic objects, textures. Never pick the most obvious thing in the painting.
- Objects that are NOT present should be plausible given the painting's era, style, or subject matter — they should make the visitor think and look hard before deciding.
- Each present object gets a short hint (where to look) — keep it subtle, not a giveaway.
- The follow_up question should reference something they would have found in the hunt — it forces them to connect what they physically saw to meaning. If they just guessed randomly they won't be able to answer well.
- The curator_secret should be a genuinely surprising behind-the-scenes fact — private-tour-level, not something on the wall label.

Respond with valid JSON only. No markdown, no backticks, no preamble.`;

export const ART_DNA_SYSTEM = `You generate fun, shareable "Art DNA" personality profiles for museum visitors. Think BuzzFeed meets MoMA. The profile should feel personal, insightful, and share-worthy on social media. Respond with valid JSON only. No markdown, no backticks, no preamble.`;

export const TALK_SYSTEM = (title: string, artist: string) =>
  `You are a knowledgeable, passionate art guide standing next to "${title}" by ${artist} at MoMA. Keep responses under 100 words. Always reference something VISIBLE in the painting. Ask the visitor what THEY see before telling them what to think. You're the cool art professor, not the stuffy museum label.`;

// ─── User message builders ─────────────────────────────────────────────────

export function buildQuestUserMessage(
  prefs: UserPreferences,
  artworks: MoMAObject[],
  crowdSummary: FloorCrowdSummary[]
): string {
  const crowdContext =
    crowdSummary.length > 0
      ? `Current crowd levels: ${crowdSummary
          .map((f) => `${f.floor} (${f.level}: ${f.count} visitors)`)
          .join(", ")}. Prefer starting on less-crowded floors when possible.`
      : "No crowd data available.";

  const artworkList = artworks
    .filter((a) => a.onView)
    .map((a) => ({
      objectID: a.objectID,
      title: a.title,
      artist: a.displayName,
      dated: a.dated,
      medium: a.medium,
      department: a.department,
      classification: a.classification,
      currentLocation: a.currentLocation,
      thumbnail: a.thumbnail,
    }));

  return `Visitor preferences:
- Interests: ${prefs.interests.join(", ")}
- Time available: ${prefs.timeAvailable}
- Vibe: ${prefs.vibe}

${crowdContext}

Available on-view artworks (${artworkList.length} total):
${JSON.stringify(artworkList, null, 2)}

Create a personalized quest with 5-7 stops. Return this exact JSON structure:
{
  "quest_title": string,
  "taste_profile": { "primary_style": string, "era_preference": string, "mood": string, "surprise_factor": string },
  "estimated_time": string,
  "stops": [{ "order": number, "objectID": number, "title": string, "artist": string, "year": string, "currentLocation": string, "thumbnail": string, "teaser": string, "connection_to_next": string }],
  "quest_narrative": string
}`;
}

export function buildVisualHuntUserMessage(artwork: MoMADetailedObject): string {
  return `Generate a Visual Hunt for this painting at MoMA.

Title: ${artwork.title}
Artist: ${artwork.displayName}
Year: ${artwork.dated}
Medium: ${artwork.medium}
Dimensions: ${artwork.dimensions}
Department: ${artwork.department}
Description: ${artwork.description || "Not available"}
Provenance: ${artwork.provenance || "Not available"}
Credit line: ${artwork.creditLine}

Return this EXACT JSON (no extra fields):
{
  "painting_id": ${artwork.objectID},
  "instruction": "Look closely at the painting — which of these can you spot?",
  "objects": [
    { "label": string, "emoji": string, "present": boolean, "hint": string | null },
    { "label": string, "emoji": string, "present": boolean, "hint": string | null },
    { "label": string, "emoji": string, "present": boolean, "hint": string | null },
    { "label": string, "emoji": string, "present": boolean, "hint": string | null },
    { "label": string, "emoji": string, "present": boolean, "hint": string | null },
    { "label": string, "emoji": string, "present": boolean, "hint": string | null }
  ],
  "points_per_hit": 20,
  "points_per_skip": 10,
  "reveal_text": string,
  "follow_up": {
    "question": string,
    "points": 30,
    "sample_answer": string
  },
  "curator_secret": {
    "title": string,
    "content": string,
    "source_hint": string
  }
}

Exactly 6 objects. ~3-4 present, ~2-3 absent. Only present objects have hints (non-null). Absent objects have null hints.`;
}

export function buildArtDNAUserMessage(
  results: ChallengeResult[],
  totalScore: number
): string {
  const visited = results.map((r) => ({
    painting: r.paintingTitle,
    objectsSpotted: r.objectsSpotted,
    followUpAnswer: r.followUpAnswer,
    pointsEarned: r.pointsEarned,
  }));

  return `Generate an Art DNA profile for a visitor who scored ${totalScore} points.

Paintings they visited and engaged with:
${JSON.stringify(visited, null, 2)}

Return this exact JSON:
{
  "art_persona": string,
  "tagline": string,
  "strengths": [string, string, string],
  "art_soulmate": { "artist": string, "why": string },
  "next_visit_recommendation": string,
  "share_text": string
}`;
}
