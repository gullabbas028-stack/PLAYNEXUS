"use server";

import { cookies, headers } from "next/headers";
import { find, findOne, insert, update, remove, getMode, modeLabel, S, type Row } from "@/lib/repo";
import {
  hashPassword,
  comparePassword,
  signToken,
  getSessionUser,
  rewardXp,
  unlockAchievement,
  publicUser,
  type SessionUser,
} from "@/lib/auth";
import { ensureSeeded, SEED_ACHIEVEMENTS } from "@/db/seeder";

type Id = number | string;
type Result = { success: boolean; error?: string; message?: any; [key: string]: any };
const ok = (extra: Record<string, any> = {}): Result => ({ success: true, ...extra });
const fail = (error: string): Result => ({ success: false, error });
const msgOf = (e: any) => e?.message || "Something went wrong";

async function setSessionCookie(user: Row) {
  const token = signToken({
    userId: user.id,
    username: user.username,
    email: user.email,
    isAdmin: !!user.isAdmin,
  });
  const cookieStore = await cookies();
  const h = await headers();
  const proto = h.get("x-forwarded-proto") || (h.get("origin")?.startsWith("https") ? "https" : "http");
  cookieStore.set("playnexus_token", token, {
    httpOnly: true,
    secure: proto.split(",")[0].trim() === "https",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

async function notify(userId: Id, type: string, message: string, sourceUserId?: Id | null, referenceId?: Id | null) {
  try {
    await insert("notifications", {
      userId,
      type,
      message,
      sourceUserId: sourceUserId ?? null,
      referenceId: referenceId ?? null,
      isRead: false,
    });
  } catch {
    // notifications are best-effort
  }
}

async function areFriends(a: Id, b: Id) {
  const x = await find("friendships", { userId1: a, userId2: b });
  if (x.length) return true;
  const y = await find("friendships", { userId1: b, userId2: a });
  return y.length > 0;
}

// ==========================================
// AUTH
// ==========================================

export async function registerAction(data: {
  username: string;
  displayName: string;
  email: string;
  passwordHash: string;
  favoriteGame: string;
}) {
  try {
    await ensureSeeded();
    const username = data.username.trim().toLowerCase();
    const email = data.email.trim().toLowerCase();
    const displayName = data.displayName.trim();

    if (!username || !email || !data.passwordHash || !displayName) return fail("All fields are required");
    if (!/^[a-z0-9_.]{3,20}$/.test(username)) return fail("Username must be 3-20 chars: letters, numbers, _ or .");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Please enter a valid email");
    if (data.passwordHash.length < 6) return fail("Password must be at least 6 characters");

    if (await findOne("users", { username })) return fail("Username already exists");
    if (await findOne("users", { email })) return fail("Email already exists");

    const user = await insert("users", {
      username,
      displayName,
      email,
      passwordHash: await hashPassword(data.passwordHash),
      favoriteGame: data.favoriteGame || "All Games",
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      coverImage: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1200",
      bio: `Hello, I'm ${displayName}! Let's connect and play.`,
      gamingLevel: 1,
      xp: 0,
      rank: "Bronze I",
      onlineStatus: "online",
      lastSeen: new Date(),
      joinedDate: new Date(),
      isAdmin: false,
    });

    await rewardXp(user.id, 100);
    await setSessionCookie(user);
    return ok({ user: publicUser(user) });
  } catch (e) {
    return fail(msgOf(e));
  }
}

export async function loginAction(data: { loginInput: string; passwordHash: string }) {
  try {
    await ensureSeeded();
    const input = data.loginInput.trim().toLowerCase();
    if (!input || !data.passwordHash) return fail("Username/Email and Password are required");

    const user = input.includes("@")
      ? await findOne("users", { email: input })
      : await findOne("users", { username: input });

    if (!user || !(await comparePassword(data.passwordHash, user.passwordHash))) {
      return fail("Invalid login: wrong username/email or password");
    }

    await update("users", { id: user.id }, { onlineStatus: "online", lastSeen: new Date() });
    await setSessionCookie(user);
    return ok({ user: publicUser(user) });
  } catch (e) {
    return fail(msgOf(e));
  }
}

export async function logoutAction() {
  try {
    const me = await getSessionUser();
    if (me) await update("users", { id: me.id }, { onlineStatus: "offline", lastSeen: new Date() });
  } catch {
    // ignore
  }
  const cookieStore = await cookies();
  cookieStore.delete("playnexus_token");
  return ok();
}

export async function updateProfileAction(data: {
  displayName: string;
  bio: string;
  favoriteGame: string;
  avatar: string;
  coverImage: string;
}) {
  try {
    const me = await getSessionUser();
    if (!me) return fail("Unauthorized");
    if (!data.displayName.trim()) return fail("Display name cannot be empty");
    await update("users", { id: me.id }, {
      displayName: data.displayName.trim().slice(0, 40),
      bio: data.bio.trim().slice(0, 300),
      favoriteGame: data.favoriteGame || "All Games",
      avatar: data.avatar || me.avatar,
      coverImage: data.coverImage || me.coverImage,
    });
    return ok();
  } catch (e) {
    return fail(msgOf(e));
  }
}

// ==========================================
// FRIENDS
// ==========================================

export async function sendFriendRequestAction(receiverId: Id) {
  try {
    const me = await getSessionUser();
    if (!me) return fail("Unauthorized");
    if (S(receiverId) === me.id) return fail("You cannot add yourself");
    const target = await findOne("users", { id: receiverId });
    if (!target) return fail("User not found");
    if (await areFriends(me.id, target.id)) return fail("You are already friends");

    const mine = await find("friendRequests", { senderId: me.id, receiverId: target.id });
    if (mine.some((r) => r.status === "pending")) return fail("Friend request already exists");

    // If they already requested me, accept instead
    const theirs = (await find("friendRequests", { senderId: target.id, receiverId: me.id })).find(
      (r) => r.status === "pending"
    );
    if (theirs) return acceptFriendRequestAction(theirs.id);

    for (const r of mine) await remove("friendRequests", { id: r.id });
    await insert("friendRequests", { senderId: me.id, receiverId: target.id, status: "pending" });
    await notify(target.id, "friend_request", `🎮 ${me.displayName} sent you a friend request!`, me.id);
    return ok({ message: "Friend request sent!" });
  } catch (e) {
    return fail(msgOf(e));
  }
}

export async function acceptFriendRequestAction(requestId: Id) {
  try {
    const me = await getSessionUser();
    if (!me) return fail("Unauthorized");
    const req = await findOne("friendRequests", { id: requestId });
    if (!req || req.receiverId !== me.id) return fail("Friend request not found");

    await update("friendRequests", { id: req.id }, { status: "accepted" });
    if (!(await areFriends(req.senderId, me.id))) {
      await insert("friendships", { userId1: req.senderId, userId2: me.id });
    }
    await notify(req.senderId, "friend_accepted", `⚡ ${me.displayName} accepted your friend request!`, me.id);
    await unlockAchievement(me.id, "first_friend");
    await unlockAchievement(req.senderId, "first_friend");
    return ok({ message: "Friend request accepted!" });
  } catch (e) {
    return fail(msgOf(e));
  }
}

export async function rejectFriendRequestAction(requestId: Id) {
  try {
    const me = await getSessionUser();
    if (!me) return fail("Unauthorized");
    const req = await findOne("friendRequests", { id: requestId });
    if (!req || (req.receiverId !== me.id && req.senderId !== me.id)) return fail("Friend request not found");
    await remove("friendRequests", { id: req.id });
    return ok();
  } catch (e) {
    return fail(msgOf(e));
  }
}

export async function removeFriendAction(friendUserId: Id) {
  try {
    const me = await getSessionUser();
    if (!me) return fail("Unauthorized");
    await remove("friendships", { userId1: me.id, userId2: friendUserId });
    await remove("friendships", { userId1: friendUserId, userId2: me.id });
    await remove("friendRequests", { senderId: me.id, receiverId: friendUserId });
    await remove("friendRequests", { senderId: friendUserId, receiverId: me.id });
    return ok();
  } catch (e) {
    return fail(msgOf(e));
  }
}

// ==========================================
// POSTS / COMMENTS / LIKES
// ==========================================

export async function createPostAction(data: { text: string; imageUrl?: string; videoUrl?: string; communityId?: Id }) {
  try {
    const me = await getSessionUser();
    if (!me) return fail("Unauthorized");
    const text = data.text.trim();
    if (!text) return fail("Post content cannot be empty");
    if (text.length > 2000) return fail("Post is too long (max 2000 characters)");
    const post = await insert("posts", {
      authorId: me.id,
      communityId: data.communityId ?? null,
      text,
      imageUrl: data.imageUrl || "",
      videoUrl: data.videoUrl || "",
    });
    await rewardXp(me.id, 50);
    await unlockAchievement(me.id, "first_post");
    return ok({ post });
  } catch (e) {
    return fail(msgOf(e));
  }
}

export async function deletePostAction(postId: Id) {
  try {
    const me = await getSessionUser();
    if (!me) return fail("Unauthorized");
    const post = await findOne("posts", { id: postId });
    if (!post) return fail("Post not found");
    if (post.authorId !== me.id && !me.isAdmin) return fail("Forbidden");
    await remove("comments", { postId: post.id });
    await remove("likes", { postId: post.id });
    await remove("posts", { id: post.id });
    return ok();
  } catch (e) {
    return fail(msgOf(e));
  }
}

export async function addCommentAction(postId: Id, commentText: string) {
  try {
    const me = await getSessionUser();
    if (!me) return fail("Unauthorized");
    const text = commentText.trim();
    if (!text) return fail("Comment text is required");
    const post = await findOne("posts", { id: postId });
    if (!post) return fail("Post not found");
    const comment = await insert("comments", { postId: post.id, authorId: me.id, text: text.slice(0, 1000) });
    await rewardXp(me.id, 15);
    if (post.authorId !== me.id) {
      await notify(post.authorId, "post_comment", `💬 ${me.displayName} commented: "${text.slice(0, 40)}"`, me.id, post.id);
    }
    return ok({ comment });
  } catch (e) {
    return fail(msgOf(e));
  }
}

export async function deleteCommentAction(commentId: Id) {
  try {
    const me = await getSessionUser();
    if (!me) return fail("Unauthorized");
    const c = await findOne("comments", { id: commentId });
    if (!c) return fail("Comment not found");
    if (c.authorId !== me.id && !me.isAdmin) return fail("Forbidden");
    await remove("comments", { id: c.id });
    return ok();
  } catch (e) {
    return fail(msgOf(e));
  }
}

export async function toggleLikePostAction(postId: Id) {
  try {
    const me = await getSessionUser();
    if (!me) return fail("Unauthorized");
    const post = await findOne("posts", { id: postId });
    if (!post) return fail("Post not found");
    const existing = await find("likes", { postId: post.id, userId: me.id });
    if (existing.length) {
      await remove("likes", { postId: post.id, userId: me.id });
      return ok({ liked: false });
    }
    await insert("likes", { postId: post.id, userId: me.id });
    if (post.authorId !== me.id) {
      await rewardXp(post.authorId, 10);
      await notify(post.authorId, "post_like", `🔥 ${me.displayName} liked your post!`, me.id, post.id);
    }
    return ok({ liked: true });
  } catch (e) {
    return fail(msgOf(e));
  }
}

// ==========================================
// COMMUNITIES
// ==========================================

export async function createCommunityAction(data: { name: string; description: string; gameName: string; banner?: string }) {
  try {
    const me = await getSessionUser();
    if (!me) return fail("Unauthorized");
    if (!data.name.trim() || !data.description.trim() || !data.gameName.trim()) {
      return fail("Name, description and game are required");
    }
    const slug = data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (await findOne("communities", { slug })) return fail("A community with this name already exists");
    const community = await insert("communities", {
      name: data.name.trim(),
      slug,
      description: data.description.trim(),
      gameName: data.gameName.trim(),
      banner: data.banner || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800",
    });
    await insert("communityMembers", { communityId: community.id, userId: me.id });
    return ok({ community });
  } catch (e) {
    return fail(msgOf(e));
  }
}

export async function joinLeaveCommunityAction(communityId: Id) {
  try {
    const me = await getSessionUser();
    if (!me) return fail("Unauthorized");
    const existing = await find("communityMembers", { communityId, userId: me.id });
    if (existing.length) {
      await remove("communityMembers", { communityId, userId: me.id });
      return ok({ joined: false });
    }
    await insert("communityMembers", { communityId, userId: me.id });
    await rewardXp(me.id, 20);
    await unlockAchievement(me.id, "guild_member");
    return ok({ joined: true });
  } catch (e) {
    return fail(msgOf(e));
  }
}

// ==========================================
// TOURNAMENTS
// ==========================================

export async function createTournamentAction(data: {
  name: string;
  game: string;
  description: string;
  entryRequirement: string;
  maxPlayers: number;
  startDate: string;
  endDate: string;
  prize: string;
  rules: string;
  banner?: string;
}) {
  try {
    const me = await getSessionUser();
    if (!me) return fail("Unauthorized");
    if (!data.name.trim() || !data.game.trim() || !data.description.trim() || !data.rules.trim() || !data.startDate) {
      return fail("Please fill all required tournament fields");
    }
    const tournament = await insert("tournaments", {
      name: data.name.trim(),
      game: data.game.trim(),
      description: data.description.trim(),
      entryRequirement: data.entryRequirement || "Free",
      maxPlayers: Math.max(2, Number(data.maxPlayers) || 16),
      startDate: data.startDate,
      endDate: data.endDate || data.startDate,
      prize: data.prize || "Trophy",
      rules: data.rules.trim(),
      banner: data.banner || "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800",
      status: "upcoming",
      bracketData: "[]",
      createdBy: me.id,
    });
    return ok({ tournament });
  } catch (e) {
    return fail(msgOf(e));
  }
}

export async function joinTournamentAction(tournamentId: Id, teamName: string) {
  try {
    const me = await getSessionUser();
    if (!me) return fail("Unauthorized");
    const t = await findOne("tournaments", { id: tournamentId });
    if (!t) return fail("Tournament not found");
    if (t.status === "completed") return fail("This tournament has ended");
    const parts = await find("tournamentParticipants", { tournamentId: t.id });
    if (parts.some((p) => p.userId === me.id)) return fail("Already joined");
    if (parts.length >= Number(t.maxPlayers)) return fail("Tournament full");
    await insert("tournamentParticipants", {
      tournamentId: t.id,
      userId: me.id,
      teamName: teamName.trim() || `${me.displayName}'s Team`,
      score: 0,
    });
    await rewardXp(me.id, 50);
    await notify(me.id, "tournament_invite", `🏆 You joined "${t.name}". Good luck!`, null, t.id);
    return ok();
  } catch (e) {
    return fail(msgOf(e));
  }
}

export async function leaveTournamentAction(tournamentId: Id) {
  try {
    const me = await getSessionUser();
    if (!me) return fail("Unauthorized");
    await remove("tournamentParticipants", { tournamentId, userId: me.id });
    return ok();
  } catch (e) {
    return fail(msgOf(e));
  }
}

export async function updateTournamentResultsAction(tournamentId: Id, bracketDataJson: string, status?: string) {
  try {
    const me = await getSessionUser();
    if (!me) return fail("Unauthorized");
    const t = await findOne("tournaments", { id: tournamentId });
    if (!t) return fail("Tournament not found");
    if (t.createdBy !== me.id && !me.isAdmin) return fail("Only the organizer or an admin can update results");
    const values: Row = {};
    if (!(bracketDataJson === "[]" && status)) values.bracketData = bracketDataJson;
    if (status) values.status = status;
    await update("tournaments", { id: t.id }, values);
    if (status === "completed") {
      for (const p of await find("tournamentParticipants", { tournamentId: t.id })) {
        await notify(p.userId, "tournament_result", `🏁 "${t.name}" has concluded! Check the results.`, null, t.id);
      }
    }
    return ok();
  } catch (e) {
    return fail(msgOf(e));
  }
}

export async function adminAwardWinnerAction(tournamentId: Id, winnerUserId: Id) {
  try {
    const me = await getSessionUser();
    if (!me) return fail("Unauthorized");
    const t = await findOne("tournaments", { id: tournamentId });
    if (!t) return fail("Tournament not found");
    if (t.createdBy !== me.id && !me.isAdmin) return fail("Only the organizer or an admin can declare winners");
    await update("tournamentParticipants", { tournamentId: t.id, userId: winnerUserId }, { placement: 1 });
    await rewardXp(winnerUserId, 500);
    await unlockAchievement(winnerUserId, "tournament_winner");
    await notify(winnerUserId, "tournament_result", `🏆 You won "${t.name}"! (+500 XP)`, me.id, t.id);
    return ok();
  } catch (e) {
    return fail(msgOf(e));
  }
}

// ==========================================
// CHAT (DM + GROUPS)
// ==========================================

export async function createConversationAction(data: {
  targetUserId?: Id;
  isGroup: boolean;
  groupName?: string;
  groupDescription?: string;
  groupImage?: string;
  memberIds?: Id[];
}) {
  try {
    const me = await getSessionUser();
    if (!me) return fail("Unauthorized");

    if (!data.isGroup) {
      if (!data.targetUserId) return fail("Recipient is required");
      const target = await findOne("users", { id: data.targetUserId });
      if (!target) return fail("User not found");
      if (target.id === me.id) return fail("You cannot message yourself");

      // Reuse an existing DM between the two users
      const myMemberships = await find("conversationMembers", { userId: me.id });
      for (const m of myMemberships) {
        const conv = await findOne("conversations", { id: m.conversationId });
        if (!conv || conv.isGroup) continue;
        const other = await find("conversationMembers", { conversationId: conv.id, userId: target.id });
        if (other.length) return ok({ conversationId: conv.id as Id });
      }

      const conv = await insert("conversations", {
        isGroup: false,
        name: null,
        groupImage: "",
        groupDescription: "",
        createdBy: me.id,
      });
      await insert("conversationMembers", { conversationId: conv.id, userId: me.id, role: "admin" });
      await insert("conversationMembers", { conversationId: conv.id, userId: target.id, role: "member" });
      return ok({ conversationId: conv.id as Id });
    }

    const name = data.groupName?.trim();
    if (!name) return fail("Group name is required");
    const conv = await insert("conversations", {
      isGroup: true,
      name,
      groupDescription: data.groupDescription?.trim() || "A gaming crew group chat.",
      groupImage: data.groupImage || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`,
      createdBy: me.id,
    });
    await insert("conversationMembers", { conversationId: conv.id, userId: me.id, role: "admin" });
    const unique = Array.from(new Set((data.memberIds || []).map((x) => String(x)))).filter((x) => x !== me.id);
    for (const uid of unique) {
      if (!(await findOne("users", { id: uid }))) continue;
      await insert("conversationMembers", { conversationId: conv.id, userId: uid, role: "member" });
      await notify(uid, "group_invite", `💬 ${me.displayName} added you to "${name}"`, me.id, conv.id);
    }
    await unlockAchievement(me.id, "guild_member");
    return ok({ conversationId: conv.id as Id });
  } catch (e) {
    return fail(msgOf(e));
  }
}

export async function sendMessageAction(data: { conversationId: Id; text: string; attachmentUrl?: string; replyToId?: Id }) {
  try {
    const me = await getSessionUser();
    if (!me) return fail("Unauthorized");
    const text = (data.text || "").trim();
    if (!text && !data.attachmentUrl) return fail("Message cannot be empty");

    const members = await find("conversationMembers", { conversationId: data.conversationId });
    if (!members.some((m) => m.userId === me.id)) return fail("You are not part of this chat");

    const message = await insert("messages", {
      conversationId: data.conversationId,
      senderId: me.id,
      text: text.slice(0, 4000),
      attachmentUrl: data.attachmentUrl || "",
      replyToId: data.replyToId ?? null,
      isSeen: false,
    });

    for (const m of members) {
      if (m.userId === me.id) continue;
      await notify(m.userId, "new_message", `✉️ ${me.displayName}: "${(text || "📎 Attachment").slice(0, 40)}"`, me.id, data.conversationId);
    }
    return ok({ message });
  } catch (e) {
    return fail(msgOf(e));
  }
}

export async function markConversationSeenAction(conversationId: Id) {
  try {
    const me = await getSessionUser();
    if (!me) return fail("Unauthorized");
    const members = await find("conversationMembers", { conversationId });
    if (!members.some((m) => m.userId === me.id)) return fail("Forbidden");
    const unseen = (await find("messages", { conversationId, isSeen: false })).filter((m) => m.senderId !== me.id);
    for (const m of unseen) await update("messages", { id: m.id }, { isSeen: true });
    return ok({ updated: unseen.length });
  } catch (e) {
    return fail(msgOf(e));
  }
}

export async function deleteMessageAction(messageId: Id) {
  try {
    const me = await getSessionUser();
    if (!me) return fail("Unauthorized");
    const m = await findOne("messages", { id: messageId });
    if (!m) return fail("Message not found");
    if (m.senderId !== me.id && !me.isAdmin) return fail("Forbidden");
    await remove("messages", { id: m.id });
    return ok();
  } catch (e) {
    return fail(msgOf(e));
  }
}

// ==========================================
// REPORTS / ADMIN / NOTIFICATIONS
// ==========================================

export async function reportItemAction(data: {
  targetType: "user" | "post" | "comment" | "message";
  targetId: Id;
  reason: string;
  description: string;
}) {
  try {
    const me = await getSessionUser();
    if (!me) return fail("Unauthorized");
    await insert("reports", {
      reporterId: me.id,
      targetType: data.targetType,
      targetId: data.targetId,
      reason: data.reason,
      description: (data.description || "").trim(),
      status: "pending",
    });
    return ok();
  } catch (e) {
    return fail(msgOf(e));
  }
}

export async function adminBanDeleteUserAction(userId: Id, action: "ban" | "delete" | "make_admin") {
  try {
    const me = await getSessionUser();
    if (!me || !me.isAdmin) return fail("Forbidden: admins only");
    if (S(userId) === me.id) return fail("You cannot do this to yourself");
    if (action === "make_admin") {
      await update("users", { id: userId }, { isAdmin: true });
      return ok({ message: "User promoted to admin" });
    }
    await remove("posts", { authorId: userId });
    await remove("friendships", { userId1: userId });
    await remove("friendships", { userId2: userId });
    await remove("conversationMembers", { userId });
    await remove("users", { id: userId });
    return ok({ message: action === "ban" ? "User banned" : "User deleted" });
  } catch (e) {
    return fail(msgOf(e));
  }
}

export async function adminDeletePostAction(postId: Id) {
  return deletePostAction(postId);
}

export async function adminResolveReportAction(reportId: Id) {
  try {
    const me = await getSessionUser();
    if (!me || !me.isAdmin) return fail("Forbidden: admins only");
    await update("reports", { id: reportId }, { status: "resolved" });
    return ok();
  } catch (e) {
    return fail(msgOf(e));
  }
}

export async function clearNotificationsAction() {
  try {
    const me = await getSessionUser();
    if (!me) return fail("Unauthorized");
    await remove("notifications", { userId: me.id });
    return ok();
  } catch (e) {
    return fail(msgOf(e));
  }
}

export async function markNotificationsReadAction() {
  try {
    const me = await getSessionUser();
    if (!me) return fail("Unauthorized");
    await update("notifications", { userId: me.id }, { isRead: true });
    return ok();
  } catch (e) {
    return fail(msgOf(e));
  }
}

// ==========================================
// DATA ASSEMBLY
// ==========================================

const time = (d: any) => (d ? new Date(d).getTime() || 0 : 0);

function hydrate(raw: Record<string, Row[]>, me: SessionUser | null, dbType: string) {
  const now = Date.now();
  const users = raw.users
    .map((u) => {
      const p = publicUser(u);
      const fresh = now - time(p.lastSeen) < 90000;
      return { ...p, email: undefined, onlineStatus: p.onlineStatus === "online" && fresh ? "online" : "offline" };
    })
    .sort((a, b) => b.xp - a.xp);

  const userMap = new Map(users.map((u) => [u.id, u]));
  const getUser = (id: any) =>
    userMap.get(S(id) as string) || {
      id: S(id),
      username: "deleted_user",
      displayName: "Deleted User",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=deleted",
      coverImage: "",
      bio: "",
      gamingLevel: 1,
      xp: 0,
      rank: "—",
      onlineStatus: "offline",
      isAdmin: false,
    };

  const posts = raw.posts
    .map((p): Row => ({ ...p, author: getUser(p.authorId) }))
    .sort((a, b) => time(b.createdAt) - time(a.createdAt));
  const comments = raw.comments
    .map((c): Row => ({ ...c, author: getUser(c.authorId) }))
    .sort((a, b) => time(a.createdAt) - time(b.createdAt));

  const achievements = raw.achievements.length
    ? raw.achievements
    : SEED_ACHIEVEMENTS.map((a, i) => ({ ...a, id: String(i + 1) }));

  let friendRequests: Row[] = [];
  let friendships: Row[] = [];
  let notifications: Row[] = [];
  let conversations: Row[] = [];
  let earnedAchievements: Row[] = [];
  let reports: Row[] = [];

  if (me) {
    friendRequests = raw.friendRequests.filter((r) => r.senderId === me.id || r.receiverId === me.id);
    friendships = raw.friendships.filter((f) => f.userId1 === me.id || f.userId2 === me.id);
    notifications = raw.notifications
      .filter((n) => n.userId === me.id)
      .sort((a, b) => time(b.createdAt) - time(a.createdAt))
      .slice(0, 100);
    earnedAchievements = raw.userAchievements.filter((ua) => ua.userId === me.id);
    if (me.isAdmin) reports = raw.reports.sort((a, b) => time(b.createdAt) - time(a.createdAt));

    const myConvIds = new Set(raw.conversationMembers.filter((m) => m.userId === me.id).map((m) => m.conversationId));
    conversations = raw.conversations
      .filter((c) => myConvIds.has(c.id))
      .map((c) => {
        const members = raw.conversationMembers
          .filter((m) => m.conversationId === c.id)
          .map((m) => ({ ...m, user: getUser(m.userId) }));
        const messages = raw.messages
          .filter((m) => m.conversationId === c.id)
          .sort((a, b) => time(b.createdAt) - time(a.createdAt))
          .slice(0, 200);
        return { ...c, name: c.name || null, members, messages } as Row;
      })
      .sort(
        (a, b) =>
          time(b.messages[0]?.createdAt || b.createdAt) - time(a.messages[0]?.createdAt || a.createdAt)
      );
  }

  return {
    dbConnected: true,
    dbType,
    me,
    users,
    communities: raw.communities.sort((a, b) => time(b.createdAt) - time(a.createdAt)),
    communityMembers: raw.communityMembers,
    posts,
    comments,
    likes: raw.likes,
    tournaments: raw.tournaments.sort((a, b) => time(b.createdAt) - time(a.createdAt)),
    tournamentParticipants: raw.tournamentParticipants,
    achievements,
    friendRequests,
    friendships,
    notifications,
    conversations,
    earnedAchievements,
    reports,
  };
}

const ALL_TABLES = [
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

export async function getPlayNexusData() {
  try {
    await ensureSeeded();
    const mode = await getMode();
    const me = await getSessionUser();
    const results = await Promise.all(ALL_TABLES.map((t) => find(t).catch(() => [] as Row[])));
    const raw: Record<string, Row[]> = {};
    ALL_TABLES.forEach((t, i) => (raw[t] = results[i]));
    return hydrate(raw, me, modeLabel(mode));
  } catch (e) {
    console.warn("[PlayNexus] getPlayNexusData failed:", msgOf(e));
    return hydrate(
      Object.fromEntries(ALL_TABLES.map((t) => [t, [] as Row[]])),
      null,
      "Offline"
    );
  }
}
