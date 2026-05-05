let clientPromise: Promise<unknown> | null = null;

export function isMongoAvailable(): boolean {
  return !!process.env.MONGODB_URI;
}

async function getClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;

  if (!clientPromise) {
    const { MongoClient } = await import("mongodb");
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }
  return clientPromise;
}

async function getDb() {
  const client = await getClient();
  if (!client) return null;
  return (client as any).db("potato");
}

export async function getBoardsCollection() {
  const db = await getDb();
  if (!db) return null;
  return db.collection("sb_boards");
}

export async function getPreferencesCollection() {
  const db = await getDb();
  if (!db) return null;
  return db.collection("sb_preferences");
}
