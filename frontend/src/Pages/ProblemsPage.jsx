import { useEffect, useMemo, useState } from "react";
import {
  getSolvedQuestion,
  getAcceptedFriends,
} from "../api/axiosClient";

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
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

const diffBadge = {
  easy:   { text: "text-[#00d084]", bg: "bg-[#00d084]/10", border: "border-[#00d084]/20", dot: "bg-[#00d084]", label: "Easy"   },
  medium: { text: "text-[#ffc01e]", bg: "bg-[#ffc01e]/10", border: "border-[#ffc01e]/20", dot: "bg-[#ffc01e]", label: "Medium" },
  hard:   { text: "text-[#ef4743]", bg: "bg-[#ef4743]/10", border: "border-[#ef4743]/20", dot: "bg-[#ef4743]", label: "Hard"   },
};

const DIFFS = ["all", "easy", "medium", "hard"];

/* ─────────────────────────────────────────────
   Friend chip for left panel
───────────────────────────────────────────── */
const FriendChip = ({ name, avatar, lc, isSelected, onClick, solved }) => {
  const initial = (name || "U")[0].toUpperCase();
  return (
    <button onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left
        transition-all duration-150 group
        ${isSelected
          ? "bg-[#00d084]/10 border border-[#00d084]/25 text-[#00d084]"
          : "border border-transparent text-[#8890a8] hover:text-[#f0f2f8] hover:bg-white/[0.04]"
        }
      `}
    >
      <div className={`w-8 h-8 rounded-xl flex-shrink-0 bg-gradient-to-br ${avatarGrad(initial)} flex items-center justify-center text-xs font-bold text-white overflow-hidden`}>
        {avatar ? <img src={avatar} alt={name} className="w-full h-full object-cover" /> : initial}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate leading-tight">{name}</p>
        <p className="text-[10px] font-mono text-[#50566a] truncate">
          {solved != null ? `${solved} solved` : `@${lc || name?.toLowerCase()}`}
        </p>
      </div>
      {isSelected && (
        <div className="w-1.5 h-1.5 rounded-full bg-[#00d084] flex-shrink-0" />
      )}
    </button>
  );
};

/* ─────────────────────────────────────────────
   Skeleton rows
───────────────────────────────────────────── */
const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-5 py-3.5 border-b border-white/[0.04] animate-pulse">
    <div className="w-10 h-3 bg-white/[0.07] rounded flex-shrink-0" />
    <div className="flex-1 h-3 bg-white/[0.07] rounded" />
    <div className="w-16 h-5 bg-white/[0.05] rounded-md flex-shrink-0" />
    <div className="w-24 h-3 bg-white/[0.04] rounded flex-shrink-0" />
  </div>
);

/* ─────────────────────────────────────────────
   Problem row
───────────────────────────────────────────── */
const ProblemRow = ({ question, idx, solvedByMe, solvedByFriend }) => {
  const diff  = question.difficulty?.toLowerCase();
  const badge = diffBadge[diff];

  const openProblem = () => {
    if (!question.slug) return;
    window.open(`https://leetcode.com/problems/${question.slug}/description/`, "_blank", "noopener,noreferrer");
  };

  return (
    <div onClick={openProblem}
      className="grid grid-cols-[44px_1fr_88px_44px_44px] gap-3 items-center px-5 py-3 border-b border-white/[0.04] hover:bg-white/[0.025] cursor-pointer transition-colors group">

      {/* # */}
      <span className="text-xs font-mono text-[#30354a] group-hover:text-[#50566a] transition-colors">
        {question.frontendId ?? idx + 1}
      </span>

      {/* Title */}
      <span className="text-sm text-[#c8ccd8] group-hover:text-[#00d084] transition-colors font-medium truncate">
        {question.title}
      </span>

      {/* Difficulty */}
      <div>
        {badge ? (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-mono font-semibold ${badge.text} ${badge.bg} ${badge.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
            {badge.label}
          </span>
        ) : <span className="text-xs text-[#30354a]">—</span>}
      </div>

      {/* Me solved? */}
      <div className="flex justify-center">
        {solvedByMe
          ? <span title="You solved this" className="w-5 h-5 rounded-full bg-[#00d084]/15 flex items-center justify-center">
              <svg className="w-3 h-3 text-[#00d084]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          : <span className="w-1.5 h-1.5 rounded-full bg-white/[0.08]" />
        }
      </div>

      {/* Friend solved? */}
      <div className="flex justify-center">
        {solvedByFriend
          ? <span title="Friend solved this" className="w-5 h-5 rounded-full bg-[#3b82f6]/15 flex items-center justify-center">
              <svg className="w-3 h-3 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          : <span className="w-1.5 h-1.5 rounded-full bg-white/[0.08]" />
        }
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main ProblemsPage
───────────────────────────────────────────── */
const ProblemsPage = () => {
  const [myProblems,     setMyProblems]     = useState([]);
  const [friends,        setFriends]        = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null); // { name, avatar, lc }
  const [friendProblems, setFriendProblems] = useState([]);
  const [loadingMine,    setLoadingMine]    = useState(true);
  const [loadingFriend,  setLoadingFriend]  = useState(false);
  const [search,         setSearch]         = useState("");
  const [diff,           setDiff]           = useState("all");
  const [view,           setView]           = useState("all"); // all | mine | friend | common

  const loggedUser = localStorage.getItem("username");

  /* load my problems + friends */
  useEffect(() => {
    getSolvedQuestion(loggedUser)
      .then(d => setMyProblems(d || []))
      .catch(() => setMyProblems([]))
      .finally(() => setLoadingMine(false));

    getAcceptedFriends()
      .then(d => setFriends(d || [])  )
      .catch(() => setFriends([]));
  }, []);

  /* resolve friend name */
  const resolveFriend = (f) =>
    loggedUser === f.sender
      ? { name: f.receiver, avatar: f.receiverAvatar, lc: f.receiverLeetCodeUsername }
      : { name: f.sender,   avatar: f.senderAvatar,   lc: f.SenderLeetCodeUsername   };

  const friendList = friends.map(resolveFriend);

  /* load friend's problems when selected */
  const handleSelectFriend = async (friend) => {
    if (selectedFriend?.name === friend.name) {
      setSelectedFriend(null);
      setFriendProblems([]);
      setView("all");
      return;
    }
    setSelectedFriend(friend);
    setLoadingFriend(true);
    setView("all");
    try {
      const data = await getSolvedQuestion(friend.name);
      setFriendProblems(data || []);
    } catch { setFriendProblems([]); }
    finally { setLoadingFriend(false); }
  };

  /* slug sets for O(1) lookup */
  const mySlugs     = useMemo(() => new Set(myProblems.map(p => p.slug)),     [myProblems]);
  const friendSlugs = useMemo(() => new Set(friendProblems.map(p => p.slug)), [friendProblems]);

  /* combined unique problem list */
  const allProblems = useMemo(() => {
    const map = new Map();
    [...myProblems, ...friendProblems].forEach(p => { if (!map.has(p.slug)) map.set(p.slug, p); });
    return [...map.values()];
  }, [myProblems, friendProblems]);

  /* apply view + diff + search filter */
  const displayProblems = useMemo(() => {
    let list = allProblems;
    if (view === "mine")   list = list.filter(p => mySlugs.has(p.slug));
    if (view === "friend") list = list.filter(p => friendSlugs.has(p.slug));
    if (view === "common") list = list.filter(p => mySlugs.has(p.slug) && friendSlugs.has(p.slug));
    if (diff !== "all")    list = list.filter(p => p.difficulty?.toLowerCase() === diff);
    if (search.trim())     list = list.filter(p =>
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.slug?.toLowerCase().includes(search.toLowerCase())
    );
    return list;
  }, [allProblems, view, diff, search, mySlugs, friendSlugs]);

  const commonCount = useMemo(
    () => allProblems.filter(p => mySlugs.has(p.slug) && friendSlugs.has(p.slug)).length,
    [allProblems, mySlugs, friendSlugs]
  );

  const loading = loadingMine || loadingFriend;

  return (
    <div className="min-h-screen bg-[#0b0d13] text-[#f0f2f8] flex">

      {/* grid texture */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />

      {/* ── LEFT: friends panel ── */}
      <aside className="relative z-10 w-[220px] flex-shrink-0 border-r border-white/[0.07] flex flex-col py-6 px-3 h-screen sticky top-0 overflow-y-auto no-scrollbar">

        {/* "You" entry */}
        <p className="text-[10px] font-mono text-[#30354a] tracking-[0.15em] uppercase px-3 mb-2">YOU</p>
        <button
          onClick={() => { setSelectedFriend(null); setFriendProblems([]); setView("all"); }}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left mb-4
            transition-all duration-150
            ${!selectedFriend
              ? "bg-[#00d084]/10 border border-[#00d084]/25 text-[#00d084]"
              : "border border-transparent text-[#8890a8] hover:text-[#f0f2f8] hover:bg-white/[0.04]"
            }
          `}
        >
          <div className={`w-8 h-8 rounded-xl flex-shrink-0 bg-gradient-to-br ${avatarGrad((loggedUser||"U")[0])} flex items-center justify-center text-xs font-bold text-white`}>
            {(loggedUser||"U")[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{loggedUser}</p>
            <p className="text-[10px] font-mono text-[#50566a]">{myProblems.length} solved</p>
          </div>
          {!selectedFriend && <div className="w-1.5 h-1.5 rounded-full bg-[#00d084] flex-shrink-0" />}
        </button>

        {/* Friends */}
        <p className="text-[10px] font-mono text-[#30354a] tracking-[0.15em] uppercase px-3 mb-2">FRIENDS</p>

        {friendList.length === 0 ? (
          <div className="px-3 py-4 text-xs text-[#50566a] font-mono text-center">
            No friends yet
          </div>
        ) : (
          <div className="space-y-0.5">
            {friendList.map(f => (
              <FriendChip
                key={f.name}
                name={f.name}
                avatar={f.avatar}
                lc={f.lc}
                isSelected={selectedFriend?.name === f.name}
                solved={selectedFriend?.name === f.name ? friendProblems.length : null}
                onClick={() => handleSelectFriend(f)}
              />
            ))}
          </div>
        )}
      </aside>

      {/* ── RIGHT: problems explorer ── */}
      <div className="relative z-10 flex-1 min-w-0 py-7 px-6">

        {/* Header */}
        <div className="mb-6">
          <p className="text-[11px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-1">EXPLORER</p>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {selectedFriend ? (
                  <>
                    <span className="text-[#f0f2f8]">You</span>
                    <span className="text-[#50566a] mx-2 font-normal">vs</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-[#a855f7]">
                      {selectedFriend.name}
                    </span>
                  </>
                ) : (
                  <span className="text-[#f0f2f8]">Problems</span>
                )}
              </h1>
              <p className="text-sm text-[#50566a] mt-1">
                {selectedFriend
                  ? `${commonCount} problems in common · ${myProblems.length} yours · ${friendProblems.length} theirs`
                  : `${myProblems.length} problems solved`
                }
              </p>
            </div>

            {/* view toggle — only when a friend is selected */}
            {selectedFriend && (
              <div className="flex gap-1 bg-[#11131a] border border-white/[0.08] rounded-xl p-1 flex-shrink-0">
                {[
                  { id: "all",    label: "All"     },
                  { id: "mine",   label: "Mine"    },
                  { id: "friend", label: "Theirs"  },
                  { id: "common", label: "Common"  },
                ].map(({ id, label }) => (
                  <button key={id} onClick={() => setView(id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                      view === id
                        ? "bg-[#161820] text-[#f0f2f8] border border-white/[0.1] shadow-sm"
                        : "text-[#50566a] hover:text-[#8890a8]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* stat pills when comparing */}
          {selectedFriend && !loadingFriend && (
            <div className="flex gap-3 mt-4 flex-wrap">
              {[
                { label: "You solved",          value: myProblems.length,     color: "text-[#00d084]", bg: "bg-[#00d084]/10",  border: "border-[#00d084]/20"  },
                { label: `${selectedFriend.name} solved`, value: friendProblems.length, color: "text-[#3b82f6]", bg: "bg-[#3b82f6]/10", border: "border-[#3b82f6]/20"  },
                { label: "In common",           value: commonCount,           color: "text-[#a855f7]", bg: "bg-[#a855f7]/10",  border: "border-[#a855f7]/20"  },
                { label: "Only you",            value: myProblems.filter(p => !friendSlugs.has(p.slug)).length, color: "text-[#ffc01e]", bg: "bg-[#ffc01e]/10", border: "border-[#ffc01e]/20" },
              ].map(({ label, value, color, bg, border }) => (
                <div key={label} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${bg} border ${border}`}>
                  <span className={`text-lg font-bold font-mono ${color}`}>{value}</span>
                  <span className="text-xs text-[#8890a8]">{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)]">

          {/* search + filter bar */}
          <div className="px-5 py-3.5 border-b border-white/[0.06] bg-[#0f1117]/40 flex items-center gap-3 flex-wrap">
            {/* search */}
            <div className="relative flex items-center flex-1 min-w-[160px]">
              <svg className="absolute left-3 w-3.5 h-3.5 text-[#50566a] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by title or slug…"
                className="w-full bg-[#161820] border border-white/[0.07] rounded-xl pl-9 pr-8 py-2 text-sm text-[#f0f2f8] placeholder-[#50566a] focus:outline-none focus:border-[#00d084]/40 focus:ring-2 focus:ring-[#00d084]/10 transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 text-[#50566a] hover:text-[#8890a8] transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* diff chips */}
            <div className="flex gap-1.5 flex-shrink-0">
              {DIFFS.map(d => (
                <button key={d} onClick={() => setDiff(d)}
                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono font-semibold uppercase tracking-wider transition-all ${
                    diff === d
                      ? d === "easy"   ? "bg-[#00d084]/10 text-[#00d084] border-[#00d084]/25"
                      : d === "medium" ? "bg-[#ffc01e]/10 text-[#ffc01e] border-[#ffc01e]/25"
                      : d === "hard"   ? "bg-[#ef4743]/10 text-[#ef4743] border-[#ef4743]/25"
                      :                  "bg-[#00d084]/10 text-[#00d084] border-[#00d084]/25"
                      : "bg-transparent border-white/[0.07] text-[#50566a] hover:text-[#8890a8] hover:border-white/[0.12]"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* count badge */}
            <span className="text-xs font-mono text-[#50566a] flex-shrink-0">
              {loading ? "…" : `${displayProblems.length} shown`}
            </span>
          </div>

          {/* Table header */}
          <div className={`grid ${selectedFriend ? "grid-cols-[44px_1fr_88px_44px_44px]" : "grid-cols-[44px_1fr_88px]"} gap-3 px-5 py-2.5 text-[10px] text-[#50566a] font-mono tracking-[0.1em] uppercase border-b border-white/[0.06] bg-[#0d0f16]/60 sticky top-0 z-10`}>
            <div>#</div>
            <div>Title</div>
            <div>Difficulty</div>
            {selectedFriend && (
              <>
                <div className="text-center text-[#00d084]" title="You solved">You</div>
                <div className="text-center text-[#3b82f6]" title="Friend solved">{selectedFriend.name.split(" ")[0]}</div>
              </>
            )}
          </div>

          {/* Rows */}
          <div className="h-[calc(100vh-340px)] overflow-y-auto no-scrollbar">
            {loading
              ? Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)
              : displayProblems.length === 0
              ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <div className="text-4xl opacity-25">🔍</div>
                  <p className="text-sm text-[#50566a] font-mono">
                    {search ? `No results for "${search}"` : "No problems found"}
                  </p>
                  {(search || diff !== "all") && (
                    <button onClick={() => { setSearch(""); setDiff("all"); }}
                      className="text-xs text-[#00d084] hover:underline">
                      Clear filters
                    </button>
                  )}
                </div>
              )
              : displayProblems.map((q, i) => (
                  selectedFriend ? (
                    <ProblemRow
                      key={q.slug}
                      question={q}
                      idx={i}
                      solvedByMe={mySlugs.has(q.slug)}
                      solvedByFriend={friendSlugs.has(q.slug)}
                    />
                  ) : (
                    /* plain row when no friend selected */
                    <div key={q.slug}
                      onClick={() => window.open(`https://leetcode.com/problems/${q.slug}/description/`, "_blank", "noopener,noreferrer")}
                      className="grid grid-cols-[44px_1fr_88px] gap-3 items-center px-5 py-3 border-b border-white/[0.04] hover:bg-white/[0.025] cursor-pointer transition-colors group"
                    >
                      <span className="text-xs font-mono text-[#30354a] group-hover:text-[#50566a]">{q.frontendId ?? i+1}</span>
                      <span className="text-sm font-medium text-[#c8ccd8] group-hover:text-[#00d084] transition-colors truncate">{q.title}</span>
                      <div>
                        {diffBadge[q.difficulty?.toLowerCase()] ? (
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-mono font-semibold
                            ${diffBadge[q.difficulty?.toLowerCase()].text}
                            ${diffBadge[q.difficulty?.toLowerCase()].bg}
                            ${diffBadge[q.difficulty?.toLowerCase()].border}`}>
                            {diffBadge[q.difficulty?.toLowerCase()].label}
                          </span>
                        ) : <span className="text-xs text-[#30354a]">—</span>}
                      </div>
                    </div>
                  )
                ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemsPage;
