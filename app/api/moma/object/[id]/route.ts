import { NextRequest, NextResponse } from "next/server";
import { getObjectDetails } from "@/lib/moma-api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const objectId = parseInt(id, 10);
    if (isNaN(objectId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const artwork = await getObjectDetails(objectId);
    if (!artwork) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ artwork });
  } catch (err) {
    console.error("[/api/moma/object]", err);
    return NextResponse.json({ error: "Failed to fetch artwork" }, { status: 500 });
  }
}
