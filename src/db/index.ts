import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __postgresStatus?: { checked: boolean; available: boolean; timestamp: number };
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 1500,
  });

// Prevent unhandled errors on idle pool clients from terminating the node process
pool.on("error", (err) => {
  if (globalForDb.__postgresStatus) {
    globalForDb.__postgresStatus.available = false;
  }
});

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);

export async function isPostgresAvailable(): Promise<boolean> {
  const now = Date.now();
  if (
    globalForDb.__postgresStatus &&
    now - globalForDb.__postgresStatus.timestamp < 30000 // Cache status for 30s
  ) {
    return globalForDb.__postgresStatus.available;
  }

  try {
    const client = await Promise.race([
      pool.connect(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 1200)
      ),
    ]);
    client.release();
    globalForDb.__postgresStatus = { checked: true, available: true, timestamp: now };
    return true;
  } catch {
    globalForDb.__postgresStatus = { checked: true, available: false, timestamp: now };
    return false;
  }
}
