import fs from "fs";

/**
 * Local fallback store used ONLY when neither MongoDB Atlas nor PostgreSQL is reachable.
 * - Lives on globalThis so it survives Next.js hot reloads and is shared between
 *   server components and server actions.
 * - Persisted to `.data/playnexus.json` so data survives local dev-server restarts.
 *   Vercel's filesystem is ephemeral, so production deployments must use MongoDB
 *   or PostgreSQL for persistent data.
 */

export type Row = Record<string, any>;

export const TABLES = [
  "users",
  "friendRequests",
  "friendships",
  "conversations",
  "conversationMembers",
  "messages",
  "communities",
  "communityMembers",
  "posts",
  "comments",
  "likes",
  "tournaments",
  "tournamentParticipants",
  "notifications",
  "achievements",
  "userAchievements",
  "reports",
] as const;

export type TableName = (typeof TABLES)[number];
export type MemoryStore = Record<TableName, Row[]>;

const dataFile = ".data/playnexus.json";

function emptyStore(): MemoryStore {
  const s = {} as MemoryStore;
  for (const t of TABLES) s[t] = [];
  return s;
}

function load(): MemoryStore {
  const base = emptyStore();
  try {
    if (fs.existsSync(dataFile)) {
      const parsed = JSON.parse(fs.readFileSync(dataFile, "utf8"));
      for (const t of TABLES) {
        if (Array.isArray(parsed[t])) base[t] = parsed[t];
      }
      return base;
    }
  } catch {
    // Ignore a corrupt or unavailable local fallback store.
  }
  return base;
}

const g = globalThis as typeof globalThis & { __playnexusStore?: MemoryStore };

export function store(): MemoryStore {
  if (!g.__playnexusStore) g.__playnexusStore = load();
  return g.__playnexusStore;
}

export function persist() {
  try {
    fs.mkdirSync(".data", { recursive: true });
    fs.writeFileSync(dataFile, JSON.stringify(store()));
  } catch {
    // Ignore read-only or ephemeral filesystems such as Vercel's runtime.
  }
}

export function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
