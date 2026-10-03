import { pgTable, serial, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";

// 1. Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  favoriteGame: text("favorite_game").default("All Games").notNull(),
  avatar: text("avatar").default("").notNull(),
  coverImage: text("cover_image").default("").notNull(),
  bio: text("bio").default("").notNull(),
  gamingLevel: integer("gaming_level").default(1).notNull(),
  xp: integer("xp").default(0).notNull(),
  rank: text("rank").default("Bronze I").notNull(),
  onlineStatus: text("online_status").default("offline").notNull(),
  lastSeen: timestamp("last_seen").defaultNow().notNull(),
  joinedDate: timestamp("joined_date").defaultNow().notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

// 2. Friend Requests Table
export const friendRequests = pgTable("friend_requests", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  receiverId: integer("receiver_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  status: text("status").default("pending").notNull(), // 'pending', 'accepted', 'rejected'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Active Friendships Table
export const friendships = pgTable("friendships", {
  id: serial("id").primaryKey(),
  userId1: integer("user_id_1").references(() => users.id, { onDelete: "cascade" }).notNull(),
  userId2: integer("user_id_2").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Conversations Table
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  name: text("name"), // NULL for standard DM, text for group
  isGroup: boolean("is_group").default(false).notNull(),
  groupImage: text("group_image").default("").notNull(),
  groupDescription: text("group_description").default("").notNull(),
  createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5. Conversation Members Table
export const conversationMembers = pgTable("conversation_members", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: text("role").default("member").notNull(), // 'admin', 'member'
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// 6. Messages Table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id, { onDelete: "cascade" }).notNull(),
  senderId: integer("sender_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  text: text("text").notNull(),
  attachmentUrl: text("attachment_url").default("").notNull(),
  replyToId: integer("reply_to_id"), // Optional self-reference id of message
  isSeen: boolean("is_seen").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 7. Communities Table
export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  banner: text("banner").default("").notNull(),
  gameName: text("game_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 8. Community Members Table
export const communityMembers = pgTable("community_members", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// 9. Posts Table
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  communityId: integer("community_id").references(() => communities.id, { onDelete: "cascade" }), // Can be null (general user profile feed)
  text: text("text").notNull(),
  imageUrl: text("image_url").default("").notNull(),
  videoUrl: text("video_url").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 10. Comments Table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(),
  authorId: integer("author_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 11. Likes Table
export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 12. Tournaments Table
export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  game: text("game").notNull(),
  banner: text("banner").default("").notNull(),
  description: text("description").notNull(),
  entryRequirement: text("entry_requirement").default("Free").notNull(),
  maxPlayers: integer("max_players").default(16).notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  prize: text("prize").default("XP Reward").notNull(),
  rules: text("rules").notNull(),
  status: text("status").default("upcoming").notNull(), // 'upcoming', 'live', 'completed'
  bracketData: text("bracket_data").default("[]").notNull(), // JSON string for brackets
  createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 13. Tournament Participants Table
export const tournamentParticipants = pgTable("tournament_participants", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").references(() => tournaments.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  teamName: text("team_name").default("").notNull(),
  score: integer("score").default(0).notNull(),
  placement: integer("placement"), // e.g. 1, 2, 3
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
});

// 14. Notifications Table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: text("type").notNull(), // 'friend_request', 'friend_accepted', 'new_message', 'group_invite', 'tournament_invite', 'post_like', 'post_comment', 'achievement_unlocked', 'admin_alert'
  sourceUserId: integer("source_user_id").references(() => users.id, { onDelete: "cascade" }),
  referenceId: integer("reference_id"), // target element id
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 15. Achievements Table
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  xpReward: integer("xp_reward").default(100).notNull(),
});

// 16. User Achievements Unlocked Table
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  achievementId: integer("achievement_id").references(() => achievements.id, { onDelete: "cascade" }).notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});

// 17. Reports Table
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporter_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  targetType: text("target_type").notNull(), // 'user', 'post', 'comment', 'message'
  targetId: integer("target_id").notNull(),
  reason: text("reason").notNull(),
  description: text("description").notNull(),
  status: text("status").default("pending").notNull(), // 'pending', 'resolved'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
