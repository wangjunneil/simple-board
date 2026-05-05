import { NextRequest, NextResponse } from "next/server";
import { getBoardsCollection } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { deviceId, boards, activeBoardId, theme, font } = await request.json();
    if (!deviceId || !Array.isArray(boards)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    const collection = await getBoardsCollection();
    await collection.updateOne(
      { deviceId },
      {
        $set: {
          boards,
          activeBoardId: activeBoardId || null,
          theme: theme || null,
          font: font || null,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/boards error:", e);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const deviceId = request.nextUrl.searchParams.get("deviceId");
    if (!deviceId) {
      return NextResponse.json({ error: "Missing deviceId" }, { status: 400 });
    }
    const collection = await getBoardsCollection();
    const doc = await collection.findOne({ deviceId });
    return NextResponse.json(doc || null);
  } catch (e) {
    console.error("GET /api/boards error:", e);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}
