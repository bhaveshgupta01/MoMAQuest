import { NextRequest, NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";
import { ART_DNA_SYSTEM, buildArtDNAUserMessage } from "@/lib/prompts";
import { ArtDNA, ChallengeResult } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const {
      results,
      totalScore,
    }: { results: ChallengeResult[]; totalScore: number } = await req.json();

    if (!results || totalScore == null) {
      return NextResponse.json({ error: "Missing results or score" }, { status: 400 });
    }

    const artDNA = await callClaude<ArtDNA>({
      system: ART_DNA_SYSTEM,
      messages: [
        {
          role: "user",
          content: buildArtDNAUserMessage(results, totalScore),
        },
      ],
      maxTokens: 1000,
    });

    return NextResponse.json({ artDNA });
  } catch (err) {
    console.error("[/api/art-dna]", err);
    return NextResponse.json(
      { error: "Failed to generate Art DNA" },
      { status: 500 }
    );
  }
}
