import { useState, useEffect } from "react";
import { getSolvedQuestion, getFriendUser, getAcceptedFriends } from "../api/axiosClient";
import { Link, useNavigate } from "react-router-dom";
import ProblemRow from "../components/home/ProblemRow";

const avatarGrad = (letter = "A") => {
  const g = [
    "from-[#a855f7] to-[#6366f1]", "from-[#00d084] to-[#06b6d4]",
    "from-[#f59e0b] to-[#ef4743]", "from-[#ec4899] to-[#a855f7]",
    "from-[#06b6d4] to-[#3b82f6]", "from-[#f97316] to-[#ec4899]",
  ];
  return g[letter.charCodeAt(0) % g.length];
};

const LC_TOTALS = { easy: 839, medium: 1759, hard: 758 };
const TABS = ["overview", "solved", "friends"];

const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-5 py-3.5 border-b border-white/[0.04] animate-pulse">
    <div className="w-8 h-3 bg-white/[0.07] rounded flex-shrink-0" />
    <div className="flex-1 h-3 bg-white/[0.07] rounded" />
    <div className="w-16 h-5 bg-white/[0.05] rounded-md flex-shrink-0" />
    <div className="w-20 h-3 bg-white/[0.05] rounded flex-shrink-0" />
  </div>
);

const DiffBar = ({ label, solved, total, color, bg }) => (
  <div className="py-2.5 border-b border-white/[0.04] last:border-0">
    <div className="flex justify-between mb-1.5">
      <span className={`text-xs font-mono font-semibold ${color}`}>{label}</span>
      <span className="text-xs font-mono text-[#50566a]">{solved}/{total}</span>
    </div>
    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min((solved/total)*100,100)}%`, background: bg }} />
    </div>
  </div>
);

/* ─── FriendRow ───────────────────────────────────────────────── */
const FriendRow = ({ friend }) => {
  const navigate = useNavigate();
  const initial  = (friend.name || "U")[0].toUpperCase();
  const grad     = avatarGrad(initial);
  return (
    <div
      onClick={() => navigate(`/profile/${friend.name}`)}
      className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer group"
    >
      {/* avatar */}
      <div className="flex-shrink-0">
        {friend.avatar ? (
          <img src={friend.avatar} alt={friend.name}
            className="w-10 h-10 rounded-xl object-cover border border-white/[0.08] group-hover:scale-105 transition-transform" />
        ) : (
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-sm font-bold text-white group-hover:scale-105 transition-transform`}>
            {initial}
          </div>
        )}
      </div>
      {/* name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#c8ccd8] group-hover:text-[#00d084] transition-colors truncate">{friend.name}</p>
        <p className="text-[11px] text-[#50566a] font-mono truncate">@{friend.lc || friend.name?.toLowerCase()}</p>
      </div>
      {/* stats */}
      <div className="flex items-center gap-4 flex-shrink-0 text-right">
        <div>
          <p className="text-sm font-bold font-mono text-[#00d084]">{friend.solved ?? 0}</p>
          <p className="text-[10px] text-[#50566a]">solved</p>
        </div>
        <div>
          <p className="text-sm font-bold font-mono text-[#ffc01e]">{friend.streak != null ? `${friend.streak}d` : "—"}</p>
          <p className="text-[10px] text-[#50566a]">streak</p>
        </div>
        <div>
          <p className="text-sm font-bold font-mono text-[#06b6d4]">{friend.thisWeek != null ? friend.thisWeek : "—"}</p>
          <p className="text-[10px] text-[#50566a]">this week</p>
        </div>
        <svg className="w-4 h-4 text-[#30354a] group-hover:text-[#3b82f6] group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};

