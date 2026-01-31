import { useEffect, useState } from "react";
import { acceptFriendRequest, getUserProfile, rejectFriendRequest } from "../api/axiosClient";
import { useParams } from "react-router-dom";
import { friendRequest, friendRequestCheck } from "../api/axiosClient";

const TABS = ["overview", "solved", "friends"];

const ProfilePage = () => {
  const { username } = useParams();

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  //for the friend Requests
  const [requestStatus, setRequestStatus] = useState(null);
  const [requestLoading, setRequestLoading] = useState(false);

  const loggedUser = localStorage.getItem("username");
  const isOwnProfile = loggedUser === username;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!username) return;

        const profile = await getUserProfile(username);
        setUserProfile(profile);

        if (!isOwnProfile) {
          const status = await friendRequestCheck(loggedUser, username);
          console.log(status);
          setRequestStatus(status);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const handleAddFriend = async () => {
    try {
      setRequestLoading(true);

      await friendRequest(loggedUser, username);

      setRequestStatus("PENDING");

      alert("Friend request sent 🚀");
    } catch (e) {
      alert("Could not send request");
    } finally {
      setRequestLoading(false);
    }
  };

  const handleAccept = async (senderId) => {
    try {
      setRequestLoading(true);
      await acceptFriendRequest(senderId);
    } catch (e) {
      return `there was error while Accepting request ${e}`;
    }finally {
      setRequestLoading(false);
    }
    };
  
    const handleReject = async (senderId) => {
      try {
      setRequestLoading(true);
        await rejectFriendRequest(senderId);
      } catch (e) {
      return `there was error while Accepting request ${e}`;
    }finally {
      setRequestLoading(false);
    }
    };

  /* ================= SKELETON ================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0d12] px-8 pt-28 text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8 animate-pulse">
          <div className="col-span-12 md:col-span-4 bg-[#11131a] h-80 rounded-xl" />
          <div className="col-span-12 md:col-span-8 bg-[#11131a] h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  /* ================= MAIN ================= */

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white px-8 pt-28">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
        {/* ================================================= */}
        {/* LEFT CARD */}
        {/* ================================================= */}

        <div className="col-span-12 md:col-span-4">
          <div className="bg-[#11131a] border border-white/10 rounded-2xl p-6 shadow-md">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              {userProfile?.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt="avatar"
                  className="w-16 h-16 rounded-full border border-white/10"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 text-xl font-semibold">
                  {username[0].toUpperCase()}
                </div>
              )}

              <div>
                <h2 className="text-lg font-semibold">
                  {userProfile?.realName || "User"}
                </h2>
                <p className="text-sm text-white/40">
                  @{username || "username"}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              {isOwnProfile ? (
                <button className="flex-1 bg-blue-600 hover:bg-blue-500 transition rounded-md py-2 text-sm font-medium">
                  Edit Profile
                </button>
              ) : (
                <>
                  {requestStatus === "ACCEPTED" && (
                    <>
                      <button className="flex-1 bg-green-600/80 rounded-md py-2 text-sm">
                        Friends ✓
                      </button>
                      <button className="flex-1 bg-white/5 hover:bg-white/10 transition rounded-md py-2 text-sm">
                        Message
                      </button>
                    </>
                  )}

                  {requestStatus === "PENDING" && (
                    <button
                      disabled
                      className="flex-1 bg-yellow-500/20 text-yellow-400 rounded-md py-2 text-sm cursor-not-allowed"
                    >
                      Requested
                    </button>
                  )}

                  {requestStatus === "REJECTED" && (
                    <button
                      disabled
                      className="flex-1 bg-red-500/20 text-red-400 rounded-md py-2 text-sm cursor-not-allowed"
                    >
                      Request Rejected
                    </button>
                  )}

                  {requestStatus === "REQUESTED" && (
                    <>
                      <button
                        onClick={() => handleAccept(userProfile.id)}
                        disabled={requestLoading}
                        className="flex-1 bg-green-600 text-white rounded-md py-2 text-sm cursor-pointer"
                      >
                        {requestLoading ? "Accepting..." : "Accept"}
                      </button>
                      <button
                        onClick={() =>handleReject(userProfile.id)}
                        disabled={requestLoading}
                        className="flex-1 bg-red-700 text-red-300 rounded-md py-2 text-sm cursor-pointer"
                      >
                        {requestLoading ? "Rejecting..." : "Reject"}
                      </button>
                    </>
                  )}

                  {requestStatus === null && (
                    <button
                      onClick={handleAddFriend}
                      disabled={requestLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 transition rounded-md py-2 text-sm font-medium"
                    >
                      {requestLoading ? "Sending..." : "Add Friend"}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 text-center">
              <Stat label="Solved" value="519" />
              <Stat label="Friends" value="12" />
              <Stat label="Streak" value="🔥 7" />
            </div>

            {/* Bio */}
            <div className="mt-6 text-sm text-white/60 leading-relaxed">
              Passionate problem solver • Java • Spring Boot • DSA • AI & DS
              Building <span className="text-blue-400">AFriendlyCoding</span>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* RIGHT CONTENT */}
        {/* ================================================= */}

        <div className="col-span-12 md:col-span-8">
          {/* Tabs */}
          <div className="flex gap-3 mb-6">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm border border-white/10 transition
                  ${
                    activeTab === tab
                      ? "bg-blue-600 text-white"
                      : "bg-[#11131a] text-white/60 hover:bg-white/5"
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* ================= TAB CONTENT ================= */}

          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Problem Breakdown">
                <Row label="Easy" value="180" color="text-green-400" />
                <Row label="Medium" value="280" color="text-yellow-400" />
                <Row label="Hard" value="59" color="text-red-400" />
              </Card>

              <Card title="Recent Activity">
                <ul className="space-y-3 text-sm text-white/60">
                  <li>✔ Solved “Median of Two Sorted Arrays”</li>
                  <li>✔ Solved “Container With Most Water”</li>
                  <li>🔥 7-day solving streak</li>
                </ul>
              </Card>
            </div>
          )}

          {activeTab === "solved" && (
            <Card title="Solved Problems">
              <p className="text-sm text-white/40">
                Reuse solved table from Home page here.
              </p>
            </Card>
          )}

          {activeTab === "friends" && (
            <Card title="Friends">
              <p className="text-sm text-white/40">
                Friends list UI goes here.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

/* ================= SMALL COMPONENTS ================= */

const Stat = ({ label, value }) => (
  <div>
    <p className="text-lg font-semibold">{value}</p>
    <p className="text-xs text-white/40">{label}</p>
  </div>
);

const Card = ({ title, children }) => (
  <div className="bg-[#11131a] border border-white/10 rounded-xl p-5">
    <h3 className="text-sm font-semibold mb-4">{title}</h3>
    {children}
  </div>
);

const Row = ({ label, value, color }) => (
  <div className="flex justify-between text-sm">
    <span className={color}>{label}</span>
    <span>{value}</span>
  </div>
);

export default ProfilePage;
