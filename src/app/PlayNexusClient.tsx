"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Trophy,
  Gamepad2,
  User,
  Users,
  MessageSquare,
  Bell,
  Settings,
  ShieldAlert,
  Search,
  Plus,
  Heart,
  MessageCircle,
  LogOut,
  ChevronRight,
  Image,
  Send,
  Trash2,
  Clock,
  Sparkles,
  TrendingUp,
  UserPlus,
  UserMinus,
  Crown,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Smile,
  RefreshCw,
  X,
  Share2,
  Shield,
  ThumbsUp
} from "lucide-react";
import {
  registerAction,
  loginAction,
  logoutAction,
  updateProfileAction,
  sendFriendRequestAction,
  acceptFriendRequestAction,
  rejectFriendRequestAction,
  removeFriendAction,
  createPostAction,
  deletePostAction,
  addCommentAction,
  deleteCommentAction,
  toggleLikePostAction,
  createCommunityAction,
  joinLeaveCommunityAction,
  createConversationAction,
  sendMessageAction,
  deleteMessageAction,
  joinTournamentAction,
  leaveTournamentAction,
  createTournamentAction,
  updateTournamentResultsAction,
  adminAwardWinnerAction,
  reportItemAction,
  adminBanDeleteUserAction,
  adminDeletePostAction,
  adminResolveReportAction,
  clearNotificationsAction,
  markNotificationsReadAction,
  markConversationSeenAction,
  getPlayNexusData
} from "./actions";

// Preset Avatar Options for Gamers
const AVATAR_PRESETS = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=Shadow",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Reaper",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Phoenix",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Viper",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Sage",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Cypher",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Sova",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Jett"
];

// Preset Cover Options for Gamers
const COVER_PRESETS = [
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800",
  "https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=800",
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800",
  "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1200"
];

interface PlayNexusClientProps {
  initialData: any;
}

