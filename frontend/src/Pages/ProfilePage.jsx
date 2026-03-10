import { useEffect, useState } from "react";
import {
  acceptFriendRequest, getUserProfile, rejectFriendRequest,
  friendRequest, friendRequestCheck,
} from "../api/axiosClient";
import { useParams } from "react-router-dom";

const TABS = ["overview", "solved", "friends"];

const ProfilePage = () => {
  const { username } = useParams();
  const [userProfile, setUserProfile]       = useState(null);
  const [loading, setLoading]               = useState(true);
  const [activeTab, setActiveTab]           = useState("overview");
  const [requestStatus, setRequestStatus]   = useState(null);
  const [requestLoading, setRequestLoading] = useState(false);

  const loggedUser   = localStorage.getItem("username");
  const isOwnProfile = loggedUser === username;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!username) return;
        const profile = await getUserProfile(username);
        setUserProfile(profile);
        if (!isOwnProfile) {
          const status = await friendRequestCheck(loggedUser, username);
          setRequestStatus(status);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, [username]);

  const handleAddFriend = async () => {
    try {
      setRequestLoading(true);
      await friendRequest(loggedUser, username);
      setRequestStatus("PENDING");
      alert("Friend request sent 🚀");
    } catch { alert("Could not send request"); }
    finally { setRequestLoading(false); }
  };

  const handleAccept = async (id) => {
    try { setRequestLoading(true); await acceptFriendRequest(id); }
    catch (e) { return e; }
    finally { setRequestLoading(false); }
  };

  const handleReject = async (id) => {
    try { setRequestLoading(true); await rejectFriendRequest(id); }
    catch (e) { return e; }
    finally { setRequestLoading(false); }
  };

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0d13] py-8 px-6">
        <div className="max-w-[1100px] mx-auto grid grid-cols-12 gap-5 animate-pulse">
          <div className="col-span-12 md:col-span-4 bg-[#11131a] border border-white/[0.06] rounded-2xl h-80" />
          <div className="col-span-12 md:col-span-8 bg-[#11131a] border border-white/[0.06] rounded-2xl h-80" />
        </div>
      </div>
    );
  }

  const initial = username?.[0]?.toUpperCase();

  /* ── Friend action button ── */
  const FriendButton = () => {
    if (isOwnProfile) return (
      <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-black bg-gradient-to-r from-[#00d084] to-[#00b874] hover:-translate-y-px transition-all shadow-[0_4px_16px_rgba(0,208,132,0.2)]">
        ✏️ Edit Profile
      </button>
    );

    if (requestStatus === "ACCEPTED") return (
      <div className="flex gap-2 w-full">
        <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#00d084]/10 text-[#00d084] border border-[#00d084]/20">✓ Friends</button>
        <button className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[#161820] border border-white/[0.08] text-[#8890a8] hover:text-[#f0f2f8] transition-all">Message</button>
      </div>
    );

    if (requestStatus === "PENDING") return (
      <button disabled className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[#ffc01e]/10 text-[#ffc01e] border border-[#ffc01e]/20 cursor-not-allowed">⏳ Requested</button>
    );

    if (requestStatus === "REJECTED") return (
      <button disabled className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[#ef4743]/10 text-[#ef4743] border border-[#ef4743]/20 cursor-not-allowed">✗ Request Rejected</button>
    );

    if (requestStatus === "REQUESTED") return (
      <div className="flex gap-2 w-full">
        <button onClick={() => handleAccept(userProfile.id)} disabled={requestLoading}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-black bg-gradient-to-r from-[#00d084] to-[#00b874] hover:-translate-y-px transition-all disabled:opacity-60">
          {requestLoading ? "…" : "✓ Accept"}
        </button>
        <button onClick={() => handleReject(userProfile.id)} disabled={requestLoading}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[#ef4743]/10 text-[#ef4743] border border-[#ef4743]/20 hover:bg-[#ef4743]/20 transition-all disabled:opacity-60">
          {requestLoading ? "…" : "✗ Reject"}
        </button>
      </div>
    );

    return (
      <button onClick={handleAddFriend} disabled={requestLoading}
        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-black bg-gradient-to-r from-[#00d084] to-[#00b874] hover:-translate-y-px transition-all shadow-[0_4px_16px_rgba(0,208,132,0.2)] disabled:opacity-60">
        {requestLoading ? "Sending…" : "+ Add Friend"}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#0b0d13] text-[#f0f2f8] py-8 px-6">
      <div className="max-w-[1100px] mx-auto">

        {/* Page label */}
        <div className="mb-6">
          <p className="text-[11px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-1">PROFILE</p>
          <h1 className="text-2xl font-semibold tracking-tight">@{username}</h1>
        </div>

        <div className="grid grid-cols-12 gap-5">

          {/* ══ LEFT card ══ */}
          <div className="col-span-12 md:col-span-4 space-y-4">
            <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
              <div className="h-1 bg-gradient-to-r from-[#3b82f6] via-[#a855f7] to-[#06b6d4]" />
              <div className="p-5">
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative flex-shrink-0">
                    {userProfile?.avatar ? (
                      <img src={userProfile.avatar} alt="avatar" className="w-16 h-16 rounded-2xl border border-white/[0.1] object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#3b82f6] flex items-center justify-center text-2xl font-bold text-white">
                        {initial}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00d084] rounded-full border-2 border-[#11131a]" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold truncate">{userProfile?.realName || "User"}</h2>
                    <p className="text-sm text-[#50566a] font-mono truncate">@{username}</p>
                  </div>
                </div>

                {/* Friend button */}
                <div className="flex gap-2 mb-5"><FriendButton /></div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {[
                    { label: "Solved",  value: "519",  color: "text-[#00d084]" },
                    { label: "Friends", value: "12",   color: "text-[#3b82f6]" },
                    { label: "Streak",  value: "🔥 7", color: "text-[#ffc01e]" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-[#161820] rounded-xl p-3 text-center border border-white/[0.05]">
                      <div className={`text-lg font-bold font-mono ${color}`}>{value}</div>
                      <div className="text-[10px] text-[#50566a] mt-0.5 uppercase tracking-wider">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Bio */}
                <p className="text-sm text-[#8890a8] leading-relaxed">
                  Passionate problem solver · Java · Spring Boot · DSA.{" "}
                  Building <span className="text-[#00d084]">AFriendlyCoding</span>
                </p>
              </div>
            </div>
          </div>

          {/* ══ RIGHT content ══ */}
          <div className="col-span-12 md:col-span-8 space-y-5">

            {/* Tab bar */}
            <div className="flex gap-1.5 bg-[#11131a] border border-white/[0.08] rounded-xl p-1.5">
              {TABS.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab
                      ? "bg-[#161820] text-[#f0f2f8] border border-white/[0.1] shadow-sm"
                      : "text-[#50566a] hover:text-[#8890a8]"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
                  <p className="text-[10px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-4">PROBLEM_BREAKDOWN</p>
                  {[
                    { label: "Easy",   value: "180", color: "text-[#00d084]", pct: "21%" },
                    { label: "Medium", value: "280", color: "text-[#ffc01e]", pct: "16%" },
                    { label: "Hard",   value: "59",  color: "text-[#ef4743]", pct: "8%"  },
                  ].map(({ label, value, color, pct }) => (
                    <div key={label} className="py-2.5 border-b border-white/[0.04] last:border-0">
                      <div className="flex justify-between mb-1.5">
                        <span className={`text-xs font-mono font-semibold ${color}`}>{label}</span>
                        <span className="text-xs font-mono text-[#50566a]">{value}</span>
                      </div>
                      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full`} style={{ width: pct, background: color.replace("text-[","").replace("]","") }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
                  <p className="text-[10px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-4">RECENT_ACTIVITY</p>
                  {[
                    { icon: "✓",  text: "Solved \"Median of Two Sorted Arrays\"", color: "text-[#00d084]" },
                    { icon: "✓",  text: "Solved \"Container With Most Water\"",   color: "text-[#00d084]" },
                    { icon: "🔥", text: "7-day solving streak",                   color: "text-[#ffc01e]" },
                  ].map(({ icon, text, color }, i) => (
                    <div key={i} className="flex items-start gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
                      <span className={`text-sm flex-shrink-0 ${color}`}>{icon}</span>
                      <span className="text-sm text-[#8890a8]">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SOLVED */}
            {activeTab === "solved" && (
              <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
                <p className="text-[10px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-4">SOLVED_PROBLEMS</p>
                <p className="text-sm text-[#50566a] font-mono">Solved table renders here.</p>
              </div>
            )}

            {/* FRIENDS */}
            {activeTab === "friends" && (
              <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
                <p className="text-[10px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-4">FRIENDS</p>
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="text-3xl">👥</div>
                  <p className="text-sm text-[#50566a]">Friends list UI goes here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
