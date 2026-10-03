import mongoose from "mongoose";

// Connection cache for serverless environments (e.g. Vercel)
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
}

const globalForMongo = globalThis as typeof globalThis & {
  __mongooseCache?: MongooseCache;
};

const cache: MongooseCache = globalForMongo.__mongooseCache ?? {
  conn: null,
  promise: null,
};

if (process.env.NODE_ENV !== "production") {
  globalForMongo.__mongooseCache = cache;
}

export async function connectMongoDB(): Promise<typeof mongoose | null> {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    return null;
  }

  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
      })
      .then((m) => {
        console.log("⚡ [PlayNexus] Connected to MongoDB Atlas successfully!");
        return m;
      })
      .catch((err) => {
        console.warn("MongoDB Atlas connection notice:", err.message);
        cache.promise = null;
        return null;
      });
  }

  try {
    cache.conn = await cache.promise;
    return cache.conn;
  } catch {
    cache.promise = null;
    return null;
  }
}

export async function isMongoAvailable(): Promise<boolean> {
  try {
    const conn = await connectMongoDB();
    return !!conn && mongoose.connection.readyState === 1;
  } catch {
    return false;
  }
}

// ==========================================
// MONGOOSE SCHEMAS & MODELS
// ==========================================

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    displayName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    favoriteGame: { type: String, default: "Valorant" },
    avatar: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    bio: { type: String, default: "" },
    gamingLevel: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    rank: { type: String, default: "Bronze I" },
    onlineStatus: { type: String, default: "offline" },
    lastSeen: { type: Date, default: Date.now },
    joinedDate: { type: Date, default: Date.now },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const PostSchema = new mongoose.Schema(
  {
    authorId: { type: String, required: true },
    communityId: { type: String, default: null },
    text: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

const CommentSchema = new mongoose.Schema(
  {
    postId: { type: String, required: true },
    authorId: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const LikeSchema = new mongoose.Schema(
  {
    postId: { type: String, required: true },
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

const CommunitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    gameName: { type: String, required: true },
    banner: { type: String, default: "" },
  },
  { timestamps: true }
);

const CommunityMemberSchema = new mongoose.Schema(
  {
    communityId: { type: String, required: true },
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

const TournamentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    game: { type: String, required: true },
    description: { type: String, required: true },
    entryRequirement: { type: String, default: "Free" },
    maxPlayers: { type: Number, default: 16 },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    prize: { type: String, default: "XP Reward" },
    rules: { type: String, required: true },
    status: { type: String, default: "upcoming" },
    banner: { type: String, default: "" },
    bracketData: { type: String, default: "[]" },
    createdBy: { type: String, default: null },
  },
  { timestamps: true }
);

const TournamentParticipantSchema = new mongoose.Schema(
  {
    tournamentId: { type: String, required: true },
    userId: { type: String, required: true },
    teamName: { type: String, default: "" },
    score: { type: Number, default: 0 },
    placement: { type: Number, default: null },
  },
  { timestamps: true }
);

const ConversationSchema = new mongoose.Schema(
  {
    name: { type: String, default: null },
    isGroup: { type: Boolean, default: false },
    groupImage: { type: String, default: "" },
    groupDescription: { type: String, default: "" },
    createdBy: { type: String, default: null },
  },
  { timestamps: true }
);

const ConversationMemberSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true },
    userId: { type: String, required: true },
    role: { type: String, default: "member" },
  },
  { timestamps: true }
);

const MessageSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true },
    senderId: { type: String, required: true, index: true },
    text: { type: String, default: "" },
    attachmentUrl: { type: String, default: "" },
    replyToId: { type: String, default: null },
    isSeen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const FriendRequestSchema = new mongoose.Schema(
  {
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

const FriendshipSchema = new mongoose.Schema(
  {
    userId1: { type: String, required: true },
    userId2: { type: String, required: true },
  },
  { timestamps: true }
);

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    type: { type: String, required: true },
    sourceUserId: { type: String, default: null },
    referenceId: { type: String, default: null },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ReportSchema = new mongoose.Schema(
  {
    reporterId: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: { type: String, required: true },
    reason: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

const AchievementSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    xpReward: { type: Number, default: 100 },
  },
  { timestamps: true }
);

const UserAchievementSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    achievementId: { type: String, required: true },
    unlockedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

mongoose.set("bufferCommands", false);

export const MongoAchievement = mongoose.models.Achievement || mongoose.model("Achievement", AchievementSchema);
export const MongoUserAchievement = mongoose.models.UserAchievement || mongoose.model("UserAchievement", UserAchievementSchema);
export const MongoUser = mongoose.models.User || mongoose.model("User", UserSchema);
export const MongoPost = mongoose.models.Post || mongoose.model("Post", PostSchema);
export const MongoComment = mongoose.models.Comment || mongoose.model("Comment", CommentSchema);
export const MongoLike = mongoose.models.Like || mongoose.model("Like", LikeSchema);
export const MongoCommunity = mongoose.models.Community || mongoose.model("Community", CommunitySchema);
export const MongoCommunityMember = mongoose.models.CommunityMember || mongoose.model("CommunityMember", CommunityMemberSchema);
export const MongoTournament = mongoose.models.Tournament || mongoose.model("Tournament", TournamentSchema);
export const MongoTournamentParticipant = mongoose.models.TournamentParticipant || mongoose.model("TournamentParticipant", TournamentParticipantSchema);
export const MongoConversation = mongoose.models.Conversation || mongoose.model("Conversation", ConversationSchema);
export const MongoConversationMember = mongoose.models.ConversationMember || mongoose.model("ConversationMember", ConversationMemberSchema);
export const MongoMessage = mongoose.models.Message || mongoose.model("Message", MessageSchema);
export const MongoFriendRequest = mongoose.models.FriendRequest || mongoose.model("FriendRequest", FriendRequestSchema);
export const MongoFriendship = mongoose.models.Friendship || mongoose.model("Friendship", FriendshipSchema);
export const MongoNotification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
export const MongoReport = mongoose.models.Report || mongoose.model("Report", ReportSchema);
