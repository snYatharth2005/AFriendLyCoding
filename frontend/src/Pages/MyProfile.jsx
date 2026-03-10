import { useState, useEffect } from "react";
import { getSolvedQuestion, getUserProfile } from "../api/axiosClient";
import ProblemRow from "../components/home/ProblemRow";

const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-5 py-3.5 border-b border-white/[0.04] animate-pulse">
    <div className="w-8 h-3 bg-white/[0.07] rounded flex-shrink-0" />
    <div className="flex-1 h-3 bg-white/[0.07] rounded" />
    <div className="w-16 h-5 bg-white/[0.05] rounded-md flex-shrink-0" />
    <div className="w-20 h-3 bg-white/[0.05] rounded flex-shrink-0" />
  </div>
);

const TABS = ["overview", "solved", "friends"];

const MyProfile = () => {
  const [activeTab, setActiveTab]       = useState("overview");
  const [userProfile, setUserProfile]   = useState(null);
  const [loading, setLoading]           = useState(true);
  const [solvedProblems, setSolvedProblems] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const username = localStorage.getItem("username");
        if (!username) return;
        const profile = await getUserProfile(username);
        setUserProfile(profile);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    setLoading(true);
    getSolvedQuestion()
      .then((data) => setSolvedProblems(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const username = localStorage.getItem("username") || "user";
  const initial  = username[0]?.toUpperCase();
  const easy     = solvedProblems.filter(p => p.difficulty?.toLowerCase() === "easy").length;
  const medium   = solvedProblems.filter(p => p.difficulty?.toLowerCase() === "medium").length;
  const hard     = solvedProblems.filter(p => p.difficulty?.toLowerCase() === "hard").length;

  if (loading && !userProfile) {
    return (
      <div className="min-h-screen bg-[#0b0d13] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#00d084] border-t-transparent animate-spin" />
          <span className="text-[#50566a] text-sm font-mono">Loading profile…</span>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-[#0b0d13] flex items-center justify-center">
        <div className="text-center"><div className="text-4xl mb-4">🔍</div>
          <p className="text-[#8890a8] text-sm">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0d13] text-[#f0f2f8] py-8 px-6">
      <div className="max-w-[1100px] mx-auto">

        {/* ── Page label ── */}
        <div className="mb-6">
          <p className="text-[11px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-1">MY PROFILE</p>
          <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        </div>

        <div className="grid grid-cols-12 gap-5">

          {/* ══ LEFT — profile card ══ */}
          <div className="col-span-12 md:col-span-4 space-y-4">

            {/* Profile card */}
            <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
              {/* gradient bar */}
              <div className="h-1 bg-gradient-to-r from-[#00d084] via-[#06b6d4] to-[#3b82f6]" />
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

                {/* Actions */}
                <div className="flex gap-2 mb-5">
                  <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-black bg-gradient-to-r from-[#00d084] to-[#00b874] hover:-translate-y-px transition-all shadow-[0_4px_16px_rgba(0,208,132,0.2)]">
                    ✏️ Edit Profile
                  </button>
                  <button className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[#161820] border border-white/[0.08] text-[#8890a8] hover:text-[#f0f2f8] hover:border-white/[0.14] transition-all">
                    ⚙️ Settings
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {[
                    { label: "Solved",  value: solvedProblems.length, color: "text-[#00d084]" },
                    { label: "Streak",  value: "🔥 7",               color: "text-[#ffc01e]" },
                    { label: "Friends", value: "12",                  color: "text-[#3b82f6]" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-[#161820] rounded-xl p-3 text-center border border-white/[0.05]">
                      <div className={`text-lg font-bold font-mono ${color}`}>{value}</div>
                      <div className="text-[10px] text-[#50566a] mt-0.5 uppercase tracking-wider">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Bio */}
                <p className="text-sm text-[#8890a8] leading-relaxed">
                  Full-stack dev · Java · Spring Boot · DSA. Building{" "}
                  <span className="text-[#00d084]">AFriendlyCoding</span> 🚀
                </p>
              </div>
            </div>

            {/* Difficulty split */}
            <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
              <p className="text-[10px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-4">DIFFICULTY_SPLIT</p>
              {[
                { label: "Easy",   count: easy,   total: 839,  color: "#00d084" },
                { label: "Medium", count: medium, total: 1759, color: "#ffc01e" },
                { label: "Hard",   count: hard,   total: 758,  color: "#ef4743" },
              ].map(({ label, count, total, color }) => (
                <div key={label} className="mb-4 last:mb-0">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-mono font-semibold" style={{ color }}>{label}</span>
                    <span className="text-xs font-mono text-[#50566a]">{count}/{total}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min((count/total)*100,100)}%`, background: color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ══ RIGHT — tabs ══ */}
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
                    { label: "Easy",   value: easy,   color: "text-[#00d084]" },
                    { label: "Medium", value: medium, color: "text-[#ffc01e]" },
                    { label: "Hard",   value: hard,   color: "text-[#ef4743]" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
                      <span className={`text-sm font-mono font-semibold ${color}`}>{label}</span>
                      <span className="text-sm font-mono text-[#f0f2f8]">{value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-3 mt-1">
                    <span className="text-sm font-mono text-[#8890a8]">Total</span>
                    <span className="text-sm font-bold font-mono text-[#00d084]">{solvedProblems.length}</span>
                  </div>
                </div>

                <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
                  <p className="text-[10px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-4">RECENT_ACTIVITY</p>
                  {[
                    { icon: "✓",  text: "Solved \"Median of Two Sorted Arrays\"", color: "text-[#00d084]" },
                    { icon: "✓",  text: "Solved \"Container With Most Water\"",   color: "text-[#00d084]" },
                    { icon: "🔥", text: "7-day solving streak active",            color: "text-[#ffc01e]" },
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
              <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
                <div className="grid grid-cols-[48px_1fr_90px_120px] gap-3 px-5 py-3 text-[10px] text-[#50566a] font-mono tracking-[0.1em] uppercase border-b border-white/[0.08] bg-[#161820]/60">
                  <div>#</div><div>Title</div><div>Difficulty</div><div>Slug</div>
                </div>
                <div className="h-[480px] overflow-y-auto no-scrollbar">
                  {loading
                    ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                    : solvedProblems.length === 0
                    ? (
                      <div className="flex flex-col items-center justify-center h-full gap-3">
                        <div className="text-3xl">📭</div>
                        <p className="text-sm text-[#50566a] font-mono">No problems solved yet</p>
                      </div>
                    )
                    : solvedProblems.map((q) => <ProblemRow key={q.slug} question={q} />)
                  }
                </div>
              </div>
            )}

            {/* FRIENDS */}
            {activeTab === "friends" && (
              <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
                <p className="text-[10px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-4">YOUR_FRIENDS</p>
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="text-3xl">👥</div>
                  <p className="text-sm text-[#50566a]">Friends list coming soon</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