const MyProfile = () => {
  const [activeTab,      setActiveTab]      = useState("overview");
  const [userDto,        setUserDto]        = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [solvedLoading,  setSolvedLoading]  = useState(false);
  const [friendCount,    setFriendCount]    = useState(null);
  const [friends,        setFriends]        = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);

  const username = localStorage.getItem("username") || "user";
  const initial  = username[0]?.toUpperCase();
  const grad     = avatarGrad(initial);

  useEffect(() => {
    const load = async () => {
      try {
        const [dto, rawFriends] = await Promise.all([
          getFriendUser(username),
          getAcceptedFriends().catch(() => []),
        ]);
        setUserDto(dto);
        setFriendCount(rawFriends?.length ?? 0);

        // Build friend objects with UserDto
        setFriendsLoading(true);
        const built = await Promise.all(
          (rawFriends || []).map(async (f) => {
            const friendUsername = username === f.sender ? f.receiver : f.sender;
            try {
              const u = await getFriendUser(friendUsername);
              return {
                id: f.id, name: u?.username ?? friendUsername,
                avatar: u?.avatar ?? null, lc: u?.leetCodeUsername ?? null,
                streak: u?.streak ?? null, thisWeek: u?.solvedInAWeek ?? null,
                solved: u?.totalProblems ?? 0,
              };
            } catch {
              return { id: f.id, name: friendUsername, avatar: null, lc: null };
            }
          })
        );
        setFriends(built);
        setFriendsLoading(false);
      } catch {}
      finally { setLoading(false); }
    };
    load();

    setSolvedLoading(true);
    getSolvedQuestion(username)
      .then(data => setSolvedProblems(data || []))
      .catch(() => {})
      .finally(() => setSolvedLoading(false));
  }, [username]);

  if (loading) return (
    <div className="min-h-screen bg-[#0b0d13] py-8 px-6">
      <div className="max-w-[1100px] mx-auto grid grid-cols-12 gap-5 animate-pulse">
        <div className="col-span-12 md:col-span-4 space-y-4">
          <div className="bg-[#11131a] border border-white/[0.06] rounded-2xl h-72" />
          <div className="bg-[#11131a] border border-white/[0.06] rounded-2xl h-40" />
        </div>
        <div className="col-span-12 md:col-span-8 space-y-4">
          <div className="bg-[#11131a] border border-white/[0.06] rounded-2xl h-12" />
          <div className="bg-[#11131a] border border-white/[0.06] rounded-2xl h-64" />
        </div>
      </div>
    </div>
  );

  const easy   = userDto?.easyProblems   ?? 0;
  const medium = userDto?.mediumProblems ?? 0;
  const hard   = userDto?.hardProblems   ?? 0;
  const total  = userDto?.totalProblems  ?? 0;
  const streak = userDto?.streak         ?? null;
  const week   = userDto?.solvedInAWeek  ?? null;
  const lcTotal = LC_TOTALS.easy + LC_TOTALS.medium + LC_TOTALS.hard;
  const pct    = total > 0 ? ((total / lcTotal) * 100).toFixed(1) : "0.0";

  return (
    <div className="min-h-screen bg-[#0b0d13] text-[#f0f2f8] py-8 px-6">
      <div className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />

      <div className="relative z-10 max-w-[1100px] mx-auto">
        <div className="mb-6">
          <p className="text-[11px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-1">MY PROFILE</p>
          <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        </div>

        <div className="grid grid-cols-12 gap-5">

          {/* ══ LEFT ══ */}
          <div className="col-span-12 md:col-span-4 space-y-4">

            {/* Profile card */}
            <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
              <div className="h-1 bg-gradient-to-r from-[#00d084] via-[#06b6d4] to-[#3b82f6]" />
              <div className="p-5">
                {/* avatar */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative flex-shrink-0">
                    {userDto?.avatar ? (
                      <img src={userDto.avatar} alt="avatar" className="w-16 h-16 rounded-2xl border border-white/[0.1] object-cover" />
                    ) : (
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center text-2xl font-bold text-white`}>
                        {initial}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00d084] rounded-full border-2 border-[#11131a]" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold truncate">{username}</h2>
                    {userDto?.leetCodeUsername && (
                      <p className="text-sm text-[#50566a] font-mono truncate">@{userDto.leetCodeUsername}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#ffc01e]/10 border border-[#ffc01e]/20 text-[10px] font-mono text-[#ffc01e]">
                        🔥 {streak != null ? `${streak}d` : "—"}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#00d084]/10 border border-[#00d084]/20 text-[10px] font-mono text-[#00d084]">
                        {pct}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* stat pills */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {[
                    { label: "Solved",  value: total,        color: "text-[#00d084]" },
                    { label: "Streak",  value: streak != null ? `${streak}d` : "—", color: "text-[#ffc01e]" },
                    { label: "Friends", value: friendCount ?? "—", color: "text-[#3b82f6]" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-[#161820] rounded-xl p-3 text-center border border-white/[0.05]">
                      <div className={`text-lg font-bold font-mono ${color}`}>{value}</div>
                      <div className="text-[10px] text-[#50566a] mt-0.5 uppercase tracking-wider">{label}</div>
                    </div>
                  ))}
                </div>

                {/* last synced */}
                {userDto?.lastSyncedAt && (
                  <p className="text-[10px] font-mono text-[#30354a]">
                    Last synced: {new Date(userDto.lastSyncedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* difficulty split */}
            <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
              <p className="text-[10px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-3">DIFFICULTY_SPLIT</p>
              <DiffBar label="Easy"   solved={easy}   total={LC_TOTALS.easy}   color="text-[#00d084]" bg="#00d084" />
              <DiffBar label="Medium" solved={medium} total={LC_TOTALS.medium} color="text-[#ffc01e]" bg="#ffc01e" />
              <DiffBar label="Hard"   solved={hard}   total={LC_TOTALS.hard}   color="text-[#ef4743]" bg="#ef4743" />
            </div>

          </div>

          {/* ══ RIGHT ══ */}
          <div className="col-span-12 md:col-span-8 space-y-5">

            {/* tab bar */}
            <div className="flex gap-1.5 bg-[#11131a] border border-white/[0.08] rounded-xl p-1.5">
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab
                      ? "bg-[#161820] text-[#f0f2f8] border border-white/[0.1] shadow-sm"
                      : "text-[#50566a] hover:text-[#8890a8]"
                  }`}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* breakdown */}
                <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
                  <p className="text-[10px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-4">PROBLEM_BREAKDOWN</p>
                  {[
                    { label: "Easy",   value: easy,   color: "text-[#00d084]", bg: "#00d084", t: LC_TOTALS.easy },
                    { label: "Medium", value: medium, color: "text-[#ffc01e]", bg: "#ffc01e", t: LC_TOTALS.medium },
                    { label: "Hard",   value: hard,   color: "text-[#ef4743]", bg: "#ef4743", t: LC_TOTALS.hard },
                  ].map(({ label, value, color, bg, t }) => (
                    <div key={label} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
                      <span className={`text-sm font-mono font-semibold ${color}`}>{label}</span>
                      <span className="text-sm font-mono text-[#f0f2f8]">{value}
                        <span className="text-[#30354a] text-xs"> /{t}</span>
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-3 mt-1">
                    <span className="text-sm font-mono text-[#8890a8]">Total</span>
                    <span className="text-sm font-bold font-mono text-[#00d084]">{total}</span>
                  </div>
                </div>

                {/* activity */}
                <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
                  <p className="text-[10px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-4">ACTIVITY</p>
                  <div className="space-y-0">
                    {[
                      { label: "This week",      value: week != null ? `${week} solved` : "—",         color: "text-[#06b6d4]" },
                      { label: "Current streak", value: streak != null ? `🔥 ${streak} days` : "—",   color: "text-[#ffc01e]" },
                      { label: "Easy solved",    value: easy,                                           color: "text-[#00d084]" },
                      { label: "Medium solved",  value: medium,                                         color: "text-[#ffc01e]" },
                      { label: "Hard solved",    value: hard,                                           color: "text-[#ef4743]" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
                        <span className="text-sm text-[#8890a8]">{label}</span>
                        <span className={`text-sm font-bold font-mono ${color}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SOLVED */}
            {activeTab === "solved" && (
              <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.08] bg-[#161820]/60">
                  <div className="grid grid-cols-[48px_1fr_90px_120px] gap-3 flex-1 text-[10px] text-[#50566a] font-mono tracking-[0.1em] uppercase">
                    <div>#</div><div>Title</div><div>Difficulty</div><div>Slug</div>
                  </div>
                </div>
                <div className="h-[480px] overflow-y-auto no-scrollbar">
                  {solvedLoading
                    ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                    : solvedProblems.length === 0
                    ? (
                      <div className="flex flex-col items-center justify-center h-full gap-3">
                        <div className="text-3xl opacity-30">📭</div>
                        <p className="text-sm text-[#50566a] font-mono">No problems solved yet</p>
                        <p className="text-xs text-[#30354a]">Sync via the extension to populate this</p>
                      </div>
                    )
                    : solvedProblems.map(q => <ProblemRow key={q.slug} question={q} />)
                  }
                </div>
              </div>
            )}

            {/* FRIENDS */}
            {activeTab === "friends" && (
              <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
                <div className="px-5 py-3 border-b border-white/[0.08] bg-[#161820]/60 flex items-center justify-between">
                  <p className="text-[10px] font-mono text-[#50566a] tracking-[0.15em] uppercase">YOUR_FRIENDS</p>
                  <span className="text-[10px] font-mono text-[#30354a]">{friends.length} total</span>
                </div>
                {friendsLoading ? (
                  <div className="divide-y divide-white/[0.04]">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.07] flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-white/[0.07] rounded w-1/3" />
                          <div className="h-2.5 bg-white/[0.04] rounded w-1/4" />
                        </div>
                        <div className="w-16 h-3 bg-white/[0.05] rounded" />
                      </div>
                    ))}
                  </div>
                ) : friends.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="text-3xl opacity-25">👥</div>
                    <p className="text-sm text-[#50566a]">No friends yet</p>
                    <Link to="/friends" className="text-xs text-[#3b82f6] hover:text-[#60a5fa] transition-colors">
                      Find friends →
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.04]">
                    {friends.map(f => (
                      <FriendRow key={f.id} friend={f} />
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;