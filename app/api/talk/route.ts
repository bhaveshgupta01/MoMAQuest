import { NextRequest, NextResponse } from "next/server";
import { callGeminiText } from "@/lib/claude";
import { TALK_SYSTEM } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    const {
      title,
      artist,
      messages,
    }: {
      title: string;
      artist: string;
      messages: Array<{ role: string; content: string }>;
    } = await req.json();

    if (!title || !artist || !messages?.length) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const reply = await callGeminiText({
      system: TALK_SYSTEM(title, artist),
      messages,
      maxTokens: 300,
    });

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[/api/talk]", err);
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  }
}
