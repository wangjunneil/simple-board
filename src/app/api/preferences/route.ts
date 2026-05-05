import { NextRequest, NextResponse } from "next/server";
import { getPreferencesCollection } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { deviceId, theme, font } = await request.json();
    if (!deviceId) {
      return NextResponse.json({ error: "Missing deviceId" }, { status: 400 });
    }
    const collection = await getPreferencesCollection();
    await collection.updateOne(
      { deviceId },
      {
        $set: {
          theme: theme || null,
          font: font || null,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/preferences error:", e);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const deviceId = request.nextUrl.searchParams.get("deviceId");
    if (!deviceId) {
      return NextResponse.json({ error: "Missing deviceId" }, { status: 400 });
    }
    const collection = await getPreferencesCollection();
    const doc = await collection.findOne({ deviceId });
    return NextResponse.json(doc || null);
  } catch (e) {
    console.error("GET /api/preferences error:", e);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}
