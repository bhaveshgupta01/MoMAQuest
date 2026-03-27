import { NextRequest, NextResponse } from "next/server";
import { getObjectDetails, getImageAsBase64 } from "@/lib/moma-api";
import { callClaude, imageBlock } from "@/lib/claude";
import { VISUAL_HUNT_SYSTEM, buildVisualHuntUserMessage } from "@/lib/prompts";
import { VisualHuntChallenge, MoMADetailedObject } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { objectId, stopMeta }: {
      objectId: number;
      stopMeta?: { title: string; artist: string; year: string; medium?: string; location?: string };
    } = body;

    if (!objectId) {
      return NextResponse.json({ error: "Missing objectId" }, { status: 400 });
    }

    // Try to get full MoMA details; fall back to stopMeta if it fails
    let artwork: MoMADetailedObject | null = null;
    try {
      artwork = await getObjectDetails(objectId);
    } catch {
      // MoMA API unavailable — will use stopMeta fallback below
    }

    // Build a synthetic artwork object from stopMeta when MoMA API is unavailable
    if (!artwork && stopMeta) {
      artwork = {
        objectID: objectId,
        title: stopMeta.title,
        displayName: stopMeta.artist,
        dated: stopMeta.year,
        medium: stopMeta.medium ?? "",
        dimensions: "",
        department: "Painting & Sculpture",
        description: "",
        provenance: "",
        creditLine: "",
        currentLocation: stopMeta.location ?? "",
      } as unknown as MoMADetailedObject;
    }

    if (!artwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
    }

    // Fetch painting image for Gemini Vision — non-fatal if it fails
    const imageUrl = artwork.fullImage || artwork.thumbnail;
    const base64 = imageUrl ? await getImageAsBase64(imageUrl) : null;

    const userContent: unknown[] = [];
    if (base64) {
      userContent.push(imageBlock(base64));
    }
    userContent.push({ type: "text", text: buildVisualHuntUserMessage(artwork) });

    const hunt = await callClaude<VisualHuntChallenge>({
      system: VISUAL_HUNT_SYSTEM,
      messages: [{ role: "user", content: userContent }],
      maxTokens: 1500,
    });

    return NextResponse.json({ hunt });
  } catch (err) {
    console.error("[/api/challenges]", err);
    return NextResponse.json(
      { error: "Failed to generate visual hunt" },
      { status: 500 }
    );
  }
}
