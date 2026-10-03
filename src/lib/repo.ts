import mongoose from "mongoose";
import { and, eq } from "drizzle-orm";
import { db, isPostgresAvailable } from "@/db";
import * as schema from "@/db/schema";
import * as M from "@/db/mongodb";
import { store, persist, newId, type Row, type TableName } from "@/lib/store";

export type { Row, TableName };
export type Mode = "mongo" | "pg" | "memory";

const pgTables: Record<TableName, any> = {
  users: schema.users,
  friendRequests: schema.friendRequests,
  friendships: schema.friendships,
  conversations: schema.conversations,
  conversationMembers: schema.conversationMembers,
  messages: schema.messages,
  communities: schema.communities,
  communityMembers: schema.communityMembers,
  posts: schema.posts,
  comments: schema.comments,
  likes: schema.likes,
  tournaments: schema.tournaments,
  tournamentParticipants: schema.tournamentParticipants,
  notifications: schema.notifications,
  achievements: schema.achievements,
  userAchievements: schema.userAchievements,
  reports: schema.reports,
};

const mongoModels: Record<TableName, any> = {
  users: M.MongoUser,
  friendRequests: M.MongoFriendRequest,
  friendships: M.MongoFriendship,
  conversations: M.MongoConversation,
  conversationMembers: M.MongoConversationMember,
  messages: M.MongoMessage,
  communities: M.MongoCommunity,
  communityMembers: M.MongoCommunityMember,
  posts: M.MongoPost,
  comments: M.MongoComment,
  likes: M.MongoLike,
  tournaments: M.MongoTournament,
  tournamentParticipants: M.MongoTournamentParticipant,
  notifications: M.MongoNotification,
  achievements: M.MongoAchievement,
  userAchievements: M.MongoUserAchievement,
  reports: M.MongoReport,
};

// ---------- Mode detection (cached) ----------
const g = globalThis as typeof globalThis & { __playnexusMode?: { m: Mode; t: number } };

export async function getMode(): Promise<Mode> {
  const now = Date.now();
  if (g.__playnexusMode && now - g.__playnexusMode.t < 30000) return g.__playnexusMode.m;
  let m: Mode = "memory";
  const gm = g as typeof g & { __playnexusMongoFailAt?: number };
  const mongoCooldown = gm.__playnexusMongoFailAt && now - gm.__playnexusMongoFailAt < 120000;
  if (process.env.MONGO_URI && !mongoCooldown) {
    if (await M.isMongoAvailable()) m = "mongo";
    else gm.__playnexusMongoFailAt = now;
  }
  if (m === "memory" && (await isPostgresAvailable())) m = "pg";
  if (!g.__playnexusMode || g.__playnexusMode.m !== m) {
    console.log(`⚡ [PlayNexus] Data backend: ${m === "mongo" ? "MongoDB Atlas" : m === "pg" ? "PostgreSQL" : "Local file store (.data/playnexus.json)"}`);
  }
  g.__playnexusMode = { m, t: now };
  return m;
}

export function modeLabel(m: Mode) {
  return m === "mongo" ? "MongoDB Atlas" : m === "pg" ? "PostgreSQL" : "Local Store";
}

// ---------- Helpers ----------
export function isIdKey(k: string) {
  return k === "id" || k.endsWith("Id") || k === "userId1" || k === "userId2" || k === "createdBy";
}

export function S(v: any): string | null {
  return v === null || v === undefined ? null : String(v);
}

export function normalize(r: Row): Row {
  const o: Row = { ...r };
  if (o._id !== undefined) {
    o.id = String(o._id);
    delete o._id;
  }
  delete o.__v;
  for (const k of Object.keys(o)) {
    if (isIdKey(k) && o[k] !== null && o[k] !== undefined) o[k] = String(o[k]);
  }
  return o;
}

function pgConds(table: any, filter: Row): any[] | null {
  const conds: any[] = [];
  for (const [k, v] of Object.entries(filter)) {
    if (!table[k]) continue;
    let val: any = v;
    if (isIdKey(k)) {
      val = Number(v);
      if (!Number.isFinite(val)) return null; // cannot match in pg
    }
    conds.push(eq(table[k], val));
  }
  return conds;
}

