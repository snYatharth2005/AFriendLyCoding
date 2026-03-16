import { useEffect, useState } from "react";
import { getAcceptedFriends, getFriendUser } from "../api/axiosClient";
import FriendCard from "./FriendCard";

const SkeletonCard = () => (
  <div className="flex items-center gap-3 px-3 py-2.5 animate-pulse">
    <div className="w-9 h-9 rounded-xl bg-white/[0.07] flex-shrink-0" />
    <div className="flex-1 space-y-1.5">
      <div className="h-3 bg-white/[0.07] rounded w-3/4" />
      <div className="h-2.5 bg-white/[0.04] rounded w-1/2" />
    </div>
  </div>
);

const FriendList = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadFriends(); }, []);

  const loadFriends = async () => {
    const logged = localStorage.getItem("username");
    try {
      const raw = (await getAcceptedFriends()) || [];
      const built = await Promise.all(
        raw.map(async (f) => {
          const friendUsername = logged === f.sender ? f.receiver : f.sender;
          try {
            const u = await getFriendUser(friendUsername);
            console.log('[FriendList] UserDto for', friendUsername, u);
            return {
              name:             u?.username          ?? friendUsername,
              avatar:           u?.avatar            ?? null,
              leetcodeUsername: u?.leetCodeUsername  ?? null,
              streak:           u?.streak            ?? null,
              thisWeek:         u?.solvedInAWeek     ?? null,
              solved:           u?.totalProblems     ?? 0,
            };
          } catch {
            return { name: friendUsername, avatar: null, leetcodeUsername: null };
          }
        })
      );
      setFriends(built);
    } catch {
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="space-y-1">{[1,2,3,4].map(i => <SkeletonCard key={i} />)}</div>;

  if (friends.length === 0) {
    return (
      <div className="py-8 flex flex-col items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-xl">👥</div>
        <p className="text-xs text-[#50566a] text-center leading-relaxed">
          No friends yet.<br />
          <span className="text-[#3b82f6]">Add some to compare progress!</span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {/* friends is already built — pass directly to FriendCard */}
      {friends.slice(0, 6).map((user, i) => (
        <FriendCard key={i} user={user} />
      ))}

      {friends.length > 6 && (
        <div className="pt-2 mt-1 border-t border-white/[0.05] text-center">
          <span className="text-xs text-[#50566a] font-mono">+{friends.length - 6} more friends</span>
        </div>
      )}
    </div>
  );
};

export default FriendList;