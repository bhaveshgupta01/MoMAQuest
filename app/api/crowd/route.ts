import { NextRequest, NextResponse } from "next/server";
import { getFloorCrowdCounts, upsertVisitorLocation } from "@/lib/crowd-control";

// GET /api/crowd — returns current crowd counts per floor
export async function GET() {
  try {
    const floors = await getFloorCrowdCounts();
    return NextResponse.json({ floors });
  } catch (err) {
    console.error("[GET /api/crowd]", err);
    return NextResponse.json({ error: "Failed to get crowd data" }, { status: 500 });
  }
}

// POST /api/crowd — update this visitor's current location
export async function POST(req: NextRequest) {
  try {
    const {
      sessionId,
      floor,
      gallery,
      artworkId,
    }: {
      sessionId: string;
      floor: string;
      gallery?: string;
      artworkId?: number;
    } = await req.json();

    if (!sessionId || !floor) {
      return NextResponse.json({ error: "Missing sessionId or floor" }, { status: 400 });
    }

    await upsertVisitorLocation(sessionId, floor, gallery, artworkId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/crowd]", err);
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 });
  }
}
