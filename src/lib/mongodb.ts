import { MongoClient, Collection } from "mongodb";

let clientPromise: Promise<MongoClient> | null = null;

function getUri(): string | undefined {
  return process.env.MONGODB_URI;
}

async function getClient(): Promise<MongoClient | null> {
  const uri = getUri();
  if (!uri) return null;

  if (!clientPromise) {
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }
  return clientPromise;
}

export async function getDb() {
  const client = await getClient();
  if (!client) return null;
  return client.db("potato");
}

export async function getBoardsCollection(): Promise<Collection | null> {
  const db = await getDb();
  if (!db) return null;
  return db.collection("sb_boards");
}

export async function getPreferencesCollection(): Promise<Collection | null> {
  const db = await getDb();
  if (!db) return null;
  return db.collection("sb_preferences");
}

export function isMongoAvailable(): boolean {
  return !!getUri();
}
