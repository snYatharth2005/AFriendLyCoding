import { useEffect, useState } from "react";
import {
  acceptFriendRequest, rejectFriendRequest,
  friendRequest, friendRequestCheck, getFriendUser,
  getSolvedQuestion, getAcceptedFriends,
} from "../api/axiosClient";
import { useParams, Link, useNavigate } from "react-router-dom";
import ProblemRow from "../components/home/ProblemRow";

/* ─── Helpers ──────────────────────────────────────────────────── */
const avatarGrad = (letter = "A") => {
  const g = [
    "from-[#a855f7] to-[#6366f1]", "from-[#00d084] to-[#06b6d4]",
    "from-[#f59e0b] to-[#ef4743]", "from-[#ec4899] to-[#a855f7]",
    "from-[#06b6d4] to-[#3b82f6]", "from-[#f97316] to-[#ec4899]",
  ];
  return g[letter.charCodeAt(0) % g.length];
};

const LC_TOTALS = { easy: 839, medium: 1759, hard: 758 };
const TABS_OWN    = ["overview", "solved", "friends"];
const TABS_FRIEND = ["overview", "friends"];
const TABS_OTHER  = ["overview"];

/* ─── Locked overlay — shown to non-friends ───────────────────── */
const LockedCard = ({ label }) => (
  <div className="relative bg-[#11131a] border border-white/[0.06] rounded-2xl p-5 overflow-hidden">
    {/* skeleton rows behind blur */}
    <div className="space-y-3 blur-[3px] pointer-events-none select-none opacity-40">
      {[80, 60, 90, 50, 70].map((w, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-6 h-2.5 bg-white/[0.1] rounded" />
          <div className="h-2.5 bg-white/[0.08] rounded" style={{ width: `${w}%` }} />
          <div className="w-12 h-4 bg-white/[0.06] rounded ml-auto" />
        </div>
      ))}
    </div>
    {/* lock overlay */}
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0b0d13]/70 backdrop-blur-[1px] rounded-2xl">
      <div className="w-10 h-10 rounded-xl bg-[#161820] border border-white/[0.1] flex items-center justify-center text-xl">🔒</div>
      <p className="text-xs font-mono text-[#50566a] text-center px-4 leading-relaxed">
        Send a friend request<br />
        <span className="text-[#3b82f6]">to see {label}</span>
      </p>
    </div>
  </div>
);

