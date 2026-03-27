import { NextRequest, NextResponse } from "next/server";
import { getRandomOnView } from "@/lib/moma-api";
import { callClaude } from "@/lib/claude";
import { QUEST_SYSTEM, buildQuestUserMessage } from "@/lib/prompts";
import { applyFloorBias, getFloorCrowdCounts } from "@/lib/crowd-control";
import { QuestData, UserPreferences } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { preferences }: { preferences: UserPreferences } = await req.json();

    if (!preferences?.interests?.length || !preferences.timeAvailable || !preferences.vibe) {
      return NextResponse.json({ error: "Missing preferences" }, { status: 400 });
    }

    // Fetch artworks + crowd data in parallel
    const [artworks, crowdSummary] = await Promise.all([
      getRandomOnView(80),
      getFloorCrowdCounts(),
    ]);

    // Bias toward less-crowded floors before sending to Gemini
    const biasedArtworks = applyFloorBias(artworks, crowdSummary);

    const quest = await callClaude<QuestData>({
      system: QUEST_SYSTEM,
      messages: [
        {
          role: "user",
          content: buildQuestUserMessage(preferences, biasedArtworks, crowdSummary),
        },
      ],
      maxTokens: 4096,
      thinkingBudget: 2048, // allow reasoning to pick the best 5-7 stops from 60+ artworks
    });

    // Hard-deduplicate stops by objectID in case the model repeated any
    const seenIds = new Set<number>();
    quest.stops = quest.stops.filter((s) => {
      if (seenIds.has(s.objectID)) return false;
      seenIds.add(s.objectID);
      return true;
    });

    return NextResponse.json({ quest });
  } catch (err) {
    console.error("[/api/quest]", err);
    return NextResponse.json(
      { error: "Failed to generate quest" },
      { status: 500 }
    );
  }
}
