import { useEffect, useState } from "react";
import {
  getIncomingFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getAcceptedFriends,
  removeFriend,
} from "../api/axiosClient";

const TABS = ["friends", "requests"];

const FriendsPage = () => {
  const [activeTab, setActiveTab] = useState("friends");

  const [pageLoading, setPageLoading] = useState(true);

  const [incoming, setIncoming] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    const init = async () => {
      await Promise.all([loadIncoming(), loadFriends()]);
      setPageLoading(false);
    };
    init();
  }, []);

  const loadIncoming = async () => {
    try {
      const data = await getIncomingFriendRequests();
      setIncoming(data || []);
    } catch {
      setIncoming([]);
    }
  };

  const loadFriends = async () => {
    try {
      const data = await getAcceptedFriends();
      setFriends(data || []);
    } catch {
      setFriends([]);
    }
  };

  const SkeletonCard = () => (
    <div
      className="
    flex items-center justify-between
    bg-[#11131a]
    border border-white/10
    rounded-xl p-4
    animate-pulse
  "
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-white/10" />
        <div>
          <div className="w-32 h-4 bg-white/10 rounded mb-2" />
          <div className="w-24 h-3 bg-white/5 rounded" />
        </div>
      </div>

      <div className="w-20 h-8 bg-white/10 rounded" />
    </div>
  );

  const handleAccept = async (senderId) => {
    setLoadingId(senderId);
    await acceptFriendRequest(senderId);
    setIncoming((prev) => prev.filter((r) => r.senderId !== senderId));
    loadFriends();
    setLoadingId(null);
  };

  const handleReject = async (senderId) => {
    setLoadingId(senderId);
    await rejectFriendRequest(senderId);
    setIncoming((prev) => prev.filter((r) => r.senderId !== senderId));
    setLoadingId(null);
  };

  const handleRemove = async (friendId) => {
    setLoadingId(friendId);
    await removeFriend(friendId);
    setFriends((prev) => prev.filter((f) => f.id !== friendId));
    setLoadingId(null);
  };

  /* ================================================= */

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white px-8 pt-28">
      <div className="max-w-4xl mx-auto">
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold">Friends</h2>
        </div>

        {/* ================= TABS ================= */}
        <div className="flex gap-3 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-2 rounded-md text-sm border border-white/10 transition
                ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "bg-[#11131a] text-white/60 hover:bg-white/5"
                }
              `}
            >
              {tab === "requests" ? "Requests" : "Friends"}
            </button>
          ))}
        </div>

        {/* ================= REQUESTS TAB ================= */}
        {activeTab === "requests" && (
          <>
            {pageLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : incoming.length === 0 ? (
              <EmptyState text="No pending friend requests" />
            ) : (
              <div className="space-y-4">
                {incoming.map((req) => (
                  <UserCard key={req.id}>
                    <UserInfo
                      avatar={req.senderAvatar}
                      username={req.senderUsername}
                      name={req.sender}
                    />

                    <div className="flex gap-3">
                      <ActionBtn
                        loading={loadingId === req.senderId}
                        text="Accept"
                        color="green"
                        onClick={() => handleAccept(req.senderId)}
                      />
                      <ActionBtn
                        loading={loadingId === req.senderId}
                        text="Reject"
                        color="red"
                        onClick={() => handleReject(req.senderId)}
                      />
                    </div>
                  </UserCard>
                ))}
              </div>
            )}
          </>
        )}

        {/* ================= FRIENDS TAB ================= */}
        {activeTab === "friends" && (
          <>
            {pageLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : friends.length === 0 ? (
              <EmptyState text="You have no friends yet 🥹" />
            ) : (
              <div className="space-y-4">
                {friends.map((f) => (
                  <UserCard key={f.id}>
                    {f.sender !== localStorage.getItem("username") ? (
                      <UserInfo
                        avatar={f.senderAvatar}
                        username={f.SenderLeetCodeUsername}
                        name={f.sender}
                      />
                    ) : (
                      <UserInfo
                        avatar={f.receiverAvatar}
                        username={f.receiverLeetCodeUsername}
                        name={f.receiver}
                      />
                    )}

                    <ActionBtn
                      loading={loadingId === f.id}
                      text="Remove"
                      color="red"
                      onClick={() => handleRemove(f.id)}
                    />
                  </UserCard>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

/* ================================================= */
/* ================= SMALL COMPONENTS ============== */
/* ================================================= */

const UserCard = ({ children }) => (
  <div
    className="
    flex items-center justify-between
    bg-[#11131a]
    border border-white/10
    rounded-xl p-4
    hover:border-blue-500/40
    transition
  "
  >
    {children}
  </div>
);

const UserInfo = ({ avatar, username, name }) => (
  <div className="flex items-center gap-4">
    {avatar ? (
      <img
        src={avatar}
        alt="avatar"
        className="w-12 h-12 rounded-full border border-white/10"
      />
    ) : (
      <div
        className="
        w-12 h-12 rounded-full
        bg-blue-600/20
        flex items-center justify-center
        text-blue-400 font-semibold
      "
      >
        {name[0].toUpperCase()}
      </div>
    )}

    <div>
      <p className="font-medium">{name || "User"}</p>
      <p className="text-sm text-white/40">@{username || "LeetCodeUsername"}</p>
    </div>
  </div>
);

const ActionBtn = ({ text, color, loading, onClick }) => {
  const base = "px-4 py-1.5 rounded-md text-sm transition disabled:opacity-50";

  const styles =
    color === "green"
      ? "bg-green-600 hover:bg-green-500"
      : "bg-red-500/20 text-red-400 hover:bg-red-500/30";

  return (
    <button
      disabled={loading}
      onClick={onClick}
      className={`${base} ${styles}`}
    >
      {loading ? "..." : text}
    </button>
  );
};

const EmptyState = ({ text }) => (
  <div
    className="
    bg-[#11131a]
    border border-white/10
    rounded-xl
    p-12
    text-center
    text-white/40
  "
  >
    {text}
  </div>
);

export default FriendsPage;