export default function PlayNexusClient({ initialData }: PlayNexusClientProps) {
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  // Auth Screen Local States
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  
  // Registration States
  const [regUsername, setRegUsername] = useState("");
  const [regDisplayName, setRegDisplayName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regFavoriteGame, setRegFavoriteGame] = useState("Valorant");

  // Navigation & Sub-views
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "discover" | "communities" | "tournaments" | "leaderboard" | "messages" | "notifications" | "profile" | "settings" | "admin"
  >("dashboard");
  const [activeProfileId, setActiveProfileId] = useState<number | string | null>(null);
  const [activeCommunityId, setActiveCommunityId] = useState<number | string | null>(null);
  const [activeTournamentId, setActiveTournamentId] = useState<number | string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<number | string | null>(null);

  // Global search (top bar)
  const [globalSearch, setGlobalSearch] = useState("");

  // Feed/Post States
  const [newPostText, setNewPostText] = useState("");
  const [newPostImage, setNewPostImage] = useState("");
  const [commentInputs, setCommentInputs] = useState<Record<string | number, string>>({});

  // Chat message composition
  const [chatMessageText, setChatMessageText] = useState("");
  const [chatAttachmentUrl, setChatAttachmentUrl] = useState("");
  const [replyingToMessageId, setReplyingToMessageId] = useState<number | string | null>(null);
  const [chatSearchQuery, setChatSearchQuery] = useState("");

  // Settings & Edit Profile
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editFavoriteGame, setEditFavoriteGame] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editCover, setEditCover] = useState("");

  // Group creation modal state
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupSelectedMembers, setGroupSelectedMembers] = useState<(number | string)[]>([]);

  // Community creation modal
  const [showCreateCommunityModal, setShowCreateCommunityModal] = useState(false);
  const [newCommName, setNewCommName] = useState("");
  const [newCommGame, setNewCommGame] = useState("");
  const [newCommDesc, setNewCommDesc] = useState("");
  const [newCommBanner, setNewCommBanner] = useState("");

  // Tournament creation modal
  const [showCreateTournamentModal, setShowCreateTournamentModal] = useState(false);
  const [newTourneyName, setNewTourneyName] = useState("");
  const [newTourneyGame, setNewTourneyGame] = useState("");
  const [newTourneyDesc, setNewTourneyDesc] = useState("");
  const [newTourneyRules, setNewTourneyRules] = useState("");
  const [newTourneyStartDate, setNewTourneyStartDate] = useState("2026-05-20T18:00");
  const [newTourneyEndDate, setNewTourneyEndDate] = useState("2026-05-22T22:00");
  const [newTourneyPrize, setNewTourneyPrize] = useState("$500 VP & Badges");
  const [newTourneyMaxPlayers, setNewTourneyMaxPlayers] = useState(16);
  const [newTourneyBanner, setNewTourneyBanner] = useState("");

  // Report Modal States
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState<"user" | "post" | "comment" | "message">("post");
  const [reportTargetId, setReportTargetId] = useState<number | string | null>(null);
  const [reportReason, setReportReason] = useState("Spam");
  const [reportDesc, setReportDesc] = useState("");

  // Toast feedback states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info");

  // Show Quick Emoji selector state
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);

  // Active user details
  const me = data.me;

  // Live sync: fast polling while chatting, slower elsewhere (works on Vercel serverless)
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const updated = await getPlayNexusData();
        if (!cancelled && updated) setData(updated);
      } catch {
        // ignore transient errors
      }
    };
    const interval = setInterval(tick, activeTab === "messages" ? 2000 : 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [activeTab]);

  // Mark the open conversation as seen whenever new incoming messages arrive
  const lastSeenMarkRef = React.useRef<string>("");
  useEffect(() => {
    if (activeTab !== "messages" || !activeConversationId || !data?.me) return;
    const conv = data.conversations?.find((c: any) => String(c.id) === String(activeConversationId));
    if (!conv) return;
    const unseen = conv.messages?.filter((m: any) => !m.isSeen && m.senderId !== data.me.id) || [];
    if (unseen.length === 0) return;
    const key = `${conv.id}:${unseen[0].id}`;
    if (lastSeenMarkRef.current === key) return;
    lastSeenMarkRef.current = key;
    markConversationSeenAction(conv.id).catch(() => {});
  }, [data, activeConversationId, activeTab]);

  // Sync settings inputs when user logs in or profile changes
  useEffect(() => {
    if (me) {
      setEditDisplayName(me.displayName);
      setEditBio(me.bio || "");
      setEditFavoriteGame(me.favoriteGame || "");
      setEditAvatar(me.avatar || "");
      setEditCover(me.coverImage || "");
    }
  }, [me]);

  // Helper to trigger custom beautiful toast message
  const triggerToast = (msg: string, type: "success" | "error" | "info" = "info") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Helper to refresh all data on demand
  const handleManualSync = async () => {
    setLoading(true);
    try {
      const updated = await getPlayNexusData();
      setData(updated);
      triggerToast("Nexus database synced successfully!", "success");
    } catch (e) {
      triggerToast("Sync failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ACTION HANDLERS
  // ==========================================

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername || !regDisplayName || !regEmail || !regPassword) {
      triggerToast("All fields are required", "error");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      triggerToast("Passwords do not match", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await registerAction({
        username: regUsername,
        displayName: regDisplayName,
        email: regEmail,
        passwordHash: regPassword,
        favoriteGame: regFavoriteGame
      });

      if (res.success) {
        triggerToast(`Welcome to PlayNexus, ${regDisplayName}!`, "success");
        // Pull latest state
        const updated = await getPlayNexusData();
        setData(updated);
        setActiveTab("dashboard");
      } else {
        triggerToast(res.error || "Registration failed", "error");
      }
    } catch (err: any) {
      triggerToast(err.message || "An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput || !password) {
      triggerToast("Please enter credentials", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await loginAction({ loginInput, passwordHash: password });
      if (res.success && res.user) {
        triggerToast(`Welcome back, ${res.user.displayName || res.user.username}!`, "success");
        const updated = await getPlayNexusData();
        setData(updated);
        setActiveTab("dashboard");
      } else {
        triggerToast(res.error || "Login failed", "error");
      }
    } catch (err: any) {
      triggerToast(err.message || "An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutAction();
      triggerToast("Logged out from PlayNexus", "info");
      const updated = await getPlayNexusData();
      setData(updated);
      setActiveTab("dashboard");
    } catch (err) {
      triggerToast("Logout error", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateProfileAction({
        displayName: editDisplayName,
        bio: editBio,
        favoriteGame: editFavoriteGame,
        avatar: editAvatar,
        coverImage: editCover
      });
      if (res.success) {
        triggerToast("Profile updated successfully!", "success");
        const updated = await getPlayNexusData();
        setData(updated);
      } else {
        triggerToast(res.error || "Update failed", "error");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Friends Actions
  const handleSendFriendRequest = async (targetId: number) => {
    try {
      const res = await sendFriendRequestAction(targetId);
      if (res.success) {
        triggerToast(res.message || "Friend request sent!", "success");
        const updated = await getPlayNexusData();
        setData(updated);
      } else {
        triggerToast(res.error || "Failed to send request", "error");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  const handleAcceptRequest = async (reqId: number) => {
    try {
      const res = await acceptFriendRequestAction(reqId);
      if (res.success) {
        triggerToast("Friend request accepted! Connected on PlayNexus.", "success");
        const updated = await getPlayNexusData();
        setData(updated);
      } else {
        triggerToast(res.error || "Failed to accept request", "error");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  const handleRejectRequest = async (reqId: number) => {
    try {
      const res = await rejectFriendRequestAction(reqId);
      if (res.success) {
        triggerToast("Request rejected", "info");
        const updated = await getPlayNexusData();
        setData(updated);
      } else {
        triggerToast(res.error || "Failed", "error");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  const handleRemoveFriend = async (friendId: number) => {
    if (!confirm("Are you sure you want to remove this connection?")) return;
    try {
      const res = await removeFriendAction(friendId);
      if (res.success) {
        triggerToast("Friend removed", "info");
        const updated = await getPlayNexusData();
        setData(updated);
      } else {
        triggerToast(res.error || "Failed to remove friend", "error");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  // Posts social network feed
  const handleCreatePost = async (e: React.FormEvent, communityId?: number) => {
    e.preventDefault();
    if (!newPostText.trim()) {
      triggerToast("Post text cannot be empty!", "error");
      return;
    }
    try {
      const res = await createPostAction({
        text: newPostText,
        imageUrl: newPostImage || undefined,
        communityId
      });
      if (res.success) {
        triggerToast("Post shared with the gaming universe! (+50 XP)", "success");
        setNewPostText("");
        setNewPostImage("");
        const updated = await getPlayNexusData();
        setData(updated);
      } else {
        triggerToast(res.error || "Could not publish post", "error");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm("Delete this post permanently?")) return;
    try {
      const res = await deletePostAction(postId);
      if (res.success) {
        triggerToast("Post deleted from database", "success");
        const updated = await getPlayNexusData();
        setData(updated);
      } else {
        triggerToast(res.error || "Could not delete post", "error");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  const handleAddComment = async (postId: number) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;
    try {
      const res = await addCommentAction(postId, text);
      if (res.success) {
        triggerToast("Comment added! (+15 XP)", "success");
        setCommentInputs({ ...commentInputs, [postId]: "" });
        const updated = await getPlayNexusData();
        setData(updated);
      } else {
        triggerToast(res.error || "Failed to add comment", "error");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Remove this comment?")) return;
    try {
      const res = await deleteCommentAction(commentId);
      if (res.success) {
        triggerToast("Comment deleted", "info");
        const updated = await getPlayNexusData();
        setData(updated);
      } else {
        triggerToast(res.error || "Failed", "error");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  const handleToggleLike = async (postId: number) => {
    try {
      const res = await toggleLikePostAction(postId);
      if (res.success) {
        const updated = await getPlayNexusData();
        setData(updated);
      } else {
        triggerToast(res.error || "Error liking post", "error");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  // Communities
  const handleJoinLeaveCommunity = async (commId: number) => {
    try {
      const res = await joinLeaveCommunityAction(commId);
      if (res.success) {
        triggerToast(res.joined ? "Joined community! Star Badge check unlocked (+20 XP)" : "Left community", "success");
        const updated = await getPlayNexusData();
        setData(updated);
      } else {
        triggerToast(res.error || "Could not join", "error");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommName || !newCommGame || !newCommDesc) {
      triggerToast("Required fields: Name, Game and Description", "error");
      return;
    }
    try {
      const res = await createCommunityAction({
        name: newCommName,
        description: newCommDesc,
        gameName: newCommGame,
        banner: newCommBanner || undefined
      });
      if (res.success && res.community) {
        triggerToast(`Community "${newCommName}" created successfully!`, "success");
        setNewCommName("");
        setNewCommGame("");
        setNewCommDesc("");
        setNewCommBanner("");
        setShowCreateCommunityModal(false);
        const updated = await getPlayNexusData();
        setData(updated);
        setActiveTab("communities");
        setActiveCommunityId(res.community.id || null);
      } else {
        triggerToast(res.error || "Could not create community", "error");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  // Messaging, Group chats, DMs
  const handleStartDM = async (targetUserId: number) => {
    try {
      const res = await createConversationAction({
        isGroup: false,
        targetUserId
      });
      if (res.success && res.conversationId) {
        const updated = await getPlayNexusData();
        setData(updated);
        setActiveConversationId(res.conversationId);
        setActiveTab("messages");
        triggerToast("Opened private conversation channel", "success");
      } else {
        triggerToast(res.error || "Could not start chat", "error");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  const handleCreateGroupChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      triggerToast("Group name is required", "error");
      return;
    }
    try {
      const res = await createConversationAction({
        isGroup: true,
        groupName,
        groupDescription: groupDesc,
        memberIds: groupSelectedMembers
      });
      if (res.success && res.conversationId) {
        triggerToast(`Group "${groupName}" formed! Let's scrim.`, "success");
        setGroupName("");
        setGroupDesc("");
        setGroupSelectedMembers([]);
        setShowCreateGroupModal(false);
        const updated = await getPlayNexusData();
        setData(updated);
        setActiveConversationId(res.conversationId);
        setActiveTab("messages");
      } else {
        triggerToast(res.error || "Could not establish group", "error");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversationId) return;
    if (!chatMessageText.trim() && !chatAttachmentUrl) return;

    try {
      const res = await sendMessageAction({
        conversationId: activeConversationId,
        text: chatMessageText,
        attachmentUrl: chatAttachmentUrl || undefined,
        replyToId: replyingToMessageId || undefined
      });

      if (res.success) {
        setChatMessageText("");
        setChatAttachmentUrl("");
        setReplyingToMessageId(null);
        setShowEmojiPanel(false);
        const updated = await getPlayNexusData();
        setData(updated);
      } else {
        triggerToast(res.error || "Failed to send message", "error");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  const handleDeleteMessage = async (msgId: number) => {
    try {
      const res = await deleteMessageAction(msgId);
      if (res.success) {
        triggerToast("Message deleted from lobby", "info");
        const updated = await getPlayNexusData();
        setData(updated);
      } else {
        triggerToast(res.error || "Failed to delete", "error");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  // Tournament Registration
  const handleJoinTournament = async (tId: number, teamNameInput: string) => {
    try {
      const res = await joinTournamentAction(tId, teamNameInput);
      if (res.success) {
        triggerToast("Registered! Bracket populated. Good luck, soldier! (+50 XP)", "success");
        const updated = await getPlayNexusData();
        setData(updated);
      } else {
        triggerToast(res.error || "Could not register", "error");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  const handleLeaveTournament = async (tId: number) => {
    try {
      const res = await leaveTournamentAction(tId);
      if (res.success) {
        triggerToast("Withdrawn from tournament brackets", "info");
        const updated = await getPlayNexusData();
        setData(updated);
      } else {
        triggerToast(res.error || "Error leaving", "error");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTourneyName || !newTourneyGame || !newTourneyDesc || !newTourneyRules) {
      triggerToast("Please fill in name, game, description, and rules", "error");
      return;
    }
    try {
      const res = await createTournamentAction({
        name: newTourneyName,
        game: newTourneyGame,
        description: newTourneyDesc,
        entryRequirement: "Free Entry",
        rules: newTourneyRules,
        startDate: newTourneyStartDate,
        endDate: newTourneyEndDate,
        prize: newTourneyPrize,
        maxPlayers: Number(newTourneyMaxPlayers),
        banner: newTourneyBanner || undefined
      });

      if (res.success && res.tournament) {
        triggerToast("Gaming tournament created and published!", "success");
        setNewTourneyName("");
        setNewTourneyGame("");
        setNewTourneyDesc("");
        setNewTourneyRules("");
        setNewTourneyBanner("");
        setShowCreateTournamentModal(false);
        const updated = await getPlayNexusData();
        setData(updated);
        setActiveTab("tournaments");
        setActiveTournamentId(res.tournament.id || null);
      } else {
        triggerToast(res.error || "Could not create tournament", "error");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  const handleSimulateBracketScore = async (tId: number) => {
    // Generate simulated outcomes for participants
    const participants = data.tournamentParticipants.filter((p: any) => p.tournamentId === tId);
    if (participants.length === 0) {
      triggerToast("No participants registered yet to simulate matches!", "error");
      return;
    }

    try {
      // Pick a random participant to award score increments
      const randomIndex = Math.floor(Math.random() * participants.length);
      const chosen = participants[randomIndex];
      const newScore = chosen.score + Math.floor(Math.random() * 15) + 1;

      // Update their score in bracket JSON and DB
      const updatedParticipants = participants.map((p: any, idx: number) => {
        if (idx === randomIndex) {
          return { ...p, score: newScore };
        }
        return p;
      });

      // Simple mock bracket status updates
      const t = data.tournaments.find((tr: any) => tr.id === tId);
      const matches = t ? JSON.parse(t.bracketData || "[]") : [];
      const updatedMatches = matches.map((m: any) => {
        if (m.p1 === chosen.teamName || m.p2 === chosen.teamName) {
          return {
            ...m,
            score1: m.p1 === chosen.teamName ? m.score1 + 3 : m.score1,
            score2: m.p2 === chosen.teamName ? m.score2 + 3 : m.score2,
            winner: m.score1 > m.score2 ? m.p1 : m.p2
          };
        }
        return m;
      });

      const res = await updateTournamentResultsAction(tId, JSON.stringify(updatedMatches), "live");
      if (res.success) {
        triggerToast(`Live score updated for team "${chosen.teamName}"!`, "success");
        const updated = await getPlayNexusData();
        setData(updated);
      } else {
        triggerToast(res.error || "Failed to simulate score", "error");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  const handleDeclareWinner = async (tId: number, winnerId: number) => {
    try {
      const res = await adminAwardWinnerAction(tId, winnerId);
      if (res.success) {
        // conclude tournament
        const res2 = await updateTournamentResultsAction(tId, "[]", "completed");
        if (res2.success) {
          triggerToast("Grand winner declared and tournament successfully completed!", "success");
          const updated = await getPlayNexusData();
          setData(updated);
        }
      } else {
        triggerToast(res.error || "Failed to declare winner", "error");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  // Report Items Modal submit
  const handleOpenReportModal = (type: "user" | "post" | "comment" | "message", targetId: number) => {
    setReportType(type);
    setReportTargetId(targetId);
    setReportDesc("");
    setShowReportModal(true);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTargetId) return;
    try {
      const res = await reportItemAction({
        targetType: reportType,
        targetId: reportTargetId,
        reason: reportReason,
        description: reportDesc
      });
      if (res.success) {
        triggerToast("Content successfully reported! PlayNexus staff will review.", "success");
        setShowReportModal(false);
      } else {
        triggerToast(res.error || "Report submission failed", "error");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  // Notification Operations
  const handleClearNotifications = async () => {
    try {
      const res = await clearNotificationsAction();
      if (res.success) {
        triggerToast("Notifications cleared", "info");
        const updated = await getPlayNexusData();
        setData(updated);
      }
    } catch (err) {}
  };

  const handleMarkNotificationsRead = async () => {
    try {
      const res = await markNotificationsReadAction();
      if (res.success) {
        const updated = await getPlayNexusData();
        setData(updated);
      }
    } catch (err) {}
  };

  // Admin Controls
  const handleAdminBanDelete = async (userId: number, action: "ban" | "delete" | "make_admin") => {
    if (!confirm(`Are you absolutely sure you want to perform action: "${action}"?`)) return;
    try {
      const res = await adminBanDeleteUserAction(userId, action);
      if (res.success) {
        triggerToast(res.message || "Action processed successfully", "success");
        const updated = await getPlayNexusData();
        setData(updated);
      } else {
        triggerToast(res.error || "Action failed", "error");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  const handleAdminDeletePost = async (postId: number) => {
    if (!confirm("Permanently delete reported post?")) return;
    try {
      const res = await adminDeletePostAction(postId);
      if (res.success) {
        triggerToast("Reported post deleted from database", "success");
        const updated = await getPlayNexusData();
        setData(updated);
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  const handleAdminResolveReport = async (repId: number) => {
    try {
      const res = await adminResolveReportAction(repId);
      if (res.success) {
        triggerToast("Report marked as RESOLVED", "success");
        const updated = await getPlayNexusData();
        setData(updated);
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  // ==========================================
  // VIEW RENDER HELPERS AND SELECTORS
  // ==========================================

  const navigateToProfile = (userId: number) => {
    setActiveProfileId(userId);
    setActiveTab("profile");
  };

  const navigateToCommunity = (slug: string) => {
    const c = data.communities.find((comm: any) => comm.slug === slug);
    if (c) {
      setActiveCommunityId(c.id);
      setActiveTab("communities");
    }
  };

  const navigateToTournament = (id: number) => {
    setActiveTournamentId(id);
    setActiveTab("tournaments");
  };

  // Helper date-formatter
  const formatFriendlyDate = (date: any) => {
    if (!date) return "Recently";
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return "Recently";
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }) + ", " + d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "Recently";
    }
  };

  // Unread Count
  const unreadNotificationsCount = data.notifications?.filter((n: any) => !n.isRead).length || 0;

  // Filtered lists for search query
  const filteredUsers = data.users?.filter((u: any) => {
    if (!globalSearch) return true;
    return (
      u.displayName.toLowerCase().includes(globalSearch.toLowerCase()) ||
      u.username.toLowerCase().includes(globalSearch.toLowerCase())
    );
  });

  const filteredCommunities = data.communities?.filter((c: any) => {
    if (!globalSearch) return true;
    return (
      c.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      c.gameName.toLowerCase().includes(globalSearch.toLowerCase())
    );
  });

  const filteredTournaments = data.tournaments?.filter((t: any) => {
    if (!globalSearch) return true;
    return (
      t.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      t.game.toLowerCase().includes(globalSearch.toLowerCase())
    );
  });

  const filteredPosts = data.posts?.filter((p: any) => {
    if (!globalSearch) return true;
    return p.text.toLowerCase().includes(globalSearch.toLowerCase());
  });

  // ==========================================
  // AUTH SCREEN RENDER
  // ==========================================

  if (!me) {
    return (
      <div className="min-h-screen bg-[#080A12] text-[#F8FAFC] flex flex-col justify-between relative overflow-hidden">
        {/* Abstract Glow Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vh] bg-[#7C3AED]/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vh] bg-[#06B6D4]/15 rounded-full blur-[140px] pointer-events-none" />

        {/* Header */}
        <header className="max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center z-10">
          <div className="flex items-center space-x-2">
            <div className="p-2.5 bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.4)]">
              <Sparkles className="w-6 h-6 text-[#F8FAFC]" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-wider text-[#F8FAFC] flex items-center gap-1">
                PLAY<span className="text-[#06B6D4]">NEXUS</span>
              </span>
              <p className="text-[9px] uppercase tracking-widest text-[#94A3B8]">Where Gamers Connect</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
              className="text-sm text-[#06B6D4] hover:text-[#22D3EE] font-semibold transition"
            >
              {authMode === "login" ? "Create Account" : "Sign In"}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10 flex-grow">
          {/* Brand Presentation */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <span className="px-4 py-1.5 bg-[#7C3AED]/20 border border-[#7C3AED]/40 text-[#A78BFA] text-xs font-bold uppercase tracking-widest rounded-full inline-block">
              ⚡ LIVE COMPETITIVE NETWORK
            </span>
            <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
              Connect. Compete. <br />
              <span className="bg-gradient-to-r from-[#7C3AED] via-[#A78BFA] to-[#06B6D4] bg-clip-text text-transparent">
                Level Up Together.
              </span>
            </h1>
            <p className="text-[#94A3B8] text-base md:text-lg max-w-xl mx-auto lg:mx-0">
              Join PlayNexus — the elite platform engineered specifically for gamers. Organize team scrims, duel in verified competitive tournaments, share highlights, and chat live with your clan.
            </p>

            {/* Quick Feature highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 max-w-2xl mx-auto lg:mx-0">
              <div className="p-3 bg-[#151927]/60 border border-slate-800 rounded-xl text-center">
                <Trophy className="w-5 h-5 mx-auto text-[#06B6D4] mb-1" />
                <span className="text-xs font-bold block">Live Tourneys</span>
              </div>
              <div className="p-3 bg-[#151927]/60 border border-slate-800 rounded-xl text-center">
                <MessageSquare className="w-5 h-5 mx-auto text-[#7C3AED] mb-1" />
                <span className="text-xs font-bold block">Instant Chat</span>
              </div>
              <div className="p-3 bg-[#151927]/60 border border-slate-800 rounded-xl text-center">
                <Crown className="w-5 h-5 mx-auto text-[#EAB308] mb-1" />
                <span className="text-xs font-bold block">Gamer XP</span>
              </div>
              <div className="p-3 bg-[#151927]/60 border border-slate-800 rounded-xl text-center">
                <Users className="w-5 h-5 mx-auto text-[#10B981] mb-1" />
                <span className="text-xs font-bold block">Communities</span>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="lg:col-span-5 bg-[#151927] border border-slate-800 p-8 rounded-2xl shadow-[0_20px_50px_rgba(8,10,18,0.7)] relative overflow-hidden neon-glow-purple">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]" />
            <h2 className="text-2xl font-extrabold text-white mb-2">
              {authMode === "login" ? "Welcome Back, Player" : "Join the PlayNexus Syndicate"}
            </h2>
            <p className="text-slate-400 text-xs mb-6">
              {authMode === "login" ? "Enter your credentials to enter the hub." : "Establish your gamer identity and claim 100 welcome XP."}
            </p>

            {authMode === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">
                    Username or Email
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="Enter email or username"
                    className="w-full bg-[#080A12] border border-slate-800 hover:border-slate-700 focus:border-[#7C3AED] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#080A12] border border-slate-800 hover:border-slate-700 focus:border-[#7C3AED] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] hover:from-[#6D28D9] hover:to-[#0891B2] text-white py-3.5 px-4 rounded-xl text-sm font-extrabold shadow-lg transition duration-200 transform hover:scale-[1.01] active:scale-[0.99] flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>ENTER NEXUS</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      autoComplete="username"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="e.g. ghost"
                      className="w-full bg-[#080A12] border border-slate-800 hover:border-slate-700 focus:border-[#7C3AED] rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      value={regDisplayName}
                      onChange={(e) => setRegDisplayName(e.target.value)}
                      placeholder="e.g. Ghost Gamer"
                      className="w-full bg-[#080A12] border border-slate-800 hover:border-slate-700 focus:border-[#7C3AED] rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="gamer@playnexus.com"
                    className="w-full bg-[#080A12] border border-slate-800 hover:border-slate-700 focus:border-[#7C3AED] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      autoComplete="new-password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#080A12] border border-slate-800 hover:border-slate-700 focus:border-[#7C3AED] rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                      Confirm Pass
                    </label>
                    <input
                      type="password"
                      required
                      autoComplete="new-password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#080A12] border border-slate-800 hover:border-slate-700 focus:border-[#7C3AED] rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                    Favorite Game Franchise
                  </label>
                  <select
                    value={regFavoriteGame}
                    onChange={(e) => setRegFavoriteGame(e.target.value)}
                    className="w-full bg-[#080A12] border border-slate-800 hover:border-slate-700 focus:border-[#7C3AED] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition"
                  >
                    <option value="Valorant">Valorant</option>
                    <option value="GTA V">GTA V</option>
                    <option value="Call of Duty">Call of Duty</option>
                    <option value="Minecraft">Minecraft</option>
                    <option value="Counter-Strike">Counter-Strike</option>
                    <option value="Fortnite">Fortnite</option>
                    <option value="PUBG Mobile">PUBG Mobile</option>
                    <option value="Other Game">Other / General</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] hover:from-[#6D28D9] hover:to-[#0891B2] text-white py-3.5 px-4 rounded-xl text-xs font-extrabold shadow-lg transition duration-200"
                >
                  {loading ? (
                    <div className="w-5 h-5 mx-auto border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "INITIALIZE CHARACTER (+100 XP)"
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-slate-800 text-center">
              <span className="text-xs text-slate-400">
                {authMode === "login" ? "Don't have an account?" : "Already registered?"}
              </span>{" "}
              <button
                onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                className="text-xs text-[#06B6D4] font-bold hover:underline transition"
              >
                {authMode === "login" ? "Register Now" : "Sign In Here"}
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 border-t border-slate-900 bg-[#06080F] text-center text-slate-500 text-xs z-10">
          <p>© 2026 PlayNexus. Where Gamers Connect. Engineered for maximum performance.</p>
        </footer>

        {/* Custom Toast alert in UI */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#151927] border-l-4 border-[#06B6D4] px-5 py-4 rounded-xl shadow-2xl animate-bounce">
            <div className="w-2.5 h-2.5 rounded-full bg-[#06B6D4] animate-ping" />
            <span className="text-sm font-semibold">{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // LOGGED IN MAIN INTERFACE
  // ==========================================

  return (
    <div className="min-h-screen bg-[#080A12] text-[#F8FAFC] flex flex-col md:flex-row relative">
      
      {/* 1. SIDEBAR NAVIGATION - DESKTOP */}
      <aside className="w-full md:w-64 bg-[#10131F] border-r border-slate-800/80 p-5 flex flex-col justify-between shrink-0 md:sticky md:top-0 md:h-screen z-20">
        <div className="space-y-7">
          {/* Brand Logo */}
          <div className="flex items-center space-x-2.5 px-1 py-1">
            <div className="p-2 bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(124,58,237,0.3)]">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-wider text-white">
                PLAY<span className="text-[#06B6D4]">NEXUS</span>
              </span>
              <p className="text-[8px] tracking-widest text-[#94A3B8] uppercase">GAMER NETWORK</p>
            </div>
          </div>

          {/* Quick Gamer Identity Banner */}
          <div
            onClick={() => {
              setActiveProfileId(me.id);
              setActiveTab("profile");
            }}
            className="p-3 bg-[#151927] hover:bg-[#1E2538] border border-slate-800/80 rounded-xl flex items-center space-x-3 cursor-pointer transition duration-150"
          >
            <img
              src={me.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${me.username}`}
              alt={me.displayName}
              className="w-10 h-10 rounded-lg border border-[#7C3AED]/40 bg-[#080A12] object-cover"
            />
            <div className="min-w-0 flex-grow">
              <span className="font-bold text-sm block truncate text-white hover:text-[#06B6D4]">
                {me.displayName}
              </span>
              <div className="flex items-center space-x-1">
                <span className="text-[10px] text-[#A78BFA] font-extrabold uppercase">LVL {me.gamingLevel}</span>
                <span className="text-[10px] text-slate-400">•</span>
                <span className="text-[10px] text-slate-400 truncate">{me.rank}</span>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            <button
              onClick={() => {
                setActiveTab("dashboard");
                setActiveProfileId(null);
                setActiveCommunityId(null);
                setActiveTournamentId(null);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === "dashboard" && !activeProfileId && !activeCommunityId && !activeTournamentId
                  ? "bg-gradient-to-r from-[#7C3AED]/20 to-transparent text-[#A78BFA] border-l-2 border-[#7C3AED]"
                  : "text-slate-300 hover:bg-[#151927] hover:text-white"
              }`}
            >
              <Gamepad2 className="w-4.5 h-4.5" />
              <span>Lobby Feed</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("discover");
                setActiveProfileId(null);
                setActiveCommunityId(null);
                setActiveTournamentId(null);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === "discover" ? "bg-gradient-to-r from-[#7C3AED]/20 to-transparent text-[#A78BFA] border-l-2 border-[#7C3AED]" : "text-slate-300 hover:bg-[#151927] hover:text-white"
              }`}
            >
              <TrendingUp className="w-4.5 h-4.5" />
              <span>Discover</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("communities");
                setActiveCommunityId(null);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === "communities" ? "bg-gradient-to-r from-[#7C3AED]/20 to-transparent text-[#A78BFA] border-l-2 border-[#7C3AED]" : "text-slate-300 hover:bg-[#151927] hover:text-white"
              }`}
            >
              <Users className="w-4.5 h-4.5" />
              <span>Communities</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("tournaments");
                setActiveTournamentId(null);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === "tournaments" ? "bg-gradient-to-r from-[#7C3AED]/20 to-transparent text-[#A78BFA] border-l-2 border-[#7C3AED]" : "text-slate-300 hover:bg-[#151927] hover:text-white"
              }`}
            >
              <Trophy className="w-4.5 h-4.5" />
              <span>Tournaments</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("leaderboard");
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === "leaderboard" ? "bg-gradient-to-r from-[#7C3AED]/20 to-transparent text-[#A78BFA] border-l-2 border-[#7C3AED]" : "text-slate-300 hover:bg-[#151927] hover:text-white"
              }`}
            >
              <Crown className="w-4.5 h-4.5 text-yellow-500" />
              <span>Leaderboard</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("messages");
                handleMarkNotificationsRead();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === "messages" ? "bg-gradient-to-r from-[#7C3AED]/20 to-transparent text-[#A78BFA] border-l-2 border-[#7C3AED]" : "text-slate-300 hover:bg-[#151927] hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-4.5 h-4.5" />
                <span>Conversations</span>
              </div>
              {data.conversations?.some((c: any) => c.messages?.some((m: any) => !m.isSeen && m.senderId !== me.id)) && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab("notifications");
                handleMarkNotificationsRead();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === "notifications" ? "bg-gradient-to-r from-[#7C3AED]/20 to-transparent text-[#A78BFA] border-l-2 border-[#7C3AED]" : "text-slate-300 hover:bg-[#151927] hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Bell className="w-4.5 h-4.5" />
                <span>Alerts</span>
              </div>
              {unreadNotificationsCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-[#EF4444] text-white rounded-full">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab("settings");
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === "settings" ? "bg-gradient-to-r from-[#7C3AED]/20 to-transparent text-[#A78BFA] border-l-2 border-[#7C3AED]" : "text-slate-300 hover:bg-[#151927] hover:text-white"
              }`}
            >
              <Settings className="w-4.5 h-4.5" />
              <span>Settings</span>
            </button>

            {/* Admin link */}
            {me.isAdmin && (
              <button
                onClick={() => {
                  setActiveTab("admin");
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                  activeTab === "admin" ? "bg-gradient-to-r from-red-500/20 to-transparent text-red-400 border-l-2 border-red-500" : "text-red-300 hover:bg-[#151927]"
                }`}
              >
                <ShieldAlert className="w-4.5 h-4.5" />
                <span className="flex items-center gap-1.5">
                  Admin Deck <Shield className="w-3 h-3 text-red-400 fill-current" />
                </span>
              </button>
            )}
          </nav>
        </div>

        {/* Sync & Logout */}
        <div className="pt-6 border-t border-slate-800/80 space-y-2">
          <button
            onClick={handleManualSync}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-2 bg-[#151927] hover:bg-[#1E2538] border border-slate-800 rounded-xl text-xs font-bold text-slate-300 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#06B6D4] ${loading ? "animate-spin" : ""}`} />
            <span>Sync Nexus ({data.users?.length || 0} online)</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 rounded-xl text-xs font-bold text-red-400 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Terminate Connection</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN HUB SHELL */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* TOP STATUS BAR */}
        <header className="h-16 border-b border-slate-800/80 bg-[#10131F]/90 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-10">
          {/* Global Search bar */}
          <div className="relative w-64 md:w-96">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-slate-500" />
            </span>
            <input
              type="text"
              placeholder="Search users, games, tournaments..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full bg-[#080A12] border border-slate-800/80 hover:border-slate-700/80 focus:border-[#7C3AED] rounded-full pl-9 pr-4 py-2 text-xs text-white focus:outline-none transition"
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Quick notification count indicator */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                setActiveTab("notifications");
                handleMarkNotificationsRead();
              }}
              className="relative p-2 bg-[#151927] hover:bg-[#1E2538] border border-slate-800 rounded-xl text-slate-300 transition"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] text-[9px] font-extrabold text-white rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Quick manual sync visual status indicator */}
            <span className="hidden md:flex items-center space-x-2 text-xs text-slate-400 bg-[#151927] py-1 px-3 rounded-full border border-slate-800">
              <span className={`w-2 h-2 rounded-full ${data.dbConnected !== false ? "bg-emerald-500 animate-ping" : "bg-amber-500"}`} />
              <span className={`font-semibold ${data.dbConnected !== false ? "text-emerald-400" : "text-amber-400"}`}>
                {data.dbType || "Online"}
              </span>
            </span>
          </div>
        </header>

        {/* DYNAMIC SCROLLABLE WRAPPER */}
        <main className="p-6 max-w-7xl w-full mx-auto flex-grow space-y-6">
          {data.dbConnected === false && (
            <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Preview Standalone Mode:</strong> Local PostgreSQL is starting or not connected. Fallback data is active and all interactive features remain accessible.
                </span>
              </div>
            </div>
          )}
          
          {/* Global search output placeholder overlay (If search is filled, show filter views first) */}
          {globalSearch && (
            <div className="p-5 bg-[#151927] rounded-2xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Search className="w-5 h-5 text-[#06B6D4]" /> Global Search Results for "{globalSearch}"
                </h3>
                <button
                  onClick={() => setGlobalSearch("")}
                  className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-300 transition"
                >
                  Clear Search
                </button>
              </div>

              {/* Users Results */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#7C3AED] mb-3">Gamers ({filteredUsers?.length})</h4>
                {filteredUsers?.length === 0 ? (
                  <p className="text-xs text-slate-500">No gamers match your search</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {filteredUsers?.slice(0, 6).map((usr: any) => (
                      <div
                        key={usr.id}
                        onClick={() => navigateToProfile(usr.id)}
                        className="p-3 bg-[#10131F] hover:bg-[#1E2538] border border-slate-800 rounded-xl flex items-center space-x-3 cursor-pointer transition"
                      >
                        <img src={usr.avatar} alt="" className="w-9 h-9 rounded-full bg-slate-900 object-cover" />
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-white block truncate">{usr.displayName}</span>
                          <span className="text-[10px] text-[#06B6D4] block truncate">@{usr.username} • LVL {usr.gamingLevel}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Communities Results */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#06B6D4] mb-3">Communities ({filteredCommunities?.length})</h4>
                {filteredCommunities?.length === 0 ? (
                  <p className="text-xs text-slate-500">No matching communities</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {filteredCommunities?.slice(0, 6).map((comm: any) => (
                      <div
                        key={comm.id}
                        onClick={() => navigateToCommunity(comm.slug)}
                        className="p-3 bg-[#10131F] hover:bg-[#1E2538] border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer transition"
                      >
                        <div>
                          <span className="font-bold text-xs text-white block">{comm.name}</span>
                          <span className="text-[10px] text-slate-400 block">{comm.gameName}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tournaments Results */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-amber-500 mb-3">Tournaments ({filteredTournaments?.length})</h4>
                {filteredTournaments?.length === 0 ? (
                  <p className="text-xs text-slate-500">No tournaments matching terms</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredTournaments?.slice(0, 4).map((t: any) => (
                      <div
                        key={t.id}
                        onClick={() => navigateToTournament(t.id)}
                        className="p-3 bg-[#10131F] hover:bg-[#1E2538] border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer transition"
                      >
                        <div>
                          <span className="font-bold text-xs text-white block">{t.name}</span>
                          <span className="text-[10px] text-[#A78BFA]">{t.game} • {t.status.toUpperCase()}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              SUBVIEW 1: DASHBOARD (HOME LOBBY)
              ========================================== */}
          {activeTab === "dashboard" && !activeProfileId && !activeCommunityId && !activeTournamentId && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left & Mid content: Welcome widget + Post Composer + Social Feed */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Welcome Back & XP Dashboard card */}
                <div className="bg-[#151927] border border-slate-800/80 p-6 rounded-2xl relative overflow-hidden neon-glow-purple">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#7C3AED]/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[#06B6D4] font-black">PLAYNEXUS SYNDICATE MEMBER</span>
                      <h2 className="text-2xl font-black text-white mt-1">
                        Welcome back, Captain {me.displayName}!
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        You have {me.xp} total XP. Complete achievements, participate in tournaments, or post clips to level up.
                      </p>
                    </div>

                    {/* Level badge */}
                    <div className="flex items-center space-x-3.5 bg-[#080A12] border border-slate-800 py-3 px-4 rounded-xl">
                      <div className="p-2 bg-[#7C3AED]/20 border border-[#7C3AED]/40 rounded-lg">
                        <Crown className="w-6 h-6 text-[#A78BFA]" />
                      </div>
                      <div>
                        <span className="text-2xl font-black text-white block leading-none">LVL {me.gamingLevel}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{me.rank}</span>
                      </div>
                    </div>
                  </div>

                  {/* Level Progress bar */}
                  <div className="mt-5 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Level Progression</span>
                      <span className="font-extrabold text-[#06B6D4]">{me.xp % 1000} / 1000 XP to next rank</span>
                    </div>
                    <div className="h-2 bg-[#080A12] rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] transition-all duration-300"
                        style={{ width: `${(me.xp % 1000) / 10}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Post composer */}
                <div className="bg-[#151927] border border-slate-800/80 p-5 rounded-2xl">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
                    Transmit Gaming Update
                  </span>
                  <form onSubmit={handleCreatePost} className="space-y-4">
                    <textarea
                      placeholder="Share a highlight clip URL, announce custom lobby codes, or recruit crew members..."
                      value={newPostText}
                      onChange={(e) => setNewPostText(e.target.value)}
                      rows={3}
                      className="w-full bg-[#080A12] border border-slate-800 hover:border-slate-700/80 focus:border-[#7C3AED] rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none transition resize-none"
                    />
                    
                    <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                      {/* Image optional URL input */}
                      <div className="relative w-full md:w-2/3">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <Image className="w-3.5 h-3.5 text-slate-400" />
                        </span>
                        <input
                          type="text"
                          placeholder="Paste image/gif URL (optional)..."
                          value={newPostImage}
                          onChange={(e) => setNewPostImage(e.target.value)}
                          className="w-full bg-[#080A12] border border-slate-800 hover:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-[11px] text-white focus:outline-none focus:border-[#7C3AED] transition"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full md:w-auto bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-extrabold px-5 py-2.5 rounded-xl transition"
                      >
                        TRANSMIT UPDATE (+50 XP)
                      </button>
                    </div>
                  </form>
                </div>

                {/* SOCIAL LOBBY FEED HEADER */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-[#7C3AED]" /> Live Feed Lobby
                  </h3>
                  <span className="text-xs text-slate-400">Showing latest global highlights</span>
                </div>

                {/* THE SOCIAL FEED */}
                {data.posts?.length === 0 ? (
                  <div className="bg-[#151927] border border-slate-800 p-8 rounded-2xl text-center space-y-3">
                    <p className="text-slate-400 text-sm">No updates have been transmitted yet. Be the first to start the trend!</p>
                    <button
                      onClick={() => {
                        setNewPostText("Just landed in the PlayNexus hub! Ready to queue up.");
                        triggerToast("Demo text set in composer! Click Transmit.", "info");
                      }}
                      className="text-xs bg-[#7C3AED] text-white font-bold py-2 px-4 rounded-xl"
                    >
                      Use Demo Template
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.posts?.map((post: any) => {
                      const hasLiked = data.likes?.some((l: any) => l.postId === post.id && l.userId === me.id);
                      const postLikes = data.likes?.filter((l: any) => l.postId === post.id) || [];
                      const postComments = data.comments?.filter((c: any) => c.postId === post.id) || [];

                      return (
                        <div key={post.id} className="bg-[#151927] border border-slate-800/80 rounded-2xl overflow-hidden p-5 space-y-4">
                          
                          {/* Feed post Header */}
                          <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-3">
                              <img
                                src={post.author?.avatar}
                                alt={post.author?.displayName}
                                onClick={() => navigateToProfile(post.authorId)}
                                className="w-10 h-10 rounded-full border border-slate-800 object-cover bg-slate-950 cursor-pointer"
                              />
                              <div>
                                <div className="flex items-center gap-1">
                                  <span
                                    onClick={() => navigateToProfile(post.authorId)}
                                    className="font-bold text-sm text-white hover:text-[#06B6D4] cursor-pointer"
                                  >
                                    {post.author?.displayName}
                                  </span>
                                  {post.author?.isAdmin && (
                                    <span className="bg-red-500/20 text-red-400 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Staff</span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 block">
                                  @{post.author?.username} • Level {post.author?.gamingLevel} • {formatFriendlyDate(post.createdAt)}
                                </span>
                              </div>
                            </div>

                            {/* Options: Delete if author/admin, or Report */}
                            <div className="flex items-center space-x-2">
                              {(post.authorId === me.id || me.isAdmin) && (
                                <button
                                  onClick={() => handleDeletePost(post.id)}
                                  className="p-1.5 hover:bg-red-950/20 text-slate-500 hover:text-red-400 rounded-lg transition"
                                  title="Delete Post"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleOpenReportModal("post", post.id)}
                                className="p-1.5 hover:bg-slate-800 text-slate-500 hover:text-yellow-500 rounded-lg transition"
                                title="Report Post"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Post Content */}
                          <div className="space-y-3">
                            <p className="text-slate-200 text-xs md:text-sm whitespace-pre-wrap leading-relaxed">
                              {post.text}
                            </p>
                            {post.imageUrl && (
                              <div className="rounded-xl overflow-hidden max-h-[350px] border border-slate-800">
                                <img
                                  src={post.imageUrl}
                                  alt="Post media"
                                  className="w-full object-cover max-h-[350px]"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                              </div>
                            )}
                          </div>

                          {/* Feed post Actions (Likes, Comment counters, Share) */}
                          <div className="flex items-center justify-between border-t border-b border-slate-800/70 py-2.5">
                            <button
                              onClick={() => handleToggleLike(post.id)}
                              className={`flex items-center space-x-1.5 text-xs font-bold transition ${
                                hasLiked ? "text-[#EF4444]" : "text-slate-400 hover:text-white"
                              }`}
                            >
                              <Heart className={`w-4.5 h-4.5 ${hasLiked ? "fill-current" : ""}`} />
                              <span>{postLikes.length} Likes</span>
                            </button>

                            <span className="text-slate-400 text-xs font-bold flex items-center space-x-1.5">
                              <MessageCircle className="w-4.5 h-4.5 text-[#06B6D4]" />
                              <span>{postComments.length} Comments</span>
                            </span>

                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(window.location.origin);
                                triggerToast("PlayNexus link copied! Send to teammates.", "success");
                              }}
                              className="text-xs text-slate-400 hover:text-white transition flex items-center space-x-1"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span className="hidden md:inline">Share</span>
                            </button>
                          </div>

                          {/* Comments section */}
                          <div className="space-y-3">
                            {postComments.length > 0 && (
                              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {postComments.map((c: any) => (
                                  <div key={c.id} className="p-2.5 bg-[#10131F] rounded-xl border border-slate-800/50 flex justify-between gap-3 items-start">
                                    <div className="flex gap-2">
                                      <img
                                        src={c.author?.avatar}
                                        alt=""
                                        onClick={() => navigateToProfile(c.authorId)}
                                        className="w-7 h-7 rounded-full bg-slate-950 object-cover cursor-pointer"
                                      />
                                      <div>
                                        <div className="flex items-center gap-1.5">
                                          <span
                                            onClick={() => navigateToProfile(c.authorId)}
                                            className="font-bold text-xs text-white hover:text-[#06B6D4] cursor-pointer"
                                          >
                                            {c.author?.displayName}
                                          </span>
                                          <span className="text-[9px] text-slate-400">@{c.author?.username}</span>
                                        </div>
                                        <p className="text-slate-200 text-xs mt-0.5">{c.text}</p>
                                      </div>
                                    </div>

                                    {(c.authorId === me.id || me.isAdmin) && (
                                      <button
                                        onClick={() => handleDeleteComment(c.id)}
                                        className="text-slate-500 hover:text-red-400 p-1"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Comment composer */}
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                placeholder="Type a reply comment..."
                                value={commentInputs[post.id] || ""}
                                onChange={(e) =>
                                  setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleAddComment(post.id);
                                }}
                                className="w-full bg-[#080A12] border border-slate-800 hover:border-slate-700 focus:border-[#7C3AED] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none transition"
                              />
                              <button
                                onClick={() => handleAddComment(post.id)}
                                className="bg-slate-800 hover:bg-slate-700 text-[#06B6D4] p-2 rounded-xl transition"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right panel: Active connections, friend requests, trending games */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Pending Friend Requests widget */}
                {data.friendRequests?.filter((r: any) => r.receiverId === me.id && r.status === "pending").length > 0 && (
                  <div className="bg-[#151927] border border-red-500/30 p-4 rounded-2xl space-y-3">
                    <span className="text-xs font-black text-[#EF4444] uppercase tracking-wider block">
                      ⚠️ Pending Recruits ({data.friendRequests.filter((r: any) => r.receiverId === me.id && r.status === "pending").length})
                    </span>
                    <div className="space-y-2">
                      {data.friendRequests
                        .filter((r: any) => r.receiverId === me.id && r.status === "pending")
                        .map((req: any) => {
                          const requester = data.users.find((u: any) => u.id === req.senderId);
                          if (!requester) return null;
                          return (
                            <div key={req.id} className="p-2.5 bg-[#080A12] rounded-xl flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <img src={requester.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                                <span className="font-extrabold text-xs block text-white truncate max-w-[100px]">
                                  {requester.displayName}
                                </span>
                              </div>
                              <div className="flex space-x-1 shrink-0">
                                <button
                                  onClick={() => handleAcceptRequest(req.id)}
                                  className="px-2 py-1 bg-[#22C55E]/20 hover:bg-[#22C55E]/40 text-[#22C55E] text-[10px] font-black rounded-lg"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleRejectRequest(req.id)}
                                  className="px-2 py-1 bg-red-950/20 hover:bg-red-950/40 text-red-400 text-[10px] font-black rounded-lg"
                                >
                                  Ignore
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Online Friends Widget */}
                <div className="bg-[#151927] border border-slate-800/80 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#06B6D4]">
                      Online Connections
                    </h4>
                    <span className="text-[10px] bg-[#06B6D4]/10 text-[#06B6D4] px-2 py-0.5 rounded-full font-bold">
                      {data.users?.filter((u: any) => u.onlineStatus === "online" && u.id !== me.id).length || 0} active
                    </span>
                  </div>

                  <div className="space-y-3.5 max-h-60 overflow-y-auto">
                    {data.users?.filter((u: any) => u.onlineStatus === "online" && u.id !== me.id).length === 0 ? (
                      <p className="text-xs text-slate-500 italic text-center py-4">No connections are currently online. Add some gamers!</p>
                    ) : (
                      data.users
                        ?.filter((u: any) => u.onlineStatus === "online" && u.id !== me.id)
                        .map((friend: any) => (
                          <div
                            key={friend.id}
                            className="flex items-center justify-between p-2 hover:bg-[#10131F] rounded-xl transition duration-150"
                          >
                            <div
                              onClick={() => navigateToProfile(friend.id)}
                              className="flex items-center space-x-2.5 cursor-pointer"
                            >
                              <div className="relative">
                                <img
                                  src={friend.avatar}
                                  alt={friend.displayName}
                                  className="w-8 h-8 rounded-full border border-slate-800 object-cover"
                                />
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#22C55E] border-2 border-[#151927]" />
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-xs text-white block truncate">{friend.displayName}</span>
                                <span className="text-[9px] text-[#A78BFA] font-extrabold uppercase">{friend.rank}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleStartDM(friend.id)}
                              className="p-1.5 hover:bg-slate-800 text-[#06B6D4] rounded-lg transition"
                              title="Send Direct Message"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                {/* Popular communities widget */}
                <div className="bg-[#151927] border border-slate-800/80 p-5 rounded-2xl space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                    Recommended Communities
                  </h4>
                  <div className="space-y-3">
                    {data.communities?.slice(0, 4).map((comm: any) => {
                      const commMemCount = data.communityMembers?.filter((cm: any) => cm.communityId === comm.id).length || 0;
                      const isJoined = data.communityMembers?.some((cm: any) => cm.communityId === comm.id && cm.userId === me.id);

                      return (
                        <div key={comm.id} className="p-3 bg-[#10131F] border border-slate-800/60 rounded-xl flex items-center justify-between gap-2">
                          <div className="min-w-0 cursor-pointer" onClick={() => navigateToCommunity(comm.slug)}>
                            <span className="font-bold text-xs text-white block truncate">{comm.name}</span>
                            <span className="text-[10px] text-[#06B6D4] block">{comm.gameName} • {commMemCount} members</span>
                          </div>

                          <button
                            onClick={() => handleJoinLeaveCommunity(comm.id)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition ${
                              isJoined
                                ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                : "bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                            }`}
                          >
                            {isJoined ? "LEAVE" : "JOIN"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              SUBVIEW 2: DISCOVER PORTAL
              ========================================== */}
          {activeTab === "discover" && (
            <div className="space-y-8">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-black text-[#06B6D4] tracking-widest">GLOBAL GAMER CENTRAL</span>
                <h2 className="text-3xl font-black text-white">Discover Trends</h2>
                <p className="text-xs text-slate-400">Discover and join trending communities, popular gamers, active tournaments, and live media clips.</p>
              </div>

              {/* Trending Gaming clips simulated gallery */}
              <div className="space-y-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" /> Hot Gaming Clips & Media
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#151927] border border-slate-800 rounded-xl overflow-hidden p-4 space-y-3">
                    <div className="h-40 bg-slate-900 rounded-lg flex items-center justify-center relative border border-slate-800">
                      <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=350" alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                      <span className="relative z-10 text-xs font-black bg-black/80 px-3 py-1.5 rounded-full border border-red-500/50 text-red-400">
                        ▶ VALORANT SCENIC HOOK (0:24)
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#06B6D4] font-extrabold uppercase">Valorant Clutch</span>
                      <p className="font-extrabold text-xs text-white truncate">1v5 Clutch in Competitive Rank Match!</p>
                      <p className="text-[10px] text-slate-400">Published by @ViperReaper • 144 Likes</p>
                    </div>
                  </div>

                  <div className="bg-[#151927] border border-slate-800 rounded-xl overflow-hidden p-4 space-y-3">
                    <div className="h-40 bg-slate-900 rounded-lg flex items-center justify-center relative border border-slate-800">
                      <img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=350" alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                      <span className="relative z-10 text-xs font-black bg-black/80 px-3 py-1.5 rounded-full border border-[#06B6D4]/50 text-[#06B6D4]">
                        ▶ CS2 ACE ROUND DECK (0:15)
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#7C3AED] font-extrabold uppercase">CS2 Pro Matches</span>
                      <p className="font-extrabold text-xs text-white truncate">3-second instant clean headshot ace!</p>
                      <p className="text-[10px] text-slate-400">Published by @ShroudAimer • 230 Likes</p>
                    </div>
                  </div>

                  <div className="bg-[#151927] border border-slate-800 rounded-xl overflow-hidden p-4 space-y-3">
                    <div className="h-40 bg-slate-900 rounded-lg flex items-center justify-center relative border border-slate-800">
                      <img src="https://images.unsplash.com/photo-1605899435973-ca2d1a8861cf?q=80&w=350" alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                      <span className="relative z-10 text-xs font-black bg-black/80 px-3 py-1.5 rounded-full border border-yellow-500/50 text-yellow-400">
                        ▶ MINECRAFT CASTLE SHOWCASE (1:05)
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-emerald-400 font-extrabold uppercase">Minecraft Builds</span>
                      <p className="font-extrabold text-xs text-white truncate">Survival megabuild castle timelapse progress</p>
                      <p className="text-[10px] text-slate-400">Published by @MineLord • 98 Likes</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid of Recommended Gamers to add */}
              <div className="space-y-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" /> Popular Gamers & Potential Squadmates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {data.users?.filter((u: any) => u.id !== me.id).slice(0, 8).map((gamer: any) => {
                    const isFriend = data.friendships?.some((f: any) => f.userId1 === gamer.id || f.userId2 === gamer.id);
                    const sentReq = data.friendRequests?.some((r: any) => r.senderId === me.id && r.receiverId === gamer.id && r.status === "pending");

                    return (
                      <div key={gamer.id} className="bg-[#151927] border border-slate-800 p-4 rounded-xl text-center flex flex-col items-center justify-between space-y-3">
                        <div className="relative">
                          <img src={gamer.avatar} alt="" className="w-16 h-16 rounded-full border border-slate-800 bg-slate-950 object-cover" />
                          <span className={`absolute bottom-0 right-1 w-3.5 h-3.5 rounded-full border-2 border-[#151927] ${
                            gamer.onlineStatus === "online" ? "bg-emerald-500" : "bg-slate-500"
                          }`} />
                        </div>

                        <div>
                          <span
                            onClick={() => navigateToProfile(gamer.id)}
                            className="font-bold text-xs text-white hover:text-[#06B6D4] cursor-pointer block truncate max-w-[130px] mx-auto"
                          >
                            {gamer.displayName}
                          </span>
                          <span className="text-[10px] text-slate-400 block">Level {gamer.gamingLevel} • {gamer.rank}</span>
                          <span className="text-[9px] text-[#A78BFA] font-bold block truncate max-w-[120px] mx-auto mt-0.5">🎮 {gamer.favoriteGame}</span>
                        </div>

                        {isFriend ? (
                          <button
                            onClick={() => handleStartDM(gamer.id)}
                            className="w-full py-1.5 bg-[#06B6D4]/10 hover:bg-[#06B6D4]/20 text-[#06B6D4] text-[10px] font-black rounded-lg transition"
                          >
                            SEND DM
                          </button>
                        ) : sentReq ? (
                          <button
                            disabled
                            className="w-full py-1.5 bg-slate-800 text-slate-500 text-[10px] font-black rounded-lg"
                          >
                            PENDING
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSendFriendRequest(gamer.id)}
                            className="w-full py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[10px] font-black rounded-lg transition"
                          >
                            ADD FRIEND
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              SUBVIEW 3: COMMUNITIES LIST & SPECIFIC COM
              ========================================== */}
          {activeTab === "communities" && (
            <div className="space-y-6">
              
              {/* SPECIFIC SINGLE COMMUNITY VIEW */}
              {activeCommunityId ? (() => {
                const comm = data.communities.find((c: any) => c.id === activeCommunityId);
                if (!comm) return <p>Community not found</p>;

                const commMembers = data.communityMembers?.filter((m: any) => m.communityId === comm.id) || [];
                const isJoined = commMembers.some((m: any) => m.userId === me.id);
                const commPosts = data.posts?.filter((p: any) => p.communityId === comm.id) || [];

                return (
                  <div className="space-y-6">
                    {/* Banner header */}
                    <div className="relative h-60 rounded-2xl overflow-hidden border border-slate-800">
                      <img src={comm.banner} alt={comm.name} className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      
                      {/* Back button */}
                      <button
                        onClick={() => setActiveCommunityId(null)}
                        className="absolute top-4 left-4 flex items-center space-x-1 px-3 py-1.5 bg-black/70 hover:bg-black/90 border border-slate-800 rounded-lg text-xs font-bold text-white transition"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>All Communities</span>
                      </button>

                      {/* Info Overlay */}
                      <div className="absolute bottom-5 left-6 right-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div className="space-y-1 text-left">
                          <span className="px-2.5 py-0.5 bg-[#06B6D4]/30 text-[#22D3EE] text-[10px] font-bold rounded">
                            FRANCHISE: {comm.gameName.toUpperCase()}
                          </span>
                          <h2 className="text-3xl font-black text-white">{comm.name}</h2>
                          <p className="text-slate-300 text-xs md:text-sm max-w-xl">{comm.description}</p>
                          <span className="text-[11px] text-[#A78BFA] font-extrabold block">{commMembers.length} Joined Gamers</span>
                        </div>

                        <button
                          onClick={() => handleJoinLeaveCommunity(comm.id)}
                          className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shrink-0 shadow-lg transition ${
                            isJoined
                              ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                              : "bg-[#06B6D4] hover:bg-[#0891B2] text-white"
                          }`}
                        >
                          {isJoined ? "LEAVE GUILD" : "JOIN GUILD HUB"}
                        </button>
                      </div>
                    </div>

                    {/* Community feed & members list split */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Left: Feed in community */}
                      <div className="lg:col-span-8 space-y-4">
                        <div className="bg-[#151927] border border-slate-800 p-5 rounded-2xl">
                          <span className="text-xs font-black uppercase text-[#06B6D4] tracking-wider block mb-3">
                            Post to {comm.name}
                          </span>
                          <form onSubmit={(e) => handleCreatePost(e, comm.id)} className="space-y-3">
                            <textarea
                              placeholder={`Share a screenshot, squad recruitment notice, or strategic advice for ${comm.gameName}...`}
                              value={newPostText}
                              onChange={(e) => setNewPostText(e.target.value)}
                              rows={2}
                              className="w-full bg-[#080A12] border border-slate-800 hover:border-slate-700/80 focus:border-[#7C3AED] rounded-xl p-3 text-xs text-white focus:outline-none transition resize-none"
                            />
                            <div className="flex justify-end">
                              <button
                                type="submit"
                                className="bg-[#06B6D4] hover:bg-[#0891B2] text-white text-xs font-black px-4 py-2 rounded-xl"
                              >
                                POST TO FORUM (+50 XP)
                              </button>
                            </div>
                          </form>
                        </div>

                        {/* Posts List */}
                        <div className="space-y-4">
                          {commPosts.length === 0 ? (
                            <p className="text-xs text-slate-500 italic text-center py-10 bg-[#151927] border border-slate-800 rounded-xl">No posts published inside {comm.name} yet.</p>
                          ) : (
                            commPosts.map((post: any) => {
                              const hasLiked = data.likes?.some((l: any) => l.postId === post.id && l.userId === me.id);
                              const postLikes = data.likes?.filter((l: any) => l.postId === post.id) || [];
                              const postComments = data.comments?.filter((c: any) => c.postId === post.id) || [];

                              return (
                                <div key={post.id} className="bg-[#151927] border border-slate-800 p-5 rounded-xl space-y-4">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-3">
                                      <img src={post.author?.avatar} alt="" className="w-8.5 h-8.5 rounded-full object-cover" />
                                      <div>
                                        <span onClick={() => navigateToProfile(post.authorId)} className="font-bold text-xs text-white hover:text-[#06B6D4] cursor-pointer">
                                          {post.author?.displayName}
                                        </span>
                                        <span className="text-[9px] text-slate-400 block">Level {post.author?.gamingLevel} • {formatFriendlyDate(post.createdAt)}</span>
                                      </div>
                                    </div>
                                    {(post.authorId === me.id || me.isAdmin) && (
                                      <button onClick={() => handleDeletePost(post.id)} className="text-slate-500 hover:text-red-400 p-1">
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>

                                  <p className="text-xs text-slate-200">{post.text}</p>

                                  <div className="flex items-center space-x-4 border-t border-slate-800/80 pt-3">
                                    <button onClick={() => handleToggleLike(post.id)} className={`flex items-center space-x-1 text-xs font-bold ${hasLiked ? "text-[#EF4444]" : "text-slate-400"}`}>
                                      <Heart className="w-4 h-4" />
                                      <span>{postLikes.length} Likes</span>
                                    </button>
                                    <span className="text-xs text-slate-400 font-bold">
                                      {postComments.length} Comments
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Right: Members List */}
                      <div className="lg:col-span-4 bg-[#151927] border border-slate-800 p-4 rounded-2xl h-fit space-y-3">
                        <span className="text-xs font-black uppercase text-slate-300 block">Joined Gamers ({commMembers.length})</span>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {commMembers.map((cm: any) => {
                            const u = data.users.find((usr: any) => usr.id === cm.userId);
                            if (!u) return null;
                            return (
                              <div key={cm.id} className="p-2 bg-[#080A12] border border-slate-800 rounded-xl flex items-center justify-between">
                                <div onClick={() => navigateToProfile(u.id)} className="flex items-center space-x-2 cursor-pointer">
                                  <img src={u.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                                  <span className="text-xs text-white hover:underline truncate max-w-[130px] font-bold">{u.displayName}</span>
                                </div>
                                <span className={`w-2 h-2 rounded-full ${u.onlineStatus === 'online' ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })() : (
                <div className="space-y-6">
                  {/* Community Hub Directory */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-white">Gaming Communities</h2>
                      <p className="text-xs text-slate-400">Join official franchise networks to network, discover strategy details, and register custom events.</p>
                    </div>

                    <button
                      onClick={() => setShowCreateCommunityModal(true)}
                      className="bg-[#06B6D4] hover:bg-[#0891B2] text-white text-xs font-extrabold px-4 py-2.5 rounded-xl flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Form Community</span>
                    </button>
                  </div>

                  {/* Communities grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {data.communities?.map((comm: any) => {
                      const commMemCount = data.communityMembers?.filter((cm: any) => cm.communityId === comm.id).length || 0;
                      const isJoined = data.communityMembers?.some((cm: any) => cm.communityId === comm.id && cm.userId === me.id);

                      return (
                        <div key={comm.id} className="bg-[#151927] border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between neon-glow-purple">
                          <div className="h-32 bg-slate-900 relative">
                            <img src={comm.banner} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#151927] to-transparent" />
                            <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/80 border border-slate-800 text-[9px] text-[#06B6D4] font-black rounded uppercase">
                              {comm.gameName}
                            </span>
                          </div>

                          <div className="p-5 space-y-3 flex-grow flex flex-col justify-between">
                            <div className="space-y-1">
                              <h3 className="font-extrabold text-base text-white">{comm.name}</h3>
                              <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                                {comm.description}
                              </p>
                              <span className="text-[10px] text-[#A78BFA] font-bold block">{commMemCount} Members Joined</span>
                            </div>

                            <div className="pt-3 flex gap-2">
                              <button
                                onClick={() => {
                                  setActiveCommunityId(comm.id);
                                }}
                                className="flex-grow py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition text-center"
                              >
                                ENTER LOUNGE
                              </button>
                              <button
                                onClick={() => handleJoinLeaveCommunity(comm.id)}
                                className={`px-4 py-2 text-xs font-black rounded-xl transition ${
                                  isJoined
                                    ? "bg-red-950/20 text-red-400 border border-red-900/40"
                                    : "bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
                                }`}
                              >
                                {isJoined ? "LEAVE" : "JOIN"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              SUBVIEW 4: TOURNAMENT BRACKETS & REGISTRATION
              ========================================== */}
          {activeTab === "tournaments" && (
            <div className="space-y-6">
              
              {/* SINGLE TOURNAMENT VIEW */}
              {activeTournamentId ? (() => {
                const tourney = data.tournaments.find((t: any) => t.id === activeTournamentId);
                if (!tourney) return <p>Tournament not found</p>;

                const participants = data.tournamentParticipants?.filter((p: any) => p.tournamentId === tourney.id) || [];
                const hasJoined = participants.some((p: any) => p.userId === me.id);
                const bracketMatches = JSON.parse(tourney.bracketData || "[]");

                return (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="relative h-60 rounded-2xl overflow-hidden border border-slate-800">
                      <img src={tourney.banner} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      
                      {/* Back button */}
                      <button
                        onClick={() => setActiveTournamentId(null)}
                        className="absolute top-4 left-4 flex items-center space-x-1 px-3 py-1.5 bg-black/70 hover:bg-black/90 border border-slate-800 rounded-lg text-xs font-bold text-white transition"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>All Tournaments</span>
                      </button>

                      <div className="absolute bottom-5 left-6 right-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 text-[9px] font-black uppercase tracking-wider rounded">
                            🏆 {tourney.status.toUpperCase()} • ENTRY: {tourney.entryRequirement}
                          </span>
                          <h2 className="text-3xl font-black text-white mt-1">{tourney.name}</h2>
                          <p className="text-xs text-slate-300 max-w-2xl">{tourney.description}</p>
                          <p className="text-[11px] text-slate-400 font-bold">
                            Starts: {tourney.startDate} | Grand Prize: <span className="text-yellow-400 font-extrabold">{tourney.prize}</span>
                          </p>
                        </div>

                        {tourney.status !== "completed" && (
                          <div className="flex gap-2 shrink-0">
                            {hasJoined ? (
                              <button
                                onClick={() => handleLeaveTournament(tourney.id)}
                                className="px-5 py-2.5 bg-red-950/20 border border-red-900/40 text-red-400 text-xs font-extrabold rounded-xl"
                              >
                                WITHDRAW
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  const name = prompt("Enter your team name (or leave blank for default):", `${me.displayName}'s Team`);
                                  if (name !== null) handleJoinTournament(tourney.id, name);
                                }}
                                className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-black rounded-xl"
                              >
                                REGISTER TEAM
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Split: Brackets, Rules, Organizers */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Left: Tournament rules, details and brackets */}
                      <div className="lg:col-span-8 space-y-6">
                        
                        {/* Brackets Visualization */}
                        <div className="p-6 bg-[#151927] border border-slate-800 rounded-2xl space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-black text-white uppercase tracking-wider">
                              Interactive Match Bracket Diagram
                            </span>
                            <div className="flex space-x-2">
                              {(tourney.createdBy === me.id || me.isAdmin) && tourney.status !== "completed" && (
                                <button
                                  onClick={() => handleSimulateBracketScore(tourney.id)}
                                  className="px-3 py-1.5 bg-[#06B6D4]/20 hover:bg-[#06B6D4]/30 text-[#06B6D4] text-[10px] font-black rounded-lg transition"
                                >
                                  Simulate Bracket Match Outcomes
                                </button>
                              )}
                            </div>
                          </div>

                          {bracketMatches.length === 0 ? (
                            <div className="py-8 text-center text-slate-500 space-y-2">
                              <p className="text-xs">No bracket rounds constructed yet. When more players register, the brackets populate here.</p>
                              <p className="text-[10px] text-slate-400">Total Teams Registered: {participants.length} / {tourney.maxPlayers}</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {bracketMatches.map((match: any, index: number) => (
                                  <div key={index} className="p-3 bg-[#080A12] border border-slate-800 rounded-xl space-y-2">
                                    <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-800/80 pb-1.5">
                                      <span>Round {match.round} • Duel #{match.match}</span>
                                      {match.winner && (
                                        <span className="text-emerald-400 font-extrabold uppercase">Winner: {match.winner}</span>
                                      )}
                                    </div>

                                    <div className="space-y-1">
                                      <div className={`flex justify-between items-center px-2 py-1 rounded text-xs ${
                                        match.winner === match.p1 ? "bg-emerald-950/20 text-emerald-400" : "text-slate-300"
                                      }`}>
                                        <span className="font-extrabold">{match.p1 || "TBD / BYE"}</span>
                                        <span>{match.score1}</span>
                                      </div>
                                      <div className={`flex justify-between items-center px-2 py-1 rounded text-xs ${
                                        match.winner === match.p2 ? "bg-emerald-950/20 text-emerald-400" : "text-slate-300"
                                      }`}>
                                        <span className="font-extrabold">{match.p2 || "TBD / BYE"}</span>
                                        <span>{match.score2}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Rules card */}
                        <div className="p-5 bg-[#151927] border border-slate-800 rounded-2xl space-y-3">
                          <span className="text-xs font-black uppercase text-slate-300">Rules & Instructions</span>
                          <p className="text-slate-200 text-xs whitespace-pre-wrap leading-relaxed">{tourney.rules}</p>
                        </div>
                      </div>

                      {/* Right: Participants list & declare winner */}
                      <div className="lg:col-span-4 space-y-4">
                        
                        {/* Organizer controls (admin only) */}
                        {(tourney.createdBy === me.id || me.isAdmin) && tourney.status !== "completed" && (
                          <div className="p-4 bg-yellow-950/20 border border-yellow-900/30 rounded-2xl space-y-3">
                            <span className="text-xs font-black text-yellow-400 block uppercase">Organizer Deck</span>
                            <p className="text-[11px] text-slate-400">Award victory to any participant to automatically award 500 XP & lock trophy badge.</p>
                            
                            <div className="space-y-1.5">
                              {participants.map((p: any) => {
                                const u = data.users.find((usr: any) => usr.id === p.userId);
                                return (
                                  <button
                                    key={p.id}
                                    onClick={() => handleDeclareWinner(tourney.id, p.userId)}
                                    className="w-full text-left p-2 bg-[#151927] hover:bg-yellow-500 hover:text-black border border-slate-800 rounded-lg text-xs font-bold transition flex justify-between"
                                  >
                                    <span>🏆 Award {u?.displayName || p.teamName}</span>
                                    <span>Declare Champion</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Participants list */}
                        <div className="p-4 bg-[#151927] border border-slate-800 rounded-2xl space-y-3">
                          <span className="text-xs font-black uppercase text-slate-300 block">Registered Teams ({participants.length} / {tourney.maxPlayers})</span>
                          <div className="space-y-2">
                            {participants.length === 0 ? (
                              <p className="text-xs text-slate-500 italic py-2">No teams registered yet.</p>
                            ) : (
                              participants.map((p: any) => {
                                const u = data.users.find((usr: any) => usr.id === p.userId);
                                return (
                                  <div key={p.id} className="p-2.5 bg-[#080A12] border border-slate-800 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <img src={u?.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                                      <div>
                                        <span className="text-xs font-bold text-white block">{p.teamName}</span>
                                        <span className="text-[9px] text-[#06B6D4] block">@{u?.username} • Rank {u?.rank}</span>
                                      </div>
                                    </div>
                                    <span className="text-xs font-black text-[#A78BFA]">{p.score} pts</span>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })() : (
                <div className="space-y-6">
                  {/* Tournaments Lobby */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-white">Championship Tournaments</h2>
                      <p className="text-xs text-slate-400">Join competitive multiplayer bracket skirmishes. Complete placements to receive legendary badges and XP points.</p>
                    </div>

                    <button
                      onClick={() => setShowCreateTournamentModal(true)}
                      className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-extrabold px-4 py-2.5 rounded-xl flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Host Tournament</span>
                    </button>
                  </div>

                  {/* Grouped lists */}
                  <div className="space-y-8">
                    
                    {/* Active & Live */}
                    <div className="space-y-3">
                      <span className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" /> LIVE SKIRMISHES ONGOING
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {data.tournaments?.filter((t: any) => t.status === "live").map((tourney: any) => {
                          const parts = data.tournamentParticipants?.filter((p: any) => p.tournamentId === tourney.id) || [];
                          return (
                            <div key={tourney.id} className="bg-[#151927] border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4 relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-full blur-xl" />
                              <div className="space-y-1">
                                <span className="text-[9px] bg-red-500/30 text-red-400 px-2 py-0.5 rounded font-black uppercase inline-block">LIVE BRACKETS</span>
                                <h3 className="font-extrabold text-base text-white">{tourney.name}</h3>
                                <p className="text-xs text-[#06B6D4] font-semibold">{tourney.game} • Grand Prize: {tourney.prize}</p>
                                <p className="text-slate-400 text-xs line-clamp-2">{tourney.description}</p>
                              </div>

                              <div className="flex justify-between items-center pt-2">
                                <span className="text-[10px] text-slate-400">{parts.length} Teams Competing</span>
                                <button
                                  onClick={() => setActiveTournamentId(tourney.id)}
                                  className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-black rounded-xl transition"
                                >
                                  VIEW MATCHES
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        {data.tournaments?.filter((t: any) => t.status === "live").length === 0 && (
                          <p className="text-xs text-slate-500 italic">No tournaments are currently in live status.</p>
                        )}
                      </div>
                    </div>

                    {/* Upcoming */}
                    <div className="space-y-3">
                      <span className="text-xs font-black uppercase tracking-wider text-[#06B6D4] flex items-center gap-1.5">
                        <Clock className="w-4.5 h-4.5 text-[#06B6D4]" /> UPCOMING BRACKETS OPEN
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {data.tournaments?.filter((t: any) => t.status === "upcoming").map((tourney: any) => {
                          const parts = data.tournamentParticipants?.filter((p: any) => p.tournamentId === tourney.id) || [];
                          return (
                            <div key={tourney.id} className="bg-[#151927] border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between">
                              <div className="h-28 bg-slate-900 relative">
                                <img src={tourney.banner} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/80 text-[8px] text-yellow-400 font-black rounded uppercase">
                                  {tourney.game}
                                </span>
                              </div>

                              <div className="p-5 space-y-4">
                                <div className="space-y-1">
                                  <h3 className="font-extrabold text-sm text-white line-clamp-1">{tourney.name}</h3>
                                  <p className="text-[10px] text-slate-400">Starts: {tourney.startDate}</p>
                                  <p className="text-[10px] text-yellow-400 font-extrabold">Prize: {tourney.prize}</p>
                                </div>

                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] text-slate-400">{parts.length} / {tourney.maxPlayers} Teams</span>
                                  <button
                                    onClick={() => setActiveTournamentId(tourney.id)}
                                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black rounded-xl"
                                  >
                                    REGISTER
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              SUBVIEW 5: THE GLOBAL LEADERBOARD
              ========================================== */}
          {activeTab === "leaderboard" && (
            <div className="bg-[#151927] border border-slate-800 p-6 rounded-2xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <h2 className="text-2xl font-black text-white flex items-center gap-2">
                    <Crown className="w-6 h-6 text-yellow-500" /> PlayNexus Global Leaderboards
                  </h2>
                  <p className="text-xs text-slate-400">Real-time rank list of gamers based on level achievements and experience points (XP).</p>
                </div>

                <div className="flex space-x-2">
                  <span className="text-xs font-extrabold bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/30 py-1.5 px-3.5 rounded-xl uppercase">
                    All Franchises Combined
                  </span>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Gamer Name</th>
                      <th className="py-3 px-4">Level</th>
                      <th className="py-3 px-4">Experience Points (XP)</th>
                      <th className="py-3 px-4">Syndicate Title</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {data.users?.map((usr: any, index: number) => (
                      <tr key={usr.id} className={`hover:bg-[#10131F] transition ${usr.id === me.id ? "bg-[#7C3AED]/5 border-l-2 border-[#7C3AED]" : ""}`}>
                        <td className="py-4 px-4 font-black">
                          {index === 0 && <span className="text-yellow-500">🥇 1st</span>}
                          {index === 1 && <span className="text-slate-300">🥈 2nd</span>}
                          {index === 2 && <span className="text-amber-600">🥉 3rd</span>}
                          {index > 2 && `${index + 1}`}
                        </td>
                        <td className="py-4 px-4">
                          <div onClick={() => navigateToProfile(usr.id)} className="flex items-center space-x-3 cursor-pointer">
                            <img src={usr.avatar} alt="" className="w-8 h-8 rounded-full bg-slate-900 object-cover" />
                            <div>
                              <span className="font-extrabold text-white block hover:underline">{usr.displayName}</span>
                              <span className="text-[10px] text-slate-400">@{usr.username}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-black text-[#06B6D4]">LVL {usr.gamingLevel}</td>
                        <td className="py-4 px-4">
                          <span className="font-mono text-slate-200">{usr.xp} XP</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 bg-[#10131F] text-[#A78BFA] border border-slate-800 rounded-lg font-bold text-[10px]">
                            {usr.rank}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center space-x-1 px-2 py-0.5 text-[9px] font-black uppercase rounded ${
                            usr.onlineStatus === "online" ? "bg-emerald-950/35 text-emerald-400" : "bg-slate-950 text-slate-500"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1 ${usr.onlineStatus === 'online' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                            {usr.onlineStatus}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {usr.id !== me.id && (
                            <button
                              onClick={() => handleStartDM(usr.id)}
                              className="px-3 py-1 bg-[#06B6D4]/10 hover:bg-[#06B6D4] hover:text-black border border-[#06B6D4]/30 text-[#06B6D4] text-[10px] font-bold rounded-lg transition"
                            >
                              CHALLENGE
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==========================================
              SUBVIEW 6: REAL-TIME CHAT (MESSAGES)
              ========================================== */}
          {activeTab === "messages" && (
            <div className="bg-[#151927] border border-slate-800 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[calc(100vh-12rem)] md:h-[620px] shadow-2xl">
              
              {/* Left Side: Conversations list */}
              <div className="md:col-span-4 border-r border-slate-800 flex flex-col justify-between bg-[#10131F]">
                
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-slate-300">Channels</span>
                    
                    <button
                      onClick={() => setShowCreateGroupModal(true)}
                      className="p-1.5 hover:bg-slate-800 text-[#06B6D4] border border-[#06B6D4]/30 hover:border-[#06B6D4] rounded-lg transition"
                      title="New Gaming Group"
                    >
                      <Plus className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  {/* Search conversations */}
                  <input
                    type="text"
                    placeholder="Search channels..."
                    value={chatSearchQuery}
                    onChange={(e) => setChatSearchQuery(e.target.value)}
                    className="w-full bg-[#080A12] border border-slate-800 hover:border-slate-700 focus:border-[#7C3AED] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none transition"
                  />
                </div>

                {/* Conversation List wrapper */}
                <div className="flex-grow overflow-y-auto divide-y divide-slate-800/40 p-2 space-y-1">
                  {data.conversations?.length === 0 ? (
                    <p className="text-xs text-slate-500 italic text-center py-10">No active conversations yet.</p>
                  ) : (
                    data.conversations
                      ?.filter((conv: any) => {
                        if (!chatSearchQuery) return true;
                        if (conv.isGroup) return conv.name.toLowerCase().includes(chatSearchQuery.toLowerCase());
                        const otherMember = conv.members?.find((m: any) => m.userId !== me.id);
                        return otherMember?.user?.displayName.toLowerCase().includes(chatSearchQuery.toLowerCase());
                      })
                      .map((conv: any) => {
                        const isGrp = conv.isGroup;
                        const otherMember = conv.members?.find((m: any) => m.userId !== me.id);
                        const chatName = isGrp ? conv.name : (otherMember?.user?.displayName || "Private Gamer");
                        const chatImg = isGrp ? conv.groupImage : (otherMember?.user?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=pvt");
                        const lastMsg = conv.messages?.[0];

                        return (
                          <div
                            key={conv.id}
                            onClick={() => {
                              setActiveConversationId(conv.id);
                            }}
                            className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition ${
                              activeConversationId === conv.id ? "bg-[#7C3AED]/20 border border-[#7C3AED]/40" : "hover:bg-[#151927]"
                            }`}
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <div className="relative">
                                <img src={chatImg} alt="" className="w-10 h-10 rounded-xl bg-slate-950 object-cover" />
                                {!isGrp && otherMember?.user?.onlineStatus === "online" && (
                                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#22C55E] border-2 border-[#10131F]" />
                                )}
                              </div>
                              <div className="min-w-0 text-left">
                                <span className="font-extrabold text-xs text-white block truncate">{chatName}</span>
                                <p className="text-[11px] text-slate-400 truncate">
                                  {lastMsg ? lastMsg.text : "No messages yet."}
                                </p>
                              </div>
                            </div>

                            {/* Unread indicators */}
                            {conv.messages?.some((m: any) => !m.isSeen && m.senderId !== me.id) && (
                              <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4] shrink-0" />
                            )}
                          </div>
                        );
                      })
                  )}
                </div>
              </div>

              {/* Center & Right: Current Active Conversation */}
              <div className="md:col-span-8 flex flex-col justify-between h-full bg-[#080A12]">
                {activeConversationId ? (() => {
                  const conv = data.conversations.find((c: any) => c.id === activeConversationId);
                  if (!conv) return <p className="text-slate-500 italic p-6">Conversation channel closed</p>;

                  const isGrp = conv.isGroup;
                  const otherMember = conv.members?.find((m: any) => m.userId !== me.id);
                  const chatName = isGrp ? conv.name : (otherMember?.user?.displayName || "Private Gamer");
                  const chatImg = isGrp ? conv.groupImage : (otherMember?.user?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=pvt");

                  return (
                    <div className="flex flex-col h-full justify-between">
                      {/* Active Chat Header */}
                      <div className="p-4 bg-[#10131F] border-b border-slate-800 flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <img src={chatImg} alt="" className="w-10 h-10 rounded-xl bg-slate-950 object-cover" />
                          <div className="text-left">
                            <span className="font-extrabold text-xs text-white block">{chatName}</span>
                            <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">
                              {isGrp ? `${conv.members?.length} Members | Group Lobby` : (otherMember?.user?.onlineStatus === 'online' ? '🟢 Online Channel' : '⚫ Offline')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              const note = prompt("Flag or file a toxic report against this dialogue conversation? Reason:");
                              if (note) {
                                handleOpenReportModal("message", conv.id);
                              }
                            }}
                            className="p-2 hover:bg-slate-800 text-slate-500 hover:text-yellow-500 rounded-lg transition"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Messages Logs lists */}
                      <div className="flex-grow overflow-y-auto p-4 space-y-4 flex flex-col-reverse">
                        {conv.messages?.length === 0 ? (
                          <div className="py-20 text-center text-slate-500 italic">
                            No communications transmitted. Write a message below to begin the lobby dialogue.
                          </div>
                        ) : (
                          conv.messages.map((msg: any) => {
                            const isMe = msg.senderId === me.id;
                            const msgAuthor = conv.members?.find((m: any) => m.userId === msg.senderId);

                            return (
                              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[70%] rounded-2xl p-3.5 space-y-1.5 ${
                                  isMe ? "bg-[#7C3AED] text-white rounded-br-none" : "bg-[#151927] text-slate-200 rounded-bl-none border border-slate-800/80"
                                }`}>
                                  
                                  {/* Author Name for Group */}
                                  {!isMe && isGrp && (
                                    <span className="text-[10px] text-[#06B6D4] font-black uppercase tracking-wider block">
                                      {msgAuthor?.user?.displayName || "Gamer"}
                                    </span>
                                  )}

                                  {/* Reply snippet preview if any */}
                                  {msg.replyToId && (
                                    <div className="p-1.5 bg-black/30 border-l-2 border-slate-400 text-[10px] italic rounded mb-1 text-slate-300">
                                      Replying to previous message
                                    </div>
                                  )}

                                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                                  {/* Message Attachment rendering */}
                                  {msg.attachmentUrl && (
                                    <div className="rounded overflow-hidden max-h-[140px] border border-black/40 mt-1">
                                      <img src={msg.attachmentUrl} alt="" className="w-full object-cover max-h-[140px]" />
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between text-[8px] opacity-65 pt-1">
                                    <span>{formatFriendlyDate(msg.createdAt)}</span>
                                    {isMe && (
                                      <span className="ml-2" title={msg.isSeen ? "Seen" : "Delivered"}>{msg.isSeen ? "✓✓ Seen" : "✓ Delivered"}</span>
                                    )}
                                    {isMe && (
                                      <button onClick={() => handleDeleteMessage(msg.id)} className="hover:text-red-400 transition ml-2" aria-label="Delete message">
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Message composer input section */}
                      <div className="p-4 bg-[#10131F] border-t border-slate-800">
                        {/* Selected reply visual alert */}
                        {replyingToMessageId && (
                          <div className="p-2 bg-[#080A12] rounded-lg mb-2 flex justify-between items-center text-xs">
                            <span className="text-slate-400 italic">Replying to message ID: {replyingToMessageId}</span>
                            <button onClick={() => setReplyingToMessageId(null)} className="text-red-400">Cancel</button>
                          </div>
                        )}

                        <form onSubmit={handleSendMessage} className="space-y-3">
                          {/* Rich attachment URL expander */}
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              placeholder="Optional image/attachment URL..."
                              value={chatAttachmentUrl}
                              onChange={(e) => setChatAttachmentUrl(e.target.value)}
                              className="w-full bg-[#080A12] border border-slate-800 hover:border-slate-700/80 focus:border-[#7C3AED] rounded-lg px-3.5 py-1.5 text-[10px] text-white focus:outline-none transition"
                            />
                            {chatAttachmentUrl && (
                              <button onClick={() => setChatAttachmentUrl("")} className="text-xs text-red-400">Clear</button>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            {/* Emoji selector helper */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setShowEmojiPanel(!showEmojiPanel)}
                                className="p-2 bg-[#151927] hover:bg-[#1E2538] border border-slate-800 rounded-xl text-slate-300"
                                title="Gamer Emojis"
                              >
                                <Smile className="w-4.5 h-4.5" />
                              </button>

                              {showEmojiPanel && (
                                <div className="absolute bottom-12 left-0 z-40 bg-[#151927] border border-slate-800 p-2.5 rounded-xl shadow-2xl grid grid-cols-4 gap-1.5 w-36">
                                  {["🔥", "👑", "🎮", "👍", "😂", "💀", "😮", "💔"].map((emoji) => (
                                    <button
                                      key={emoji}
                                      type="button"
                                      onClick={() => {
                                        setChatMessageText(chatMessageText + emoji);
                                        setShowEmojiPanel(false);
                                      }}
                                      className="hover:bg-slate-800 p-1 rounded.text-sm"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            <input
                              type="text"
                              placeholder="Write a secure encrypted lobby message..."
                              value={chatMessageText}
                              onChange={(e) => setChatMessageText(e.target.value)}
                              className="flex-grow bg-[#080A12] border border-slate-800 hover:border-slate-700 focus:border-[#7C3AED] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition"
                            />

                            <button
                              type="submit"
                              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white p-2.5 rounded-xl transition"
                            >
                              <Send className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </form>
                      </div>

                    </div>
                  );
                })() : (
                  <div className="flex flex-col items-center justify-center py-40 text-center space-y-4">
                    <div className="p-4 bg-[#7C3AED]/10 rounded-full border border-[#7C3AED]/30 animate-pulse">
                      <MessageSquare className="w-12 h-12 text-[#A78BFA]" />
                    </div>
                    <h3 className="text-lg font-black text-white">Direct Messaging Shell</h3>
                    <p className="text-slate-500 text-xs max-w-sm">
                      Select a gamer connection or initialize a group scrim to establish high-speed secure chat links.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ==========================================
              SUBVIEW 7: NOTIFICATIONS AND ALERTS
              ========================================== */}
          {activeTab === "notifications" && (
            <div className="bg-[#151927] border border-slate-800 p-6 rounded-2xl space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-2xl font-black text-white">Transmissions Alert Log</h2>
                  <p className="text-xs text-slate-400">Your secure inbox logs regarding matches, friendships, and community updates.</p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handleMarkNotificationsRead}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-lg"
                  >
                    Mark All Read
                  </button>
                  <button
                    onClick={handleClearNotifications}
                    className="px-3 py-1.5 bg-red-950/20 border border-red-900/40 text-red-400 text-xs font-bold rounded-lg"
                  >
                    Clear Log
                  </button>
                </div>
              </div>

              {data.notifications?.length === 0 ? (
                <div className="py-20 text-center text-slate-500 italic space-y-2">
                  <p className="text-xs">Your transmission logs are clean. No alert notifications on record.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {data.notifications.map((note: any) => (
                    <div
                      key={note.id}
                      className={`p-4 rounded-xl border flex items-center justify-between transition ${
                        note.isRead ? "bg-[#10131F]/50 border-slate-850 text-slate-400" : "bg-[#151927] border-[#06B6D4]/30 text-white"
                      }`}
                    >
                      <div className="flex items-center space-x-3 text-left">
                        <div className="w-2 h-2 rounded-full shrink-0 bg-[#06B6D4]" style={{ opacity: note.isRead ? 0 : 1 }} />
                        <div>
                          <p className="text-xs font-bold leading-relaxed">{note.message}</p>
                          <span className="text-[10px] text-slate-500 block">{formatFriendlyDate(note.createdAt)}</span>
                        </div>
                      </div>

                      {/* Target Click triggers tabs */}
                      <button
                        onClick={() => {
                          if (note.type === "friend_request" || note.type === "friend_accepted") {
                            setActiveTab("dashboard");
                          } else if (note.type === "new_message") {
                            setActiveConversationId(note.referenceId);
                            setActiveTab("messages");
                          } else if (note.type === "tournament_invite" || note.type === "tournament_result") {
                            setActiveTournamentId(note.referenceId);
                            setActiveTab("tournaments");
                          } else {
                            setActiveTab("dashboard");
                          }
                          // mark read
                          handleMarkNotificationsRead();
                        }}
                        className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg font-extrabold"
                      >
                        VIEW CHANNEL
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              SUBVIEW 8: GAMER PROFILE (DETAILS & TROPHIES)
              ========================================== */}
          {activeTab === "profile" && activeProfileId !== null && (() => {
            const profile = data.users?.find((u: any) => u.id === activeProfileId);
            if (!profile) return <p className="text-slate-500">Profile loader failure</p>;

            const pPosts = data.posts?.filter((p: any) => p.authorId === profile.id) || [];
            const isMe = profile.id === me.id;

            // Check if friends
            const isFriend = data.friendships?.some((f: any) => f.userId1 === profile.id || f.userId2 === profile.id);
            const sentReq = data.friendRequests?.some((r: any) => r.senderId === me.id && r.receiverId === profile.id && r.status === "pending");

            // Earned achievements badges for this profile
            const unlockedKeys = data.earnedAchievements?.filter((ea: any) => ea.userId === profile.id).map((ea: any) => {
              const ach = data.achievements?.find((a: any) => a.id === ea.achievementId);
              return ach ? ach.key : null;
            }).filter(Boolean) || [];

            return (
              <div className="space-y-6">
                
                {/* Cover & Header card */}
                <div className="bg-[#151927] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  {/* Cover */}
                  <div className="h-44 relative bg-slate-900">
                    <img src={profile.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#151927] via-[#151927]/30 to-transparent" />
                  </div>

                  {/* Gamer Info Block */}
                  <div className="p-6 pt-0 relative flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-5 -mt-10">
                      <img
                        src={profile.avatar}
                        alt=""
                        className="w-24 h-24 rounded-2xl border-4 border-[#151927] bg-[#080A12] object-cover shadow-2xl relative z-10"
                      />
                      <div className="text-center md:text-left space-y-1">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                          <h2 className="text-2xl font-black text-white">{profile.displayName}</h2>
                          <span className={`w-3 h-3 rounded-full border border-[#151927] ${
                            profile.onlineStatus === "online" ? "bg-emerald-500 animate-pulse" : "bg-slate-500"
                          }`} />
                        </div>
                        <p className="text-xs text-[#06B6D4] font-extrabold">@{profile.username} • Level {profile.gamingLevel} Gamer</p>
                        <p className="text-[11px] text-[#A78BFA] font-bold uppercase tracking-wider">🎮 Fav Game: {profile.favoriteGame}</p>
                      </div>
                    </div>

                    {/* Action buttons (Add friend, send DM, or edit if ME) */}
                    <div className="flex justify-center space-x-2.5 shrink-0">
                      {isMe ? (
                        <button
                          onClick={() => {
                            setActiveTab("settings");
                          }}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
                        >
                          EDIT PROFILE
                        </button>
                      ) : (
                        <>
                          {isFriend ? (
                            <>
                              <button
                                onClick={() => handleStartDM(profile.id)}
                                className="px-4 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl"
                              >
                                SEND DM
                              </button>
                              <button
                                onClick={() => handleRemoveFriend(profile.id)}
                                className="px-3.5 py-2.5 bg-red-950/20 border border-red-900/30 text-red-400 text-xs font-bold rounded-xl hover:bg-red-950/40"
                              >
                                DISCONNECT
                              </button>
                            </>
                          ) : sentReq ? (
                            <button
                              disabled
                              className="px-4 py-2.5 bg-slate-800 text-slate-500 text-xs font-bold rounded-xl cursor-not-allowed"
                            >
                              PENDING APPROVAL
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSendFriendRequest(profile.id)}
                              className="px-4 py-2.5 bg-[#06B6D4] hover:bg-[#0891B2] text-white text-xs font-black rounded-xl"
                            >
                              ADD RECRUIT FRIEND
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenReportModal("user", profile.id)}
                            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-yellow-500 border border-slate-700 rounded-xl"
                            title="Report User Profile"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sub-grid: Stats, Bio, Achievements, User Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column: Stats & Badges */}
                  <div className="lg:col-span-4 space-y-6">
                    {/* Bio Card */}
                    <div className="p-5 bg-[#151927] border border-slate-800 rounded-2xl text-left space-y-2">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Bio Description</span>
                      <p className="text-slate-200 text-xs leading-relaxed whitespace-pre-wrap">{profile.bio || "No gamer bio declared."}</p>
                    </div>

                    {/* Stats */}
                    <div className="p-5 bg-[#151927] border border-slate-800 rounded-2xl text-left space-y-4">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Gamer Statistics</span>
                      
                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="p-3 bg-[#080A12] rounded-xl border border-slate-800 text-center">
                          <span className="text-slate-400 text-[9px] uppercase font-bold block">Experience</span>
                          <span className="text-base font-black text-[#06B6D4] block mt-1">{profile.xp} XP</span>
                        </div>
                        <div className="p-3 bg-[#080A12] rounded-xl border border-slate-800 text-center">
                          <span className="text-slate-400 text-[9px] uppercase font-bold block">Title Group</span>
                          <span className="text-xs font-black text-[#A78BFA] block truncate mt-1">{profile.rank}</span>
                        </div>
                      </div>
                    </div>

                    {/* Badge Trophy Achievement Grid */}
                    <div className="p-5 bg-[#151927] border border-slate-800 rounded-2xl text-left space-y-4">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Unlocked Badges / Achievements</span>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {data.achievements?.map((ach: any) => {
                          const isUnlocked = isMe
                            ? data.earnedAchievements?.some((ea: any) => ea.achievementId === ach.id)
                            : unlockedKeys.includes(ach.key);

                          return (
                            <div
                              key={ach.id}
                              className={`p-2.5 rounded-xl border text-center space-y-1 transition ${
                                isUnlocked
                                  ? "bg-gradient-to-br from-[#7C3AED]/10 to-transparent border-[#7C3AED]/30 text-white"
                                  : "bg-slate-900/40 border-slate-850 opacity-40 text-slate-500"
                              }`}
                              title={ach.description}
                            >
                              <span className="text-2xl block">{ach.icon}</span>
                              <span className="font-extrabold text-[10px] block truncate">{ach.title}</span>
                              <span className="text-[8px] text-[#06B6D4] uppercase block tracking-wider">+{ach.xpReward} XP</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: User specific social feed */}
                  <div className="lg:col-span-8 space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider text-left">
                      Recent Activity Feed ({pPosts.length})
                    </h3>

                    {pPosts.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-12 text-center bg-[#151927] border border-slate-800 rounded-2xl">
                        No activity posts published by this user.
                      </p>
                    ) : (
                      pPosts.map((post: any) => {
                        const hasLiked = data.likes?.some((l: any) => l.postId === post.id && l.userId === me.id);
                        const postLikes = data.likes?.filter((l: any) => l.postId === post.id) || [];

                        return (
                          <div key={post.id} className="bg-[#151927] border border-slate-800 p-5 rounded-2xl text-left space-y-3">
                            <div className="flex justify-between items-center text-[11px] text-slate-400">
                              <span>Transmitted on {formatFriendlyDate(post.createdAt)}</span>
                              {isMe && (
                                <button onClick={() => handleDeletePost(post.id)} className="text-slate-500 hover:text-red-400 p-1">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{post.text}</p>
                            
                            {post.imageUrl && (
                              <div className="rounded overflow-hidden max-h-[220px] border border-slate-800">
                                <img src={post.imageUrl} alt="" className="w-full object-cover max-h-[220px]" />
                              </div>
                            )}

                            <div className="flex items-center space-x-4 border-t border-slate-800/80 pt-3 text-[11px] font-bold text-slate-400">
                              <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-red-500 fill-current" /> {postLikes.length} Likes</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              </div>
            );
          })()}

          {/* ==========================================
              SUBVIEW 9: ACCOUNT SETTINGS
              ========================================== */}
          {activeTab === "settings" && (
            <div className="bg-[#151927] border border-slate-800 p-6 rounded-2xl max-w-2xl mx-auto space-y-6">
              <div className="border-b border-slate-800 pb-4 text-left">
                <h2 className="text-2xl font-black text-white">Gamer Account Settings</h2>
                <p className="text-xs text-slate-400">Configure your gamer tag identity, avatar, and background cover parameters.</p>
              </div>

              {/* Edit form */}
              <form onSubmit={handleUpdateProfile} className="space-y-4 text-left">
                <div>
                  <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">
                    Gamer Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    className="w-full bg-[#080A12] border border-slate-800 hover:border-slate-700 focus:border-[#7C3AED] rounded-xl px-4 py-3 text-xs text-white focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">
                    Gaming Biography / Bio
                  </label>
                  <textarea
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Tell other gamers about your team history, roles (AWPer, Duelist), or custom gear..."
                    className="w-full bg-[#080A12] border border-slate-800 hover:border-slate-700 focus:border-[#7C3AED] rounded-xl px-4 py-3 text-xs text-white focus:outline-none transition resize-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">
                    Favorite Franchise Game
                  </label>
                  <select
                    value={editFavoriteGame}
                    onChange={(e) => setEditFavoriteGame(e.target.value)}
                    className="w-full bg-[#080A12] border border-slate-800 hover:border-slate-700 focus:border-[#7C3AED] rounded-xl px-4 py-3 text-xs text-white focus:outline-none transition"
                  >
                    <option value="Valorant">Valorant</option>
                    <option value="GTA V">GTA V</option>
                    <option value="Call of Duty">Call of Duty</option>
                    <option value="Minecraft">Minecraft</option>
                    <option value="Counter-Strike">Counter-Strike</option>
                    <option value="Fortnite">Fortnite</option>
                    <option value="PUBG Mobile">PUBG Mobile</option>
                    <option value="Other Game">Other / General</option>
                  </select>
                </div>

                {/* Avatar select presets */}
                <div className="space-y-2">
                  <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">
                    Avatar Design Presets (Click to select)
                  </label>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                    {AVATAR_PRESETS.map((preset) => (
                      <div
                        key={preset}
                        onClick={() => setEditAvatar(preset)}
                        className={`p-1 bg-slate-900 rounded-xl cursor-pointer hover:border-[#06B6D4] border-2 transition ${
                          editAvatar === preset ? "border-[#06B6D4]" : "border-transparent"
                        }`}
                      >
                        <img src={preset} alt="" className="w-12 h-12 mx-auto rounded-lg object-cover" />
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <span className="text-[10px] text-slate-400 block mb-1">Custom Avatar Image URL:</span>
                    <input
                      type="text"
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      className="w-full bg-[#080A12] border border-slate-800 hover:border-slate-700 focus:border-[#7C3AED] rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Cover Select presets */}
                <div className="space-y-2">
                  <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">
                    Cover Banner Design Presets
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {COVER_PRESETS.map((preset, index) => (
                      <div
                        key={index}
                        onClick={() => setEditCover(preset)}
                        className={`h-12 rounded-lg cursor-pointer overflow-hidden border-2 transition ${
                          editCover === preset ? "border-[#7C3AED]" : "border-transparent"
                        }`}
                      >
                        <img src={preset} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <span className="text-[10px] text-slate-400 block mb-1">Custom Cover Banner URL:</span>
                    <input
                      type="text"
                      value={editCover}
                      onChange={(e) => setEditCover(e.target.value)}
                      className="w-full bg-[#080A12] border border-slate-800 hover:border-slate-700 focus:border-[#7C3AED] rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] hover:from-[#6D28D9] text-white py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider"
                  >
                    {loading ? "SAVING CONFIGS..." : "SAVE GAMER PROFILE UPDATE"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==========================================
              SUBVIEW 10: ADMIN MODERATION SCREEN
              ========================================== */}
          {activeTab === "admin" && me.isAdmin && (
            <div className="space-y-6">
              
              <div className="border-b border-slate-800 pb-4 text-left">
                <h2 className="text-2xl font-black text-red-400 flex items-center gap-2">
                  <ShieldAlert className="w-6 h-6 text-red-500" /> Administrative Moderation Center
                </h2>
                <p className="text-xs text-slate-400">Moderator actions. Ban/delete toxic players, resolve reports, and regulate site forums.</p>
              </div>

              {/* Stat deck */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-[#151927] border border-slate-800 rounded-xl text-center">
                  <span className="text-slate-400 text-[9.5px] uppercase font-bold block">Total Registered Players</span>
                  <span className="text-xl font-black text-white block mt-1">{data.users?.length}</span>
                </div>
                <div className="p-4 bg-[#151927] border border-slate-800 rounded-xl text-center">
                  <span className="text-slate-400 text-[9.5px] uppercase font-bold block">Online Players</span>
                  <span className="text-xl font-black text-[#22C55E] block mt-1">
                    {data.users?.filter((u: any) => u.onlineStatus === 'online').length}
                  </span>
                </div>
                <div className="p-4 bg-[#151927] border border-slate-800 rounded-xl text-center">
                  <span className="text-slate-400 text-[9.5px] uppercase font-bold block">Communities</span>
                  <span className="text-xl font-black text-[#06B6D4] block mt-1">{data.communities?.length}</span>
                </div>
                <div className="p-4 bg-[#151927] border border-slate-800 rounded-xl text-center">
                  <span className="text-slate-400 text-[9.5px] uppercase font-bold block">Active Reports Filed</span>
                  <span className="text-xl font-black text-red-400 block mt-1">
                    {data.reports?.filter((r: any) => r.status === 'pending').length || 0}
                  </span>
                </div>
              </div>

              {/* Reports section */}
              <div className="bg-[#151927] border border-slate-800 p-5 rounded-2xl space-y-4">
                <span className="text-xs font-black uppercase text-red-400 block text-left">
                  PENDING TOXICITY REPORTS QUEUE
                </span>

                <div className="space-y-3">
                  {data.reports?.filter((r: any) => r.status === "pending").length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-6 text-center">Toxicity reports database is clear. No reported items.</p>
                  ) : (
                    data.reports
                      ?.filter((r: any) => r.status === "pending")
                      .map((rep: any) => {
                        const reporter = data.users.find((u: any) => u.id === rep.reporterId);
                        return (
                          <div key={rep.id} className="p-4 bg-[#080A12] border border-slate-800 rounded-xl text-left space-y-3">
                            <div className="flex justify-between items-center text-[10px] text-slate-400">
                              <span>Report ID #{rep.id} • Target: {rep.targetType.toUpperCase()} (ID: {rep.targetId})</span>
                              <span className="text-yellow-500 font-extrabold uppercase">Reason: {rep.reason}</span>
                            </div>

                            <p className="text-xs text-slate-200">
                              <span className="text-slate-500">Explanation details:</span> "{rep.description}"
                            </p>

                            <div className="flex items-center justify-between text-[11px]">
                              <span>Filed by: @{reporter?.username || "deleted_gamer"}</span>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleAdminResolveReport(rep.id)}
                                  className="px-2.5 py-1 bg-[#22C55E]/20 text-[#22C55E] text-[10px] font-black rounded hover:bg-[#22C55E]/40"
                                >
                                  Mark Resolved
                                </button>
                                {rep.targetType === "post" && (
                                  <button
                                    onClick={() => handleAdminDeletePost(rep.targetId)}
                                    className="px-2.5 py-1 bg-red-950/20 text-red-400 text-[10px] font-black rounded hover:bg-red-950/40"
                                  >
                                    Delete Toxic Post
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>

              {/* User management list */}
              <div className="bg-[#151927] border border-slate-800 p-5 rounded-2xl space-y-4">
                <span className="text-xs font-black uppercase text-slate-300 block text-left">
                  USER DIRECTORY MODERATION (BANS & ADMINISTRATIVE PROMOTIONS)
                </span>

                <div className="space-y-2">
                  {data.users?.map((usr: any) => (
                    <div key={usr.id} className="p-3 bg-[#080A12] border border-slate-800 rounded-xl flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-left">
                        <img src={usr.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <span className="text-xs text-white block font-bold">{usr.displayName} (@{usr.username})</span>
                          <span className="text-[10px] text-slate-400">Level {usr.gamingLevel} • Rank {usr.rank}</span>
                        </div>
                      </div>

                      <div className="flex space-x-1.5 shrink-0">
                        {!usr.isAdmin && (
                          <button
                            onClick={() => handleAdminBanDelete(usr.id, "make_admin")}
                            className="px-2.5 py-1 bg-[#06B6D4]/20 text-[#06B6D4] text-[10px] font-black rounded"
                          >
                            PROMOTE TO STAFF
                          </button>
                        )}
                        {usr.id !== me.id && (
                          <>
                            <button
                              onClick={() => handleAdminBanDelete(usr.id, "ban")}
                              className="px-2.5 py-1 bg-red-950/20 text-red-400 text-[10px] font-black rounded"
                            >
                              BAN & DELETE
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* ==========================================
          MODALS & FORM DIALOGUES
          ========================================== */}

      {/* 1. REPORT ITEM MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#151927] border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="font-extrabold text-sm text-yellow-500 uppercase tracking-widest flex items-center gap-1.5">
                <AlertTriangle className="w-4.5 h-4.5" /> Transmit Abuse Alert
              </span>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 font-bold block mb-1">Report Target Item Type</span>
                <span className="font-mono text-[#06B6D4] font-black block">{reportType.toUpperCase()} (ID: {reportTargetId})</span>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                  Report Violation Reason
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-[#080A12] border border-slate-800 hover:border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="Spam / Commercial advertising">Spam / Commercial advertising</option>
                  <option value="Toxicity / Harassment">Toxicity / Harassment</option>
                  <option value="Inappropriate / Sexual Content">Inappropriate / Sexual Content</option>
                  <option value="Cheating / Hacks distribution">Cheating / Hacks distribution</option>
                  <option value="Other Policy Violation">Other Policy Violation</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                  Explanation / Evidence details
                </label>
                <textarea
                  rows={3}
                  required
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder="Provide precise timestamp, match codes, or context to help administrators review..."
                  className="w-full bg-[#080A12] border border-slate-800 hover:border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-xl font-bold uppercase"
              >
                TRANSMIT SECURE ABUSE FLAG
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. CREATE GAMING GROUP MODAL */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#151927] border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="font-black text-sm text-white uppercase tracking-widest flex items-center gap-1.5">
                <Users className="w-4.5 h-4.5 text-[#06B6D4]" /> Establish Gaming Group
              </span>
              <button onClick={() => setShowCreateGroupModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGroupChat} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sentinels Scrim Group"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full bg-[#080A12] border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Coordination for 5v5 tournaments."
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  className="w-full bg-[#080A12] border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                  Invite Squad Members (Click to select)
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {data.users?.filter((u: any) => u.id !== me.id).map((usr: any) => {
                    const isSelected = groupSelectedMembers.includes(usr.id);
                    return (
                      <button
                        key={usr.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setGroupSelectedMembers(groupSelectedMembers.filter((id) => id !== usr.id));
                          } else {
                            setGroupSelectedMembers([...groupSelectedMembers, usr.id]);
                          }
                        }}
                        className={`w-full text-left p-2 rounded-lg border text-xs flex justify-between items-center transition ${
                          isSelected ? "bg-[#7C3AED]/20 border-[#7C3AED] text-white" : "bg-[#080A12] border-slate-850 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <span>{usr.displayName} (@{usr.username})</span>
                        {isSelected ? <span className="text-[#06B6D4] font-bold">INVITED</span> : <span className="text-slate-500">ADD</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] hover:from-[#6D28D9] text-white py-2.5 rounded-xl font-bold uppercase"
              >
                CREATE CHAT GROUP
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. CREATE COMMUNITY MODAL */}
      {showCreateCommunityModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#151927] border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="font-black text-sm text-white uppercase tracking-widest flex items-center gap-1.5">
                <Users className="w-4.5 h-4.5 text-[#06B6D4]" /> Host Gaming Community
              </span>
              <button onClick={() => setShowCreateCommunityModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCommunity} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                  Community Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Legends Scrims"
                  value={newCommName}
                  onChange={(e) => setNewCommName(e.target.value)}
                  className="w-full bg-[#080A12] border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                  Gaming Title Franchise
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Legends"
                  value={newCommGame}
                  onChange={(e) => setNewCommGame(e.target.value)}
                  className="w-full bg-[#080A12] border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe your community guild focus..."
                  value={newCommDesc}
                  onChange={(e) => setNewCommDesc(e.target.value)}
                  className="w-full bg-[#080A12] border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                  Banner Image URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://images.unsplash.com/... or blank for default"
                  value={newCommBanner}
                  onChange={(e) => setNewCommBanner(e.target.value)}
                  className="w-full bg-[#080A12] border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#06B6D4] hover:bg-[#0891B2] text-white py-2.5 rounded-xl font-bold uppercase"
              >
                ESTABLISH COMMUNITY (+100 XP Reward)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. CREATE TOURNAMENT MODAL */}
      {showCreateTournamentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#151927] border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="font-black text-sm text-white uppercase tracking-widest flex items-center gap-1.5">
                <Trophy className="w-4.5 h-4.5 text-yellow-500" /> Form Championship Arena
              </span>
              <button onClick={() => setShowCreateTournamentModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTournament} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Arena Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Call of Duty Warzone Cup"
                    value={newTourneyName}
                    onChange={(e) => setNewTourneyName(e.target.value)}
                    className="w-full bg-[#080A12] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Game Franchise
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Call of Duty"
                    value={newTourneyGame}
                    onChange={(e) => setNewTourneyGame(e.target.value)}
                    className="w-full bg-[#080A12] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                  Tournament Overview
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe your competitive bracket rules, timeline highlights, and target skill brackets..."
                  value={newTourneyDesc}
                  onChange={(e) => setNewTourneyDesc(e.target.value)}
                  className="w-full bg-[#080A12] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                  Rules and Screen-match Reporting
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Provide precise bracket regulations, match communication guidelines, and admin help references..."
                  value={newTourneyRules}
                  onChange={(e) => setNewTourneyRules(e.target.value)}
                  className="w-full bg-[#080A12] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Entry Level Requirement
                  </label>
                  <input
                    type="text"
                    value={newTourneyPrize}
                    onChange={(e) => setNewTourneyPrize(e.target.value)}
                    placeholder="e.g. $500 Reward & Badges"
                    className="w-full bg-[#080A12] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Max Player Teams Capacity
                  </label>
                  <input
                    type="number"
                    value={newTourneyMaxPlayers}
                    onChange={(e) => setNewTourneyMaxPlayers(Number(e.target.value))}
                    className="w-full bg-[#080A12] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newTourneyStartDate}
                    onChange={(e) => setNewTourneyStartDate(e.target.value)}
                    className="w-full bg-[#080A12] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newTourneyEndDate}
                    onChange={(e) => setNewTourneyEndDate(e.target.value)}
                    className="w-full bg-[#080A12] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                  Banner Cover Image URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/... (optional)"
                  value={newTourneyBanner}
                  onChange={(e) => setNewTourneyBanner(e.target.value)}
                  className="w-full bg-[#080A12] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 text-black py-2.5 rounded-xl font-black uppercase"
              >
                PUBLISH ARENA TOURNAMENT
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating custom Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#151927] border-l-4 border-[#7C3AED] px-5 py-4 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-slate-800 animate-bounce">
          <div className="w-2.5 h-2.5 rounded-full bg-[#06B6D4] animate-ping" />
          <span className="text-sm font-bold text-white">{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
