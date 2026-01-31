import { useEffect, useState } from "react";
import { getAcceptedFriends } from "../api/axiosClient";
import FriendCard from "./FriendCard";

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

  if (loading) {
    return (
      <div className="space-y-2">
        {[1,2,3,4].map(i => (
          <div
            key={i}
            className="h-12 rounded-lg bg-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-white/40">
          No friends yet
        </p>
      </div>
    );
  }

  const logged = localStorage.getItem("username");

  return (
    <div className="space-y-2">
      {friends.slice(0, 6).map((f) => {

        const user =
          logged === f.sender
            ? {
                name: f.receiver,
                avatar: f.receiverAvatar,
                leetcodeUsername: f.receiverLeetCodeUsername
              }
            : {
                name: f.sender,
                avatar: f.senderAvatar,
                leetcodeUsername: f.senderLeetCodeUsername
              };

        return <FriendCard key={f.id} user={user} />;
      })}
    </div>
  );
};

export default FriendList;
