import { NextRequest, NextResponse } from "next/server";
import { getBoardsCollection, isMongoAvailable } from "@/lib/mongodb";
import { getServerDeviceId } from "@/lib/auth";

export async function POST(request: NextRequest) {
  if (!isMongoAvailable()) {
    console.error("POST /api/boards: MongoDB unavailable (MONGODB_URI not set)");
    return NextResponse.json({ ok: true });
  }
  try {
    const { boards, activeBoardId, theme, font } = await request.json();
    if (!Array.isArray(boards)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    const deviceId = await getServerDeviceId();
    const collection = await getBoardsCollection();
    if (!collection) {
      console.error("POST /api/boards: failed to get boards collection");
      return NextResponse.json({ ok: true });
    }
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
  if (!isMongoAvailable()) {
    console.error("GET /api/boards: MongoDB unavailable (MONGODB_URI not set)");
    return NextResponse.json(null);
  }
  try {
    const deviceId = await getServerDeviceId();
    const collection = await getBoardsCollection();
    if (!collection) {
      console.error("GET /api/boards: failed to get boards collection");
      return NextResponse.json(null);
    }
    const doc = await collection.findOne({ deviceId });
    return NextResponse.json(doc || null);
  } catch (e) {
    console.error("GET /api/boards error:", e);
    return NextResponse.json(null);
  }
}

export const handler = async (request: Request) => {
  if (request.method === "GET") return GET(request as unknown as NextRequest);
  if (request.method === "POST") return POST(request as unknown as NextRequest);
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
};
