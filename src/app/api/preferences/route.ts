import { NextRequest, NextResponse } from "next/server";
import { getPreferencesCollection, isMongoAvailable } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  if (!isMongoAvailable()) {
    console.error("POST /api/preferences: MongoDB unavailable (MONGODB_URI not set)");
    return NextResponse.json({ ok: true });
  }
  try {
    const { deviceId, theme, font } = await request.json();
    if (!deviceId) {
      return NextResponse.json({ error: "Missing deviceId" }, { status: 400 });
    }
    const collection = await getPreferencesCollection();
    if (!collection) {
      console.error("POST /api/preferences: failed to get preferences collection");
      return NextResponse.json({ ok: true });
    }
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
  if (!isMongoAvailable()) {
    console.error("GET /api/preferences: MongoDB unavailable (MONGODB_URI not set)");
    return NextResponse.json(null);
  }
  try {
    const deviceId = request.nextUrl.searchParams.get("deviceId");
    if (!deviceId) {
      return NextResponse.json({ error: "Missing deviceId" }, { status: 400 });
    }
    const collection = await getPreferencesCollection();
    if (!collection) {
      console.error("GET /api/preferences: failed to get preferences collection");
      return NextResponse.json(null);
    }
    const doc = await collection.findOne({ deviceId });
    return NextResponse.json(doc || null);
  } catch (e) {
    console.error("GET /api/preferences error:", e);
    return NextResponse.json(null);
  }
}

export const handler = async (request: Request) => {
  if (request.method === "GET") return GET(request as unknown as NextRequest);
  if (request.method === "POST") return POST(request as unknown as NextRequest);
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
};
