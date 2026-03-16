import { useEffect, useState } from "react";
import { getFriendUser } from "../api/axiosClient";

const DifficultyBar = ({ label, solved, total, color, textColor }) => {
  const pct = Math.min((solved / total) * 100, 100).toFixed(1);
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className={`text-xs font-mono font-semibold ${textColor}`}>{label}</span>
        <span className="text-xs font-mono text-[#50566a]">
          {solved} <span className="text-[#30354a]">/</span> {total}
        </span>
      </div>
      <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const StatSkeleton = () => (
  <div className="animate-pulse space-y-5">
    <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl overflow-hidden">
      <div className="h-1 bg-white/[0.06]" />
      <div className="p-6 flex gap-5">
        <div className="w-20 h-20 rounded-2xl bg-white/[0.07]" />
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-white/[0.07] rounded w-1/3" />
          <div className="h-3 bg-white/[0.04] rounded w-1/4" />
          <div className="flex gap-3 mt-3">
            <div className="h-7 w-28 bg-white/[0.05] rounded-lg" />
            <div className="h-7 w-28 bg-white/[0.05] rounded-lg" />
          </div>
        </div>
      </div>
    </div>
    <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-6">
      <div className="h-3 bg-white/[0.06] rounded w-32 mb-6" />
      <div className="flex gap-10">
        <div className="w-44 h-44 rounded-full bg-white/[0.05]" />
        <div className="flex-1 space-y-5">
          {[1,2,3].map(i => <div key={i} className="h-8 bg-white/[0.04] rounded-xl" />)}
        </div>
      </div>
    </div>
  </div>
);

const avatarGrad = (letter = "A") => {
  const g = [
    "from-[#a855f7] to-[#6366f1]",
    "from-[#00d084] to-[#06b6d4]",
    "from-[#f59e0b] to-[#ef4743]",
    "from-[#ec4899] to-[#a855f7]",
    "from-[#06b6d4] to-[#3b82f6]",
    "from-[#f97316] to-[#ec4899]",
  ];
  return g[letter.charCodeAt(0) % g.length];
};

// LeetCode total questions (approximate — update as LC grows)
const LC_TOTALS = { easy: 839, medium: 1759, hard: 758 };

const StatsPage = () => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const username = localStorage.getItem("username");

  useEffect(() => {
    if (!username) { setError("Not logged in."); setLoading(false); return; }
    getFriendUser(username)
      .then(data => setUser(data))
      .catch(() => setError("Could not load stats. Try syncing via the extension."))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return (
    <div className="min-h-screen bg-[#0b0d13] text-[#f0f2f8] py-8 px-6">
      <div className="max-w-[860px] mx-auto space-y-5">
        <div className="mb-2">
          <p className="text-[11px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-1">ANALYTICS</p>
          <h1 className="text-2xl font-semibold tracking-tight">Stats</h1>
        </div>
        <StatSkeleton />
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#0b0d13] text-[#f0f2f8] py-8 px-6 flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="text-5xl opacity-30">📊</div>
        <p className="text-[#8890a8]">{error}</p>
      </div>
    </div>
  );

  const easy   = user?.easyProblems   ?? 0;
  const medium = user?.mediumProblems ?? 0;
  const hard   = user?.hardProblems   ?? 0;
  const total  = user?.totalProblems  ?? (easy + medium + hard);
  const streak = user?.streak         ?? 0;
  const thisWeek = user?.solvedInAWeek ?? 0;
  const lcTotal  = LC_TOTALS.easy + LC_TOTALS.medium + LC_TOTALS.hard;
  const completion = total > 0 ? ((total / lcTotal) * 100).toFixed(1) : "0.0";

  const initial = (username || "U")[0].toUpperCase();
  const grad    = avatarGrad(initial);

  // Donut ring
  const radius       = 60;
  const circumference = 2 * Math.PI * radius;
  const offset       = circumference - (parseFloat(completion) / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#0b0d13] text-[#f0f2f8] py-8 px-6">
      {/* grid texture */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />

      <div className="relative z-10 max-w-[860px] mx-auto space-y-5">

        {/* Page label */}
        <div className="mb-2">
          <p className="text-[11px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-1">ANALYTICS</p>
          <h1 className="text-2xl font-semibold tracking-tight">Stats</h1>
        </div>

        {/* ══ HEADER CARD ══ */}
        <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          <div className="h-1 bg-gradient-to-r from-[#00d084] via-[#06b6d4] to-[#3b82f6]" />
          <div className="p-6">
            <div className="flex items-center gap-5 flex-wrap">

              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} className="w-20 h-20 rounded-2xl border border-white/[0.1] object-cover" alt="avatar" />
                ) : (
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center text-3xl font-bold text-white`}>
                    {initial}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00d084] rounded-full border-2 border-[#11131a]" />
              </div>

              {/* Name + badges */}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold tracking-tight">{user?.username ?? username}</h2>
                {user?.leetCodeUsername && (
                  <p className="text-sm text-[#50566a] font-mono mt-0.5">@{user.leetCodeUsername}</p>
                )}
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#ffc01e]/10 border border-[#ffc01e]/20 text-xs font-mono text-[#ffc01e]">
                    🔥 {streak}-day streak
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#00d084]/10 border border-[#00d084]/20 text-xs font-mono text-[#00d084]">
                    {completion}% complete
                  </span>
                  {thisWeek > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#06b6d4]/10 border border-[#06b6d4]/20 text-xs font-mono text-[#06b6d4]">
                      📅 {thisWeek} this week
                    </span>
                  )}
                </div>
              </div>

              {/* Quick stat pills */}
              <div className="hidden sm:grid grid-cols-3 gap-3 flex-shrink-0">
                {[
                  { label: "Solved", value: total,  color: "text-[#00d084]" },
                  { label: "Easy",   value: easy,   color: "text-[#00d084]" },
                  { label: "Hard",   value: hard,   color: "text-[#ef4743]" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-[#161820] rounded-xl px-4 py-3 text-center border border-white/[0.05]">
                    <div className={`text-xl font-bold font-mono ${color}`}>{value}</div>
                    <div className="text-[10px] text-[#50566a] mt-0.5 uppercase tracking-wider">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══ SOLVE DISTRIBUTION ══ */}
        <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          <p className="text-[10px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-6">SOLVE_DISTRIBUTION</p>
          <div className="flex flex-col lg:flex-row items-center gap-10">

            {/* Ring */}
            <div className="relative w-44 h-44 flex-shrink-0">
              <svg className="w-44 h-44 rotate-[-90deg]" viewBox="0 0 176 176">
                <circle cx="88" cy="88" r={radius} stroke="rgba(255,255,255,0.06)" strokeWidth="14" fill="none" />
                <circle cx="88" cy="88" r={radius} stroke="url(#ringGrad)" strokeWidth="14" fill="none"
                  strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                  className="transition-all duration-700" />
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor="#00d084" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold font-mono text-[#f0f2f8]">{total}</span>
                <span className="text-xs text-[#50566a] mt-0.5 font-mono">/ {lcTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Bars */}
            <div className="flex-1 w-full space-y-5">
              <DifficultyBar label="Easy"   solved={easy}   total={LC_TOTALS.easy}   color="bg-[#00d084]" textColor="text-[#00d084]" />
              <DifficultyBar label="Medium" solved={medium} total={LC_TOTALS.medium} color="bg-[#ffc01e]" textColor="text-[#ffc01e]" />
              <DifficultyBar label="Hard"   solved={hard}   total={LC_TOTALS.hard}   color="bg-[#ef4743]" textColor="text-[#ef4743]" />
            </div>
          </div>
        </div>

        {/* ══ WEEKLY + LAST SYNC ══ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
            <p className="text-[10px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-4">THIS_WEEK</p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold font-mono text-[#06b6d4]">{thisWeek ?? "—"}</span>
              <span className="text-sm text-[#50566a] mb-1">problems solved</span>
            </div>
          </div>
          <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
            <p className="text-[10px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-4">LAST_SYNCED</p>
            <div className="flex items-end gap-2">
              <span className="text-sm font-mono text-[#f0f2f8]">
                {user?.lastSyncedAt
                  ? new Date(user.lastSyncedAt).toLocaleString()
                  : "Never synced"}
              </span>
            </div>
            {!user?.lastSyncedAt && (
              <p className="text-[11px] text-[#50566a] mt-2">Open the extension and click Sync Problems</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StatsPage;