/* ─── Diff bar ────────────────────────────────────────────────── */
const DiffBar = ({ label, solved, total, color, textColor }) => (
  <div>
    <div className="flex justify-between mb-1.5">
      <span className={`text-xs font-mono font-semibold ${textColor}`}>{label}</span>
      <span className="text-xs font-mono text-[#50566a]">{solved} <span className="text-[#30354a]">/</span> {total}</span>
    </div>
    <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${Math.min((solved / total) * 100, 100)}%` }} />
    </div>
  </div>
);

/* ─── Skeleton row ────────────────────────────────────────────── */
const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-5 py-3.5 border-b border-white/[0.04] animate-pulse">
    <div className="w-8 h-3 bg-white/[0.07] rounded flex-shrink-0" />
    <div className="flex-1 h-3 bg-white/[0.07] rounded" />
    <div className="w-16 h-5 bg-white/[0.05] rounded-md flex-shrink-0" />
    <div className="w-20 h-3 bg-white/[0.05] rounded flex-shrink-0" />
  </div>
);

/* ─── FriendRow ───────────────────────────────────────────────── */
const FriendRow = ({ friend }) => {
  const navigate = useNavigate();
  const initial  = (friend.name || "U")[0].toUpperCase();
  const grad     = avatarGrad(initial);
  return (
    <div onClick={() => navigate(`/profile/${friend.name}`)}
      className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer group">
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
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#c8ccd8] group-hover:text-[#00d084] transition-colors truncate">{friend.name}</p>
        <p className="text-[11px] text-[#50566a] font-mono truncate">@{friend.lc || friend.name?.toLowerCase()}</p>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0 text-right">
        <div>
          <p className="text-sm font-bold font-mono text-[#00d084]">{friend.solved ?? 0}</p>
          <p className="text-[10px] text-[#50566a]">solved</p>
        </div>
        <div>
          <p className="text-sm font-bold font-mono text-[#ffc01e]">{friend.streak != null ? `${friend.streak}d` : "—"}</p>
          <p className="text-[10px] text-[#50566a]">streak</p>
        </div>
        <svg className="w-4 h-4 text-[#30354a] group-hover:text-[#3b82f6] group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   ProfilePage
════════════════════════════════════════════════════════════════ */
const ProfilePage = () => {
  const { username } = useParams();
  const loggedUser   = localStorage.getItem("username");
  const isOwn        = loggedUser === username;

  const [userDto,        setUserDto]        = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [activeTab,      setActiveTab]      = useState("overview");
  const [requestStatus,  setRequestStatus]  = useState(null); // null | PENDING | ACCEPTED | REJECTED
  const [reqLoading,     setReqLoading]     = useState(false);
  const [isFriend,       setIsFriend]       = useState(false);

  // own profile extras
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [solvedLoading,  setSolvedLoading]  = useState(false);
  const [profileFriends, setProfileFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friendCount,    setFriendCount]    = useState(null);

  useEffect(() => {
    setLoading(true);
    setActiveTab("overview");

    const load = async () => {
      try {
        // Always fetch UserDto
        const dto = await getFriendUser(username);
        setUserDto(dto);

        if (!isOwn) {
          // Check friendship status
          const status = await friendRequestCheck(loggedUser, username).catch(() => null);
          setRequestStatus(status);
          const friendConfirmed = status === "ACCEPTED";
          setIsFriend(friendConfirmed);
          if (friendConfirmed) {
            // load this user's friend list
            setFriendsLoading(true);
            getAcceptedFriends().then(async (raw) => {
              const built = await Promise.all(
                (raw || []).map(async (f) => {
                  const friendUsername = username === f.sender ? f.receiver : f.sender;
                  try {
                    const u = await getFriendUser(friendUsername);
                    return { id: f.id, name: u?.username ?? friendUsername, avatar: u?.avatar ?? null, lc: u?.leetCodeUsername ?? null, streak: u?.streak ?? null, solved: u?.totalProblems ?? 0 };
                  } catch { return { id: f.id, name: friendUsername, avatar: null, lc: null }; }
                })
              );
              setProfileFriends(built);
            }).catch(() => {}).finally(() => setFriendsLoading(false));
          }
        } else {
          setIsFriend(true); // own profile = full access
          // friend count
          getAcceptedFriends().then(f => setFriendCount(f?.length ?? 0)).catch(() => {});
          // solved problems
          setSolvedLoading(true);
          getSolvedQuestion(username)
            .then(data => setSolvedProblems(data || []))
            .catch(() => {})
            .finally(() => setSolvedLoading(false));
        }
      } catch {
        setUserDto(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username]);

  /* friend actions */
  const handleAddFriend = async () => {
    try {
      setReqLoading(true);
      await friendRequest(loggedUser, username);
      setRequestStatus("PENDING");
    } catch {}
    finally { setReqLoading(false); }
  };

  /* ── loading ── */
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

  /* ── not found ── */
  if (!userDto) return (
    <div className="min-h-screen bg-[#0b0d13] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="text-5xl opacity-25">🔍</div>
        <p className="text-[#8890a8] text-sm">User not found</p>
      </div>
    </div>
  );

  const initial = (username || "U")[0].toUpperCase();
  const grad    = avatarGrad(initial);
  const easy    = userDto?.easyProblems   ?? 0;
  const medium  = userDto?.mediumProblems ?? 0;
  const hard    = userDto?.hardProblems   ?? 0;
  const total   = userDto?.totalProblems  ?? 0;
  const streak  = userDto?.streak         ?? null;
  const week    = userDto?.solvedInAWeek  ?? null;
  const tabs    = isOwn ? TABS_OWN : (isFriend ? TABS_FRIEND : TABS_OTHER);

  /* ── Friend action button ── */
  const FriendButton = () => {
    if (isOwn) return null;
    if (requestStatus === "ACCEPTED") return (
      <button className="w-full py-2.5 rounded-xl text-sm font-semibold bg-[#00d084]/10 text-[#00d084] border border-[#00d084]/20 cursor-default">
        ✓ Friends
      </button>
    );
    if (requestStatus === "PENDING") return (
      <button disabled className="w-full py-2.5 rounded-xl text-sm font-medium bg-[#ffc01e]/10 text-[#ffc01e] border border-[#ffc01e]/20 cursor-not-allowed opacity-80">
        ⏳ Request Sent
      </button>
    );
    return (
      <button onClick={handleAddFriend} disabled={reqLoading}
        className="w-full py-2.5 rounded-xl text-sm font-semibold text-black bg-gradient-to-r from-[#00d084] to-[#00b874] hover:-translate-y-px transition-all shadow-[0_4px_16px_rgba(0,208,132,0.2)] disabled:opacity-60">
        {reqLoading ? "Sending…" : "+ Add Friend"}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#0b0d13] text-[#f0f2f8] py-8 px-6">
      <div className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />

      <div className="relative z-10 max-w-[1100px] mx-auto">

        {/* page header */}
        <div className="mb-6">
          <p className="text-[11px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-1">
            {isOwn ? "MY PROFILE" : "PROFILE"}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">@{username}</h1>
        </div>

        <div className="grid grid-cols-12 gap-5">

          {/* ══ LEFT ══ */}
          <div className="col-span-12 md:col-span-4 space-y-4">

            {/* Profile card */}
            <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
              <div className={`h-1 bg-gradient-to-r ${isOwn ? "from-[#00d084] via-[#06b6d4] to-[#3b82f6]" : "from-[#3b82f6] via-[#a855f7] to-[#06b6d4]"}`} />
              <div className="p-5">
                {/* avatar + name */}
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
                    {userDto?.lastSyncedAt && (
                      <p className="text-[10px] text-[#30354a] font-mono mt-0.5">
                        synced {new Date(userDto.lastSyncedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* friend button */}
                {!isOwn && (
                  <div className="mb-5"><FriendButton /></div>
                )}

                {/* stat pills */}
                <div className={`grid gap-2 mb-5 ${isOwn ? "grid-cols-3" : "grid-cols-2"}`}>
                  <div className="bg-[#161820] rounded-xl p-3 text-center border border-white/[0.05]">
                    <div className="text-lg font-bold font-mono text-[#00d084]">{total}</div>
                    <div className="text-[10px] text-[#50566a] mt-0.5 uppercase tracking-wider">Solved</div>
                  </div>
                  {(isFriend || isOwn) ? (
                    <div className="bg-[#161820] rounded-xl p-3 text-center border border-white/[0.05]">
                      <div className="text-lg font-bold font-mono text-[#ffc01e]">
                        {streak != null ? `🔥${streak}` : "—"}
                      </div>
                      <div className="text-[10px] text-[#50566a] mt-0.5 uppercase tracking-wider">Streak</div>
                    </div>
                  ) : (
                    <div className="bg-[#161820] rounded-xl p-3 text-center border border-white/[0.05] relative overflow-hidden">
                      <div className="text-lg font-bold font-mono text-[#30354a] blur-[3px]">🔥99</div>
                      <div className="text-[10px] text-[#50566a] mt-0.5 uppercase tracking-wider">Streak</div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-base">🔒</span>
                      </div>
                    </div>
                  )}
                  {isOwn && (
                    <div className="bg-[#161820] rounded-xl p-3 text-center border border-white/[0.05]">
                      <div className="text-lg font-bold font-mono text-[#3b82f6]">
                        {friendCount ?? "—"}
                      </div>
                      <div className="text-[10px] text-[#50566a] mt-0.5 uppercase tracking-wider">Friends</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* difficulty split — visible to friends + self */}
            {(isFriend || isOwn) ? (
              <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                <p className="text-[10px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-4">DIFFICULTY_SPLIT</p>
                <div className="space-y-4">
                  <DiffBar label="Easy"   solved={easy}   total={LC_TOTALS.easy}   color="bg-[#00d084]" textColor="text-[#00d084]" />
                  <DiffBar label="Medium" solved={medium} total={LC_TOTALS.medium} color="bg-[#ffc01e]" textColor="text-[#ffc01e]" />
                  <DiffBar label="Hard"   solved={hard}   total={LC_TOTALS.hard}   color="bg-[#ef4743]" textColor="text-[#ef4743]" />
                </div>
              </div>
            ) : (
              <LockedCard label="difficulty stats" />
            )}

          </div>

          {/* ══ RIGHT ══ */}
          <div className="col-span-12 md:col-span-8 space-y-5">

            {/* Tab bar */}
            <div className="flex gap-1.5 bg-[#11131a] border border-white/[0.08] rounded-xl p-1.5">
              {tabs.map(tab => (
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

            {/* ── OVERVIEW ── */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* problem breakdown */}
                {(isFriend || isOwn) ? (
                  <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
                    <p className="text-[10px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-4">PROBLEM_BREAKDOWN</p>
                    {[
                      { label: "Easy",   value: easy,   color: "text-[#00d084]", bg: "#00d084", t: LC_TOTALS.easy },
                      { label: "Medium", value: medium, color: "text-[#ffc01e]", bg: "#ffc01e", t: LC_TOTALS.medium },
                      { label: "Hard",   value: hard,   color: "text-[#ef4743]", bg: "#ef4743", t: LC_TOTALS.hard },
                    ].map(({ label, value, color, bg, t }) => (
                      <div key={label} className="py-2.5 border-b border-white/[0.04] last:border-0">
                        <div className="flex justify-between mb-1.5">
                          <span className={`text-xs font-mono font-semibold ${color}`}>{label}</span>
                          <span className="text-xs font-mono text-[#50566a]">{value}/{t}</span>
                        </div>
                        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${Math.min((value/t)*100,100)}%`, background: bg }} />
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between pt-3 mt-1">
                      <span className="text-xs font-mono text-[#8890a8]">Total solved</span>
                      <span className="text-xs font-bold font-mono text-[#00d084]">{total}</span>
                    </div>
                  </div>
                ) : (
                  <LockedCard label="problem breakdown" />
                )}

                {/* activity / week */}
                {(isFriend || isOwn) ? (
                  <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
                    <p className="text-[10px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-4">ACTIVITY</p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04]">
                        <span className="text-sm text-[#8890a8]">This week</span>
                        <span className="text-sm font-bold font-mono text-[#06b6d4]">
                          {week != null ? `${week} solved` : "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04]">
                        <span className="text-sm text-[#8890a8]">Current streak</span>
                        <span className="text-sm font-bold font-mono text-[#ffc01e]">
                          {streak != null ? `🔥 ${streak} days` : "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-sm text-[#8890a8]">Last synced</span>
                        <span className="text-xs font-mono text-[#50566a]">
                          {userDto?.lastSyncedAt
                            ? new Date(userDto.lastSyncedAt).toLocaleDateString()
                            : "Never"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <LockedCard label="activity stats" />
                )}

              </div>
            )}

            {/* ── FRIENDS tab ── */}
            {activeTab === "friends" && (
              <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
                <div className="px-5 py-3 border-b border-white/[0.08] bg-[#161820]/60 flex items-center justify-between">
                  <p className="text-[10px] font-mono text-[#50566a] tracking-[0.15em] uppercase">FRIENDS</p>
                  <span className="text-[10px] font-mono text-[#30354a]">{profileFriends.length} total</span>
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
                ) : profileFriends.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="text-3xl opacity-25">👥</div>
                    <p className="text-sm text-[#50566a]">No friends yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.04]">
                    {profileFriends.map(f => <FriendRow key={f.id} friend={f} />)}
                  </div>
                )}
              </div>
            )}

            {/* ── SOLVED (own only) ── */}
            {activeTab === "solved" && isOwn && (
              <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
                <div className="grid grid-cols-[48px_1fr_90px_120px] gap-3 px-5 py-3 text-[10px] text-[#50566a] font-mono tracking-[0.1em] uppercase border-b border-white/[0.08] bg-[#161820]/60">
                  <div>#</div><div>Title</div><div>Difficulty</div><div>Slug</div>
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

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;