import { useState, useEffect } from "react";
import { getSolvedQuestion, getUserProfile } from "../api/axiosClient";
import ProblemSet from "../components/home/ProblemSet";
import ProblemRow from "../components/home/ProblemRow";

const MyProfile = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const username = localStorage.getItem("username");
        if (!username) {
          setLoading(false);
          return;
        }

        const profile = await getUserProfile(username);
        setUserProfile(profile);
      } catch (e) {
        console.error("Error fetching user profile:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const [solvedProblems, setSolvedProblems] = useState([]);

  useEffect(() => {
    setLoading(true);
    getSolvedQuestion()
      .then((data) => setSolvedProblems(data || []))
      .catch((err) => console.error("Error fetching solved problems:", err))
      .finally(() => setLoading(false));
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0d12] flex items-center justify-center text-white/40">
        Loading profile...
      </div>
    );
  }

  /* ================= NO PROFILE ================= */
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-[#0b0d12] flex items-center justify-center text-white/40">
        Profile not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white px-8 pt-28">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
        {/* ================= LEFT SIDEBAR ================= */}
        <div className="col-span-12 md:col-span-4">
          <div className="bg-[#11131a] border border-white/10 rounded-xl p-6 shadow-md">
            {/* Avatar + Name */}
            <div className="flex items-center gap-4">
              {userProfile?.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt="avatar"
                  className="w-16 h-16 rounded-full border border-white/10"
                />
              ) : (
                <span className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-mono overflow-hidden">
                  U
                </span>
              )}
              <div>
                <h2 className="text-lg font-semibold">
                  {userProfile?.realName || "User"}
                </h2>
                <p className="text-sm text-white/40">
                  @{localStorage.getItem("username") || "username"}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button className="flex-1 bg-blue-600 hover:bg-blue-500 transition rounded-md py-2 text-sm font-medium">
                Edit Profile
              </button>
              <button className="flex-1 bg-white/5 hover:bg-white/10 transition rounded-md py-2 text-sm">
                Settings
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 text-center">
              <div>
                <p className="text-lg font-semibold">519</p>
                <p className="text-xs text-white/40">Solved</p>
              </div>
              <div>
                <p className="text-lg font-semibold">🔥 7</p>
                <p className="text-xs text-white/40">Streak</p>
              </div>
              <div>
                <p className="text-lg font-semibold">12</p>
                <p className="text-xs text-white/40">Friends</p>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6 text-sm text-white/60">
              Full-stack dev • Java • Spring Boot • DSA Building AFriendlyCoding
              🚀
            </div>
          </div>
        </div>

        {/* ================= RIGHT CONTENT ================= */}
        <div className="col-span-12 md:col-span-8">
          {/* Tabs */}
          <div className="flex gap-3 mb-6">
            {["overview", "solved", "friends"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md border border-white/10 text-sm transition
                  ${
                    activeTab === tab
                      ? "bg-blue-600 text-white"
                      : "bg-[#11131a] hover:bg-white/5 text-white/60"
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* ================= TAB CONTENT ================= */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Difficulty Breakdown */}
              <div className="bg-[#11131a] border border-white/10 rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-4">
                  Problem Breakdown
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-400">Easy</span>
                    <span>180</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-400">Medium</span>
                    <span>280</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-400">Hard</span>
                    <span>59</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-[#11131a] border border-white/10 rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
                <ul className="space-y-3 text-sm text-white/60">
                  <li>✔ Solved “Median of Two Sorted Arrays”</li>
                  <li>✔ Solved “Container With Most Water”</li>
                  <li>🔥 7-day solving streak</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "solved" && (
            <div className="bg-[#11131a] border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4">Solved Problems</h3>

              <div className="h-120 overflow-y-auto no-scrollbar">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                ) : solvedProblems.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-white/40 font-mono">
                    No matching problems found.
                  </div>
                ) : (
                  solvedProblems.map((q) => (
                    <ProblemRow key={q.slug} question={q} />
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "friends" && (
            <div className="bg-[#11131a] border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4">Your Friends</h3>
              <p className="text-sm text-white/40">List of friends goes here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
