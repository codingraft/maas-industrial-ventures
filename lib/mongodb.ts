import { MongoClient, Db } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var _mongoOfflineUntil: number | undefined;
  // eslint-disable-next-line no-var
  var _mongoIndexesEnsured: boolean | undefined;
}

export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim().length > 0);
}

let indexInitialization: Promise<void> | undefined;
let clientPromise: Promise<MongoClient> | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not configured.");
  }

  // If MongoDB previously failed within the last 60 seconds, fail immediately to prevent 30s freezes
  if (global._mongoOfflineUntil && Date.now() < global._mongoOfflineUntil) {
    throw new Error("MongoDB is temporarily unreachable.");
  }

  const createClientPromise = () => {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 2500, // 2.5s maximum timeout
      connectTimeoutMS: 2500,
      maxPoolSize: 25, // Maintain healthy connection pool for concurrent requests
      minPoolSize: 2,  // Keep warm connections ready
      maxIdleTimeMS: 30000,
    });
    return client.connect().catch((err) => {
      // Mark as offline for 60 seconds so subsequent requests fall back instantly
      global._mongoOfflineUntil = Date.now() + 60000;
      global._mongoClientPromise = undefined;
      clientPromise = null;
      throw err;
    });
  };

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = createClientPromise();
    }
    return global._mongoClientPromise;
  } else {
    if (!clientPromise) {
      clientPromise = createClientPromise();
    }
    return clientPromise;
  }
}

/**
 * Idempotently creates optimal compound and single-field indexes across collections.
 * Executes once per application process lifetime to prevent startup/request overhead.
 */
export async function ensureIndexes(db: Db): Promise<void> {
  if (global._mongoIndexesEnsured) return;

  try {
    await Promise.all([
      // Leads: index for pagination sort, status filter, project filter, and timestamp
      db.collection("leads").createIndex({ lead_id: -1 }, { background: true }),
      db.collection("leads").createIndex({ status: 1 }, { background: true }),
      db.collection("leads").createIndex({ project: 1 }, { background: true }),
      db.collection("leads").createIndex({ created_at: -1 }, { background: true }),

      // Projects: unique id index, slug index, and ordering index
      db.collection("projects").createIndex({ id: 1 }, { unique: true, background: true }),
      db.collection("projects").createIndex({ slug: 1 }, { background: true }),
      db.collection("projects").createIndex({ isActive: 1, order: 1 }, { background: true }),

      // Blogs: unique id index, slug index, and publication index
      db.collection("blogs").createIndex({ id: 1 }, { unique: true, background: true }),
      db.collection("blogs").createIndex({ slug: 1 }, { background: true }),
      db.collection("blogs").createIndex({ isPublished: 1, publishedAt: -1 }, { background: true }),

      // Settings: unique key lookup index
      db.collection("settings").createIndex({ key: 1 }, { unique: true, background: true }),
    ]);

    global._mongoIndexesEnsured = true;
  } catch (err) {
    console.warn("Index initialization notice:", err instanceof Error ? err.message : err);
  }
}

export async function getMongoDb(): Promise<Db> {
  const client = await getMongoClient();
  const dbName = process.env.MONGODB_DB || "maas_ventures";
  const db = client.db(dbName);

  // Trigger index creation asynchronously without blocking request
  if (!global._mongoIndexesEnsured) {
    indexInitialization ??= ensureIndexes(db).finally(() => { indexInitialization = undefined; });
  }

  return db;
}
