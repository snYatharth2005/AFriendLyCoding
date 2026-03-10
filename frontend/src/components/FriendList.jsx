import { useEffect, useState } from "react";
import { getAcceptedFriends } from "../api/axiosClient";
import FriendCard from "./FriendCard";

/* ── Skeleton card ── */
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

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      const data = await getAcceptedFriends();
      setFriends(data || []);
    } catch {
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="space-y-1">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  /* ── Empty ── */
  if (friends.length === 0) {
    return (
      <div className="py-8 flex flex-col items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-xl">
          👥
        </div>
        <p className="text-xs text-[#50566a] text-center leading-relaxed">
          No friends yet.<br />
          <span className="text-[#3b82f6]">Add some to compare progress!</span>
        </p>
      </div>
    );
  }

  const logged = localStorage.getItem("username");

  return (
    <div className="space-y-0.5">
      {friends.slice(0, 6).map((f) => {
        const user =
          logged === f.sender
            ? {
                name:                f.receiver,
                avatar:              f.receiverAvatar,
                leetcodeUsername:    f.receiverLeetCodeUsername,
              }
            : {
                name:                f.sender,
                avatar:              f.senderAvatar,
                leetcodeUsername:    f.senderLeetCodeUsername,
              };

        return <FriendCard key={f.id} user={user} />;
      })}

      {friends.length > 6 && (
        <div className="pt-2 mt-1 border-t border-white/[0.05] text-center">
          <span className="text-xs text-[#50566a] font-mono">
            +{friends.length - 6} more friends
          </span>
        </div>
      )}
    </div>
  );
};

export default FriendList;
