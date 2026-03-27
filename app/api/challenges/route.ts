import { NextRequest, NextResponse } from "next/server";
import { getObjectDetails, getImageAsBase64 } from "@/lib/moma-api";
import { callClaude, imageBlock } from "@/lib/claude";
import { VISUAL_HUNT_SYSTEM, buildVisualHuntUserMessage } from "@/lib/prompts";
import { VisualHuntChallenge } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { objectId }: { objectId: number } = await req.json();

    if (!objectId) {
      return NextResponse.json({ error: "Missing objectId" }, { status: 400 });
    }

    const artwork = await getObjectDetails(objectId);
    if (!artwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
    }

    // Fetch painting image for Claude Vision — critical for accurate object detection
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
