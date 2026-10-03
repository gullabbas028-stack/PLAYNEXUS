import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { find, findOne, insert, update, S, type Row } from "@/lib/repo";

function jwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET must be configured");
  return secret;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: number | string; username: string; email: string; isAdmin: boolean }) {
  return jwt.sign({ ...payload, userId: String(payload.userId) }, jwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, jwtSecret()) as { userId: string; username: string; email: string; isAdmin: boolean };
  } catch {
    return null;
  }
}

export function rankFor(level: number) {
  if (level >= 50) return "Predator";
  if (level >= 30) return "Diamond I";
  if (level >= 20) return "Platinum I";
  if (level >= 15) return "Gold II";
  if (level >= 10) return "Gold I";
  if (level >= 7) return "Silver II";
  if (level >= 4) return "Silver I";
  if (level >= 2) return "Bronze II";
  return "Bronze I";
}

export function publicUser(u: Row) {
  return {
    id: S(u.id) as string,
    username: u.username,
    displayName: u.displayName || u.username,
    email: u.email,
    favoriteGame: u.favoriteGame || "All Games",
    avatar: u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`,
    coverImage: u.coverImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800",
    bio: u.bio || "",
    gamingLevel: Number(u.gamingLevel) || 1,
    xp: Number(u.xp) || 0,
    rank: u.rank || "Bronze I",
    onlineStatus: u.onlineStatus || "offline",
    lastSeen: u.lastSeen || null,
    joinedDate: u.joinedDate || u.createdAt || null,
    isAdmin: !!u.isAdmin,
  };
}

export type SessionUser = ReturnType<typeof publicUser>;

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("playnexus_token")?.value;
    if (!token) return null;
    const decoded = verifyToken(token);
    if (!decoded) return null;

    const u = await findOne("users", { id: decoded.userId });
    if (!u) return null;

    // Heartbeat: refresh presence at most every 20s
    const last = u.lastSeen ? new Date(u.lastSeen).getTime() : 0;
    if (Date.now() - last > 20000 || u.onlineStatus !== "online") {
      await update("users", { id: u.id }, { onlineStatus: "online", lastSeen: new Date() }).catch(() => {});
    }
    return publicUser({ ...u, onlineStatus: "online", lastSeen: new Date() });
  } catch {
    return null;
  }
}

export async function rewardXp(userId: number | string, xpAmount: number) {
  try {
    const u = await findOne("users", { id: userId });
    if (!u) return null;
    const xp = (Number(u.xp) || 0) + xpAmount;
    const gamingLevel = Math.floor(xp / 1000) + 1;
    const rank = rankFor(gamingLevel);
    await update("users", { id: u.id }, { xp, gamingLevel, rank });
    if (gamingLevel >= 10) await unlockAchievement(u.id, "top_gamer");
    return { xp, gamingLevel, rank };
  } catch {
    return null;
  }
}

export async function unlockAchievement(userId: number | string, key: string) {
  try {
    const ach = await findOne("achievements", { key });
    if (!ach) return;
    const already = await find("userAchievements", { userId, achievementId: ach.id });
    if (already.length) return;
    await insert("userAchievements", { userId, achievementId: ach.id, unlockedAt: new Date() });
    await rewardXp(userId, Number(ach.xpReward) || 0);
    await insert("notifications", {
      userId,
      type: "achievement_unlocked",
      message: `🏆 Unlocked Achievement: "${ach.title}"! (+${ach.xpReward} XP)`,
      isRead: false,
    });
  } catch {
    // ignore
  }
}