function toPg(values: Row): Row {
  const o: Row = {};
  for (const [k, v] of Object.entries(values)) {
    if (k === "id") continue;
    if (isIdKey(k)) {
      const n = v === null || v === undefined ? null : Number(v);
      o[k] = n !== null && Number.isFinite(n) ? n : null;
    } else o[k] = v;
  }
  return o;
}

function mongoFilter(filter: Row): Row | null {
  const o: Row = {};
  for (const [k, v] of Object.entries(filter)) {
    if (k === "id") {
      if (!mongoose.isValidObjectId(String(v))) return null;
      o._id = String(v);
    } else o[k] = isIdKey(k) && v !== null && v !== undefined ? String(v) : v;
  }
  return o;
}

function toMongo(values: Row): Row {
  const o: Row = {};
  for (const [k, v] of Object.entries(values)) {
    if (k === "id") continue;
    o[k] = isIdKey(k) && v !== null && v !== undefined ? String(v) : v;
  }
  return o;
}

function matches(r: Row, filter: Row) {
  return Object.entries(filter).every(([k, v]) =>
    isIdKey(k) ? S(r[k]) === S(v) : r[k] === v
  );
}

// ---------- CRUD ----------
export async function find(t: TableName, filter: Row = {}): Promise<Row[]> {
  const mode = await getMode();
  if (mode === "pg") {
    const table = pgTables[t];
    const conds = pgConds(table, filter);
    if (conds === null) return [];
    const rows = conds.length
      ? await db.select().from(table).where(and(...conds))
      : await db.select().from(table);
    return (rows as Row[]).map(normalize);
  }
  if (mode === "mongo") {
    const f = mongoFilter(filter);
    if (f === null) return [];
    const rows = await mongoModels[t].find(f).lean();
    return (rows as Row[]).map(normalize);
  }
  return store()[t].filter((r) => matches(r, filter)).map(normalize);
}

export async function findOne(t: TableName, filter: Row): Promise<Row | null> {
  const rows = await find(t, filter);
  return rows[0] ?? null;
}

export async function insert(t: TableName, values: Row): Promise<Row> {
  const mode = await getMode();
  if (mode === "pg") {
    const rows = (await db.insert(pgTables[t]).values(toPg(values) as any).returning()) as Row[];
    return normalize(rows[0]);
  }
  if (mode === "mongo") {
    const doc = await mongoModels[t].create(toMongo(values));
    return normalize(doc.toObject());
  }
  const now = new Date().toISOString();
  const row: Row = { id: newId(), createdAt: now, ...toMongo(values) };
  store()[t].push(row);
  persist();
  return normalize(row);
}

export async function update(t: TableName, filter: Row, values: Row): Promise<void> {
  if (Object.keys(filter).length === 0) throw new Error("Refusing unfiltered update");
  const mode = await getMode();
  if (mode === "pg") {
    const conds = pgConds(pgTables[t], filter);
    if (!conds || conds.length === 0) return;
    await db.update(pgTables[t]).set(toPg(values) as any).where(and(...conds));
    return;
  }
  if (mode === "mongo") {
    const f = mongoFilter(filter);
    if (!f) return;
    await mongoModels[t].updateMany(f, toMongo(values));
    return;
  }
  for (const r of store()[t]) if (matches(r, filter)) Object.assign(r, toMongo(values));
  persist();
}

export async function remove(t: TableName, filter: Row): Promise<void> {
  if (Object.keys(filter).length === 0) throw new Error("Refusing unfiltered delete");
  const mode = await getMode();
  if (mode === "pg") {
    const conds = pgConds(pgTables[t], filter);
    if (!conds || conds.length === 0) return;
    await db.delete(pgTables[t]).where(and(...conds));
    return;
  }
  if (mode === "mongo") {
    const f = mongoFilter(filter);
    if (!f) return;
    await mongoModels[t].deleteMany(f);
    return;
  }
  const s = store();
  s[t] = s[t].filter((r) => !matches(r, filter));
  persist();
}
