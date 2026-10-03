import bcrypt from "bcryptjs";
import { find, insert, getMode, type Mode } from "@/lib/repo";

export const SEED_ACHIEVEMENTS = [
  { key: "first_post", title: "First Activity", description: "Created your first post on PlayNexus!", icon: "🎮", xpReward: 100 },
  { key: "tournament_winner", title: "Tournament Winner", description: "Placed 1st in a competitive tournament!", icon: "🏆", xpReward: 500 },
  { key: "first_friend", title: "Social Gamer", description: "Connected with another gamer on PlayNexus!", icon: "💬", xpReward: 100 },
  { key: "guild_member", title: "Community Star", description: "Joined a community or a group chat!", icon: "⭐", xpReward: 100 },
  { key: "streak_7", title: "7 Day Streak", description: "Maintained active status for 7 consecutive days!", icon: "🔥", xpReward: 250 },
  { key: "top_gamer", title: "Top Gamer", description: "Reach Level 10!", icon: "👑", xpReward: 1000 },
];

export const SEED_COMMUNITIES = [
  { name: "Valorant Community", slug: "valorant", description: "The ultimate hub for tactical shooter fans. Share clips, find teammates, and organize custom scrims.", gameName: "Valorant", banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800" },
  { name: "GTA V Online", slug: "gta-v", description: "Los Santos is waiting. Coordinate heists, show off custom rides, and recruit members for your crew.", gameName: "GTA V", banner: "https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=800" },
  { name: "Call of Duty: Warzone", slug: "cod-warzone", description: "Drop in, armor up, and survive. Share loadouts and search for tactical teammates.", gameName: "Call of Duty", banner: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800" },
  { name: "Minecraft Builders", slug: "minecraft", description: "Show off your creative megabuilds, share survival tips, and advertise servers.", gameName: "Minecraft", banner: "https://images.unsplash.com/photo-1605899435973-ca2d1a8861cf?q=80&w=800" },
  { name: "Counter-Strike 2", slug: "cs2", description: "Competitive tactical gaming circle. Discuss patch notes, smoke lineups, and trades.", gameName: "Counter-Strike", banner: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=800" },
  { name: "PUBG Mobile Squad", slug: "pubg", description: "Find squad mates, share chicken dinners and plan custom rooms.", gameName: "PUBG Mobile", banner: "https://images.unsplash.com/photo-1589241062272-c0a000072dfa?q=80&w=800" },
];

export const SEED_TOURNAMENTS = [
  {
    name: "PlayNexus Valorant Cup #1", game: "Valorant",
    banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800",
    description: "5v5 single-elimination bracket. Free entry, prizes include legendary ranks and platform recognition!",
    entryRequirement: "Level 1+ Gamer", maxPlayers: 16, startDate: "2026-11-15 18:00", endDate: "2026-11-17 22:00",
    prize: "1000 VP & 500 XP", rules: "Standard competitive settings. No toxic communication. Report scores with screenshots.",
    status: "upcoming", bracketData: "[]",
  },
  {
    name: "Minecraft MegaBuild Contest", game: "Minecraft",
    banner: "https://images.unsplash.com/photo-1605899435973-ca2d1a8861cf?q=80&w=800",
    description: "48 hours to build a masterpiece on our theme. Judged by the community.",
    entryRequirement: "Free Entry", maxPlayers: 32, startDate: "2026-12-01 12:00", endDate: "2026-12-03 12:00",
    prize: "Golden Builder Badge & 300 XP", rules: "Vanilla blocks only. No external mods.",
    status: "upcoming", bracketData: "[]",
  },
];

const g = globalThis as typeof globalThis & { __playnexusSeeded?: Partial<Record<Mode, boolean>> };

export async function ensureSeeded() {
  const mode = await getMode();
  g.__playnexusSeeded ??= {};
  if (g.__playnexusSeeded[mode]) return;
  try {
    const adminUsername = process.env.ADMIN_USERNAME?.trim().toLowerCase();
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminUsername && adminEmail && adminPassword && (await find("users", { username: adminUsername })).length === 0) {
      await insert("users", {
        username: adminUsername,
        displayName: "Nexus Administrator",
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPassword, 10),
        favoriteGame: "Valorant",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=admin",
        coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800",
        bio: "PlayNexus administrator.",
        gamingLevel: 10,
        xp: 9500,
        rank: "Gold I",
        onlineStatus: "offline",
        lastSeen: new Date(),
        joinedDate: new Date(),
        isAdmin: true,
      });
    }
    if ((await find("achievements")).length === 0) {
      for (const a of SEED_ACHIEVEMENTS) await insert("achievements", a);
    }
    if ((await find("communities")).length === 0) {
      for (const c of SEED_COMMUNITIES) await insert("communities", c);
    }
    if ((await find("tournaments")).length === 0) {
      for (const t of SEED_TOURNAMENTS) await insert("tournaments", t);
    }
    g.__playnexusSeeded[mode] = true;
  } catch (err: any) {
    console.warn("[PlayNexus] Seed skipped:", err?.message);
  }
}
