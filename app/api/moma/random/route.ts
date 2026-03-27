import { NextResponse } from "next/server";
import { getRandomOnView } from "@/lib/moma-api";

export async function GET() {
  try {
    const artworks = await getRandomOnView(20);
    return NextResponse.json({ artworks });
  } catch (err) {
    console.error("[/api/moma/random]", err);
    return NextResponse.json({ error: "Failed to fetch artworks" }, { status: 500 });
  }
}
