import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getIncomingFriendRequests, getSentFriendRequests, acceptFriendRequest,
  rejectFriendRequest, withdrawFriendRequest, getAcceptedFriends, removeFriend,
  searchUsers, friendRequest, getFriendUser,
} from "../api/axiosClient";

/* ─────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────── */
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

const Avatar = ({ src, name, size = "md" }) => {
  const dims = {
    xs: "w-8  h-8  text-xs  rounded-xl",
    sm: "w-10 h-10 text-sm  rounded-xl",
    md: "w-12 h-12 text-lg  rounded-2xl",
    lg: "w-14 h-14 text-xl  rounded-2xl",
  };
  const initial = (name || "U")[0].toUpperCase();
  return src ? (
    <img src={src} alt={name} className={`${dims[size]} object-cover border border-white/[0.08] flex-shrink-0`} />
  ) : (
    <div className={`${dims[size]} bg-gradient-to-br ${avatarGrad(initial)} flex items-center justify-center font-bold text-white flex-shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.4)]`}>
      {initial}
    </div>
  );
};

const DiffBar = ({ label, value, total, color }) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="text-xs text-[#8890a8]">{label}</span>
      <span className="text-xs font-mono text-[#8890a8]">{value}</span>
    </div>
    <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min((value / total) * 100, 100)}%`, background: color }} />
    </div>
  </div>
);

/* ─────────────────────────────────────────────────
   resolveFriendName — just gets the friend's username from DTO
   Full stats are fetched separately via GET /friends/get/user/{username}
───────────────────────────────────────────────── */
const resolveFriendName = (f, loggedUser) => {
  const isSender = loggedUser === f.sender;
  return isSender ? f.receiver : f.sender;
};

// Merge friend DTO + UserDto stats into one card-ready object
const buildFriendObj = (f, userDto, loggedUser) => ({
  id:       f.id,
  name:     userDto?.username      ?? resolveFriendName(f, loggedUser),
  avatar:   userDto?.avatar        ?? null,
  lc:       userDto?.leetCodeUsername ?? null,
  streak:   userDto?.streak        ?? null,
  thisWeek: userDto?.solvedInAWeek ?? null,
  solved:   userDto?.totalProblems ?? 0,
  easy:     userDto?.easyProblems  ?? 0,
  medium:   userDto?.mediumProblems ?? 0,
  hard:     userDto?.hardProblems  ?? 0,
});

/* ─────────────────────────────────────────────────
   FriendCard
───────────────────────────────────────────────── */
const FriendCard = ({ friend, onRemove, removing }) => {
  const navigate = useNavigate();
  const { easy, medium, hard, solved, streak, thisWeek } = friend;

  return (
    <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-5 hover:border-white/[0.14] transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.35)] flex flex-col gap-4">
      {/* top row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar src={friend.avatar} name={friend.name} size="md" />
          <div className="min-w-0">
            <Link to={`/profile/${friend.name}`}>
              <p className="text-[15px] font-semibold text-[#f0f2f8] hover:text-[#00d084] transition-colors truncate leading-snug">{friend.name}</p>
            </Link>
            <p className="text-xs text-[#50566a] font-mono truncate">@{friend.lc || friend.name?.toLowerCase()}</p>
          </div>
        </div>
        <button onClick={() => navigate(`/compare/${friend.name}`)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#f0f2f8] bg-[#161820] border border-white/[0.1] hover:border-[#00d084]/40 hover:text-[#00d084] transition-all duration-200 flex-shrink-0">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/>
            <rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>
          </svg>
          Compare
        </button>
      </div>

      {/* stat pills */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#0f1117] rounded-xl p-3 text-center border border-white/[0.05]">
          <p className="text-xl font-bold font-mono text-[#f0f2f8] leading-none">{solved ?? "—"}</p>
          <p className="text-[11px] text-[#50566a] mt-1">Total</p>
        </div>
        <div className="bg-[#0f1117] rounded-xl p-3 text-center border border-white/[0.05]">
          <p className="text-xl font-bold font-mono text-[#06b6d4] leading-none">{thisWeek ?? "—"}</p>
          <p className="text-[11px] text-[#50566a] mt-1">This Week</p>
        </div>
        <div className="bg-[#0f1117] rounded-xl p-3 text-center border border-white/[0.05]">
          <p className="text-xl font-bold font-mono text-[#3b82f6] leading-none">{streak != null ? `${streak}d` : "—"}</p>
          <p className="text-[11px] text-[#50566a] mt-1">Streak</p>
        </div>
      </div>

      {/* diff bars */}
      <div className="space-y-2.5">
        <DiffBar label="Easy"   value={easy}   total={839}  color="#00d084" />
        <DiffBar label="Medium" value={medium} total={1759} color="#ffc01e" />
        <DiffBar label="Hard"   value={hard}   total={758}  color="#ef4743" />
      </div>

      {/* remove */}
      <div className="flex justify-end pt-1 border-t border-white/[0.04]">
        <button disabled={removing} onClick={onRemove}
          className="text-[11px] font-mono text-[#50566a] hover:text-[#ef4743] transition-colors disabled:opacity-40">
          {removing ? "removing…" : "remove friend"}
        </button>
      </div>
    </div>
  );
};

const SkeletonFriendCard = () => (
  <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-5 animate-pulse space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-white/[0.07]" />
      <div className="flex-1 space-y-2"><div className="h-4 bg-white/[0.07] rounded w-1/2" /><div className="h-3 bg-white/[0.04] rounded w-1/3" /></div>
      <div className="w-20 h-8 bg-white/[0.05] rounded-xl" />
    </div>
    <div className="grid grid-cols-3 gap-2">{[1,2,3].map(i => <div key={i} className="h-14 bg-white/[0.04] rounded-xl" />)}</div>
    <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-4 bg-white/[0.04] rounded" />)}</div>
  </div>
);

const EmptyState = ({ icon, text, sub }) => (
  <div className="col-span-2 flex flex-col items-center justify-center py-20 gap-3">
    <div className="text-5xl opacity-25">{icon}</div>
    <p className="text-[#8890a8] text-sm font-medium">{text}</p>
    {sub && <p className="text-[#50566a] text-xs">{sub}</p>}
  </div>
);

/* ─────────────────────────────────────────────────
   AddFriendBar
───────────────────────────────────────────────── */
const AddFriendBar = ({ friendNames = [], onAddFriend, sentIds = new Set(), loggedUser = "" }) => {
  const [query,     setQuery]     = useState("");
  const [results,   setResults]   = useState([]);
  const [searching, setSearching] = useState(false);
  const [open,      setOpen]      = useState(false);
  const [focused,   setFocused]   = useState(false);
  const wrapperRef = useRef(null);
  const inputRef   = useRef(null);
  const navigate   = useNavigate();

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); setOpen(false); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const data = await searchUsers(query);
        setResults(Array.isArray(data) ? data : []);
        setOpen(true);
      } catch { setResults([]); setOpen(true); }
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const h = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleSend = () => {
    if (query.trim().length < 2) return;
    const match = results.find(r => r.username.toLowerCase() === query.trim().toLowerCase());
    if (match) {
      if (match.username === loggedUser) return;
      onAddFriend(match.username); setQuery(""); setOpen(false);
    } else if (results.length === 1) {
      onAddFriend(results[0].username); setQuery(""); setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className={`flex items-center gap-3 bg-[#161820] rounded-2xl px-4 border transition-all duration-200 ${focused ? "border-[#00d084]/40 shadow-[0_0_0_3px_rgba(0,208,132,0.07)]" : "border-white/[0.08] hover:border-white/[0.13]"}`}>
        <svg className={`w-5 h-5 flex-shrink-0 transition-colors ${focused ? "text-[#00d084]" : "text-[#50566a]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        <input ref={inputRef} type="text" value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => { setFocused(true); if (results.length) setOpen(true); }}
          onBlur={() => setFocused(false)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="Add friend by username…"
          className="flex-1 bg-transparent py-3.5 text-sm text-[#f0f2f8] placeholder-[#50566a] focus:outline-none" />
        {searching && <div className="w-4 h-4 rounded-full border-2 border-[#00d084]/30 border-t-[#00d084] animate-spin flex-shrink-0" />}
        {query && !searching && (
          <button onClick={() => { setQuery(""); setOpen(false); inputRef.current?.focus(); }} className="w-5 h-5 flex items-center justify-center text-[#50566a] hover:text-[#8890a8] transition-colors flex-shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        )}
        <button onClick={handleSend} disabled={query.trim().length < 2 || searching}
          className="flex-shrink-0 px-5 py-2 rounded-xl text-sm font-semibold text-black bg-gradient-to-r from-[#00d084] to-[#00b874] hover:-translate-y-px transition-all duration-200 shadow-[0_4px_16px_rgba(0,208,132,0.25)] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none">
          Send Request
        </button>
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full z-50 bg-[#11131a] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.6)]">
          <div className="px-4 pt-3 pb-2 border-b border-white/[0.05]">
            <span className="text-[10px] font-mono text-[#30354a] tracking-[0.15em] uppercase">{results.length} user{results.length !== 1 ? "s" : ""} found</span>
          </div>
          <div className="max-h-[280px] overflow-y-auto no-scrollbar divide-y divide-white/[0.03]">
            {results.map(user => {
              const isSelf  = user.username === loggedUser;
              const friend  = !isSelf && friendNames.includes(user.username);
              const sent    = sentIds.has(user.username);
              return (
                <div key={user.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors group">
                  <button onClick={() => { navigate(`/profile/${user.username}`); setQuery(""); setOpen(false); }} className="flex-shrink-0">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGrad((user.username||"U")[0])} flex items-center justify-center text-sm font-bold text-white overflow-hidden`}>
                      {user.avatar ? <img src={user.avatar} alt={user.username} className="w-full h-full object-cover"/> : (user.username||"U")[0].toUpperCase()}
                    </div>
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { navigate(`/profile/${user.username}`); setQuery(""); setOpen(false); }}>
                        <p className="text-sm font-semibold text-[#f0f2f8] group-hover:text-[#00d084] transition-colors">{user.username}</p>
                      </button>
                      {isSelf  && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20">you</span>}
                      {friend  && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#00d084]/10 text-[#00d084] border border-[#00d084]/20">friend</span>}
                    </div>
                    <p className="text-xs text-[#50566a] font-mono">{user.name || "AFriendlyCoding user"}</p>
                  </div>
                  {isSelf ? (
                    <button onClick={() => { navigate("/profile/me"); setQuery(""); setOpen(false); }} className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-[#3b82f6] hover:bg-[#3b82f6]/20 transition-all">My Profile</button>
                  ) : friend ? (
                    <button onClick={() => { navigate(`/profile/${user.username}`); setQuery(""); setOpen(false); }} className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#161820] border border-white/[0.08] text-[#8890a8] hover:text-[#f0f2f8] transition-all">View</button>
                  ) : sent ? (
                    <span className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#ffc01e]/10 text-[#ffc01e] border border-[#ffc01e]/20">Sent ✓</span>
                  ) : (
                    <button onClick={() => { onAddFriend(user.username); setQuery(""); setOpen(false); }} className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold text-black bg-gradient-to-r from-[#00d084] to-[#00b874] hover:-translate-y-px transition-all shadow-[0_2px_8px_rgba(0,208,132,0.2)]">+ Add</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────── */
const TABS = ["friends", "leaderboard", "requests"];

const FriendsPage = () => {
  const [activeTab,   setActiveTab]   = useState("friends");
  const [pageLoading, setPageLoading] = useState(true);
  const [incoming,    setIncoming]    = useState([]);
  const [outgoing,    setOutgoing]    = useState([]);
  const [friends,     setFriends]     = useState([]);
  const [loadingId,   setLoadingId]   = useState(null);
  const [sentIds,     setSentIds]     = useState(new Set());

  const loggedUser = localStorage.getItem("username");

  useEffect(() => {
    Promise.all([loadIncoming(), loadOutgoing(), loadFriends()]).finally(() => setPageLoading(false));
  }, []);

  const loadIncoming = async () => {
    try { setIncoming((await getIncomingFriendRequests()) || []); } catch { setIncoming([]); }
  };
  const loadOutgoing = async () => {
    try { setOutgoing((await getSentFriendRequests()) || []); } catch { setOutgoing([]); }
  };
  const loadFriends = async () => {
    try {
      const raw = (await getAcceptedFriends()) || [];

      // Fetch full UserDto for each friend
      const builtFriends = await Promise.all(
        raw.map(async (f) => {
          const friendUsername = resolveFriendName(f, loggedUser);
          try {
            const userDto = await getFriendUser(friendUsername);
            return buildFriendObj(f, userDto, loggedUser);
          } catch {
            return buildFriendObj(f, null, loggedUser);
          }
        })
      );

      // Also fetch self and add to list so you appear in leaderboard
      let selfObj = null;
      try {
        const selfDto = await getFriendUser(loggedUser);
        selfObj = {
          id:       "self",
          name:     selfDto?.username    ?? loggedUser,
          avatar:   selfDto?.avatar      ?? null,
          lc:       selfDto?.leetCodeUsername ?? null,
          streak:   selfDto?.streak      ?? null,
          thisWeek: selfDto?.solvedInAWeek ?? null,
          solved:   selfDto?.totalProblems  ?? 0,
          easy:     selfDto?.easyProblems   ?? 0,
          medium:   selfDto?.mediumProblems ?? 0,
          hard:     selfDto?.hardProblems   ?? 0,
          isSelf:   true,
        };
      } catch { /* non-fatal */ }

      setFriends(selfObj ? [selfObj, ...builtFriends] : builtFriends);
    } catch { setFriends([]); }
  };

  const handleAccept = async (requestId) => {
    setLoadingId(requestId);
    await acceptFriendRequest(requestId);
    setIncoming(p => p.filter(r => r.id !== requestId));
    await loadFriends();
    setLoadingId(null);
  };
  const handleReject = async (requestId) => {
    setLoadingId(requestId);
    await rejectFriendRequest(requestId);
    setIncoming(p => p.filter(r => r.id !== requestId));
    setLoadingId(null);
  };
  const handleWithdraw = async (requestId) => {
    setLoadingId(requestId);
    await withdrawFriendRequest(requestId);
    setOutgoing(p => p.filter(r => r.id !== requestId));
    setLoadingId(null);
  };
  const handleRemove = async (friendId) => {
    setLoadingId(friendId);
    await removeFriend(friendId);
    setFriends(p => p.filter(f => f.id !== friendId));
    setLoadingId(null);
  };
  const handleAddFriend = useCallback(async (username) => {
    try { await friendRequest(loggedUser, username); setSentIds(prev => new Set([...prev, username])); } catch {}
  }, [loggedUser]);

  // friends is already an array of built card objects (no need to resolveFriend)
  const friendNames = friends.map(f => f.name);
  const leaderboard = [...friends].sort((a, b) =>
    (b.streak ?? -1) - (a.streak ?? -1) || (b.thisWeek ?? -1) - (a.thisWeek ?? -1)
  );
  const medalFor = (i) => ["🥇","🥈","🥉"][i] ?? null;

  return (
    <div className="min-h-screen bg-[#0b0d13] text-[#f0f2f8] py-8 px-6">
      <div className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />

      <div className="relative z-10 max-w-[960px] mx-auto">
        <div className="mb-7">
          <h1 className="text-2xl font-bold tracking-tight">Friends</h1>
          <p className="text-sm text-[#8890a8] mt-1">
            {friends.length} friends
            {incoming.length > 0 && <> · <span className="text-[#ef4743] font-medium">{incoming.length} pending request{incoming.length > 1 ? "s" : ""}</span></>}
          </p>
        </div>

        <div className="mb-8">
          <AddFriendBar friendNames={friendNames} onAddFriend={handleAddFriend} sentIds={sentIds} loggedUser={loggedUser} />
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-white/[0.08] mb-6">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`relative px-5 py-2.5 text-sm font-medium transition-all duration-200 ${activeTab === tab ? "text-[#f0f2f8]" : "text-[#50566a] hover:text-[#8890a8]"}`}>
              {tab === "requests" ? "Requests" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00d084] rounded-t-full" />}
              {tab === "requests" && incoming.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-[#ef4743] text-white text-[10px] font-bold rounded-full">{incoming.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ══ FRIENDS ══ */}
        {activeTab === "friends" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pageLoading
              ? [1,2,3,4].map(i => <SkeletonFriendCard key={i} />)
              : friends.length === 0
              ? <EmptyState icon="🤝" text="No friends yet" sub="Use the search bar above to find and add users!" />
              : friends.filter(f => !f.isSelf).map(f => (
                  <FriendCard key={f.id} friend={f} removing={loadingId === f.id} onRemove={() => handleRemove(f.id)} />
                ))
            }
          </div>
        )}

        {/* ══ LEADERBOARD ══ */}
        {activeTab === "leaderboard" && (
          <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
            <div className="grid grid-cols-[44px_1fr_70px_70px_70px_80px] gap-3 px-5 py-3 text-[10px] font-mono text-[#50566a] uppercase tracking-[0.1em] border-b border-white/[0.08] bg-[#0f1117]/60">
              <div>Rank</div><div>User</div>
              <div className="text-right">Solved</div>
              <div className="text-right">Hard</div>
              <div className="text-right">Week</div>
              <div className="text-right">Streak</div>
            </div>
            {pageLoading
              ? <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-white/[0.04] rounded-xl animate-pulse" />)}</div>
              : friends.length === 0
              ? <div className="flex flex-col items-center py-16 gap-3"><span className="text-4xl opacity-25">🏆</span><p className="text-[#8890a8] text-sm">Add friends to see the leaderboard</p></div>
              : leaderboard.map((u, i) => (
                  <div key={u.id} className={`grid grid-cols-[44px_1fr_70px_70px_70px_80px] gap-3 items-center px-5 py-3.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors ${i === 0 ? "bg-[#00d084]/[0.03]" : ""} ${u.isSelf ? "bg-[#3b82f6]/[0.03]" : ""}`}>
                    <div className="text-lg leading-none">{medalFor(i) ?? <span className="text-sm font-mono text-[#50566a]">#{i+1}</span>}</div>
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={u.avatar} name={u.name} size="xs" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Link to={u.isSelf ? "/profile/me" : `/profile/${u.name}`}>
                            <p className="text-sm font-semibold truncate hover:text-[#00d084] transition-colors text-[#c8ccd8]">{u.name}</p>
                          </Link>
                          {u.isSelf && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 flex-shrink-0">you</span>}
                        </div>
                        <p className="text-[11px] text-[#50566a] font-mono truncate">@{u.lc || u.name?.toLowerCase()}</p>
                      </div>
                    </div>
                    <div className="text-right font-mono text-sm text-[#00d084]">{u.solved ?? "—"}</div>
                    <div className="text-right font-mono text-sm text-[#ef4743]">{u.hard ?? "—"}</div>
                    <div className="text-right font-mono text-sm text-[#06b6d4]">{u.thisWeek ?? "—"}</div>
                    <div className="text-right font-mono text-sm text-[#3b82f6]">{u.streak != null ? `${u.streak}d` : "—"}</div>
                  </div>
                ))
            }
          </div>
        )}

        {/* ══ REQUESTS ══ */}
        {activeTab === "requests" && (
          <div className="space-y-6">

            {/* ── Incoming ── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-mono text-[#50566a] uppercase tracking-[0.12em]">Incoming</span>
                {incoming.length > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-[#ef4743] text-white text-[10px] font-bold rounded-full">{incoming.length}</span>
                )}
              </div>
              <div className="space-y-3">
                {pageLoading
                  ? [1,2].map(i => (
                      <div key={i} className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-4 animate-pulse flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/[0.07]" />
                        <div className="flex-1 space-y-2"><div className="h-4 bg-white/[0.07] rounded w-1/3" /><div className="h-3 bg-white/[0.04] rounded w-1/4" /></div>
                        <div className="flex gap-2"><div className="w-20 h-9 bg-white/[0.07] rounded-xl" /><div className="w-20 h-9 bg-white/[0.04] rounded-xl" /></div>
                      </div>
                    ))
                  : incoming.length === 0
                  ? (
                    <div className="flex items-center gap-3 px-4 py-3 bg-[#11131a] border border-white/[0.06] rounded-2xl">
                      <span className="text-2xl opacity-30">📭</span>
                      <p className="text-[#50566a] text-sm">No incoming requests</p>
                    </div>
                  )
                  : incoming.map(req => (
                      <div key={req.id} className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-4 hover:border-white/[0.14] transition-all shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
                        <div className="flex items-center gap-4">
                          <Avatar src={req.senderUser?.avatar} name={req.sender} size="md" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#f0f2f8]">{req.sender}</p>
                            <p className="text-xs text-[#50566a] font-mono">@{req.senderUser?.leetCodeUsername || req.sender}</p>
                            <p className="text-[11px] text-[#50566a] mt-1 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ffc01e] inline-block" />
                              Wants to be friends
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button disabled={loadingId === req.id} onClick={() => handleAccept(req.id)}
                              className="px-4 py-2 rounded-xl text-sm font-semibold text-black bg-gradient-to-r from-[#00d084] to-[#00b874] hover:-translate-y-px transition-all shadow-[0_4px_12px_rgba(0,208,132,0.2)] disabled:opacity-50">
                              {loadingId === req.id ? "…" : "Accept"}
                            </button>
                            <button disabled={loadingId === req.id} onClick={() => handleReject(req.id)}
                              className="px-4 py-2 rounded-xl text-sm font-medium bg-[#ef4743]/10 border border-[#ef4743]/20 text-[#ef4743] hover:bg-[#ef4743]/20 transition-all disabled:opacity-50">
                              {loadingId === req.id ? "…" : "Decline"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                }
              </div>
            </div>

            {/* ── Sent ── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-mono text-[#50566a] uppercase tracking-[0.12em]">Sent</span>
                {outgoing.length > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-[#3b82f6] text-white text-[10px] font-bold rounded-full">{outgoing.length}</span>
                )}
              </div>
              <div className="space-y-3">
                {pageLoading
                  ? [1].map(i => (
                      <div key={i} className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-4 animate-pulse flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/[0.07]" />
                        <div className="flex-1 space-y-2"><div className="h-4 bg-white/[0.07] rounded w-1/3" /><div className="h-3 bg-white/[0.04] rounded w-1/4" /></div>
                        <div className="w-24 h-9 bg-white/[0.05] rounded-xl" />
                      </div>
                    ))
                  : outgoing.length === 0
                  ? (
                    <div className="flex items-center gap-3 px-4 py-3 bg-[#11131a] border border-white/[0.06] rounded-2xl">
                      <span className="text-2xl opacity-30">📤</span>
                      <p className="text-[#50566a] text-sm">No sent requests</p>
                    </div>
                  )
                  : outgoing.map(req => (
                      <div key={req.id} className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-4 hover:border-white/[0.14] transition-all shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
                        <div className="flex items-center gap-4">
                          <Avatar src={req.receiverUser?.avatar} name={req.receiver} size="md" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#f0f2f8]">{req.receiver}</p>
                            <p className="text-xs text-[#50566a] font-mono">@{req.receiverUser?.leetCodeUsername || req.receiver}</p>
                            <p className="text-[11px] mt-1 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] inline-block" />
                              <span className="text-[#3b82f6]">Request sent · pending</span>
                            </p>
                          </div>
                          <button disabled={loadingId === req.id} onClick={() => handleWithdraw(req.id)}
                            className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium bg-[#161820] border border-white/[0.08] text-[#8890a8] hover:border-[#ef4743]/40 hover:text-[#ef4743] transition-all disabled:opacity-50">
                            {loadingId === req.id ? "…" : "Withdraw"}
                          </button>
                        </div>
                      </div>
                    ))
                }
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;