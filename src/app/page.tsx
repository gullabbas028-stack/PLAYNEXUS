import { getPlayNexusData } from "./actions";
import PlayNexusClient from "./PlayNexusClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let data;
  try {
    data = await getPlayNexusData();
  } catch (err: any) {
    console.error("HomePage data fetch error:", err);
    data = {
      dbConnected: false,
      dbError: err?.message,
      me: null,
      users: [],
      communities: [],
      communityMembers: [],
      posts: [],
      comments: [],
      likes: [],
      tournaments: [],
      tournamentParticipants: [],
      achievements: [],
      friendRequests: [],
      friendships: [],
      notifications: [],
      conversations: [],
      earnedAchievements: [],
      reports: [],
    };
  }

  return (
    <main className="min-h-screen bg-[#080A12] text-[#F8FAFC]">
      <PlayNexusClient initialData={data} />
    </main>
  );
}
