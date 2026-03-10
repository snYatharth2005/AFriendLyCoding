import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";

/* ═══════════════════════════════════════════════════════════════
   ██████╗  █████╗ ████████╗ █████╗
   ██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗
   ██║  ██║███████║   ██║   ███████║
   ██║  ██║██╔══██║   ██║   ██╔══██║
   ██████╔╝██║  ██║   ██║   ██║  ██║
   ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝

   🔌 HOW TO MAKE THIS DYNAMIC — FUTURE DEV GUIDE
   ═══════════════════════════════════════════════
   All static values are clearly marked with // 🔌 DYNAMIC: ...
   They are isolated in STATIC_DATA below.

   When your backend is ready, replace the static loaders
   at the bottom of STATIC_DATA with real API calls:

   import { getUserProfile, getUserSolvedQuestions } from "../api/axiosClient";

   Then in loadCompare():
     const [p1, p2] = await Promise.all([
       getUserProfile(user1),
       getUserProfile(user2),
     ]);
     const [s1, s2] = await Promise.all([
       getUserSolvedQuestions(user1),
       getUserSolvedQuestions(user2),
     ]);

   Map the API shape to the shape used below (user.total, user.easy, etc.)
   That's the ONLY change needed — no UI changes required.
   ═══════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────
   STATIC DATA — replace these loaders with API calls
───────────────────────────────────────────── */
const STATIC_USERS = {
  alexchen: {
    username: "alexchen",
    realName: "Alex Chen",
    avatar:   null,
    total:    347,
    easy:     189,
    medium:   110,
    hard:      48,
    streak:    23,
    rank:    1240,
    topics: [                          // 🔌 DYNAMIC: from /api/user/:u/topics
      { label: "Array",   you: 92, pct: 92 },
      { label: "DP",      you: 78, pct: 78 },
      { label: "Tree",    you: 71, pct: 71 },
      { label: "Graph",   you: 55, pct: 55 },
      { label: "String",  you: 63, pct: 63 },
      { label: "Hash",    you: 68, pct: 68 },
    ],
    solvedSlugs: new Set([             // 🔌 DYNAMIC: build from getUserSolvedQuestions()
      "two-sum","valid-parentheses","maximum-subarray",
      "best-time-to-buy-and-sell-stock","number-of-islands",
      "climbing-stairs","reverse-linked-list","binary-search",
      "merge-two-sorted-lists","linked-list-cycle",
    ]),
  },
  sarahkim: {
    username: "sarahkim",
    realName: "Sarah Kim",
    avatar:   null,
    total:    312,
    easy:     178,
    medium:    93,
    hard:      41,
    streak:    17,
    rank:    1580,
    topics: [
      { label: "Array",   you: 78, pct: 78 },
      { label: "DP",      you: 70, pct: 70 },
      { label: "Tree",    you: 65, pct: 65 },
      { label: "Graph",   you: 40, pct: 40 },
      { label: "String",  you: 69, pct: 69 },
      { label: "Hash",    you: 71, pct: 71 },
    ],
    solvedSlugs: new Set([
      "two-sum","valid-parentheses","maximum-subarray",
      "best-time-to-buy-and-sell-stock","number-of-islands",
      "climbing-stairs","reverse-linked-list","binary-search",
      "longest-substring-without-repeating-characters","roman-to-integer",
    ]),
  },
};

// 🔌 DYNAMIC: replace with getSolvedQuestion() or a global problem list endpoint
const STATIC_PROBLEMS = [
  { frontendId:   1, slug: "two-sum",                                    title: "Two Sum",                              difficulty: "easy",   topic: "Array"  },
  { frontendId:  20, slug: "valid-parentheses",                          title: "Valid Parentheses",                    difficulty: "easy",   topic: "Stack"  },
  { frontendId:  53, slug: "maximum-subarray",                           title: "Maximum Subarray",                     difficulty: "medium", topic: "DP"     },
  { frontendId: 121, slug: "best-time-to-buy-and-sell-stock",            title: "Best Time to Buy and Sell Stock",      difficulty: "easy",   topic: "Array"  },
  { frontendId: 200, slug: "number-of-islands",                          title: "Number of Islands",                    difficulty: "medium", topic: "Graph"  },
  { frontendId:  70, slug: "climbing-stairs",                            title: "Climbing Stairs",                      difficulty: "easy",   topic: "DP"     },
  { frontendId: 206, slug: "reverse-linked-list",                        title: "Reverse Linked List",                  difficulty: "easy",   topic: "Linked List" },
  { frontendId: 704, slug: "binary-search",                              title: "Binary Search",                        difficulty: "easy",   topic: "Binary Search" },
  { frontendId:  21, slug: "merge-two-sorted-lists",                     title: "Merge Two Sorted Lists",               difficulty: "easy",   topic: "Linked List" },
  { frontendId: 141, slug: "linked-list-cycle",                          title: "Linked List Cycle",                    difficulty: "easy",   topic: "Linked List" },
  { frontendId:   3, slug: "longest-substring-without-repeating-characters", title: "Longest Substring Without Repeating", difficulty: "medium", topic: "String" },
  { frontendId:  13, slug: "roman-to-integer",                           title: "Roman to Integer",                     difficulty: "easy",   topic: "Hash"   },
];

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const avatarGrad = (letter = "A") => {
  const g = [
    ["#00d084","#06b6d4"],
    ["#a855f7","#6366f1"],
    ["#f59e0b","#ef4743"],
    ["#ec4899","#a855f7"],
    ["#06b6d4","#3b82f6"],
  ];
  const [a,b] = g[(letter.charCodeAt(0) || 65) % g.length];
  return `linear-gradient(135deg,${a},${b})`;
};

const diffBadge = {
  easy:   { label: "EASY",   textCls: "text-[#00d084]", bgCls: "bg-[#00d084]/10 border-[#00d084]/20", dot: "bg-[#00d084]" },
  medium: { label: "MEDIUM", textCls: "text-[#ffc01e]", bgCls: "bg-[#ffc01e]/10 border-[#ffc01e]/20", dot: "bg-[#ffc01e]" },
  hard:   { label: "HARD",   textCls: "text-[#ef4743]", bgCls: "bg-[#ef4743]/10 border-[#ef4743]/20", dot: "bg-[#ef4743]" },
};

/* ─────────────────────────────────────────────
   Radar SVG (6-axis spider chart, pure SVG)
───────────────────────────────────────────── */
const cx = 140, cy = 140, R = 100;
const axes = 6;
const angle = (i) => (Math.PI * 2 * i) / axes - Math.PI / 2;
const radarPt = (i, pct) => {
  const r = (pct / 100) * R;
  return [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))];
};
const gridPts = (scale) =>
  Array.from({ length: axes }, (_, i) => radarPt(i, scale)).map(([x,y]) => `${x},${y}`).join(" ");
const dataPts = (topics) =>
  topics.map((t, i) => radarPt(i, t.pct)).map(([x,y]) => `${x},${y}`).join(" ");
const labelPos = (i) => {
  const [x,y] = radarPt(i, 118);
  return { x, y };
};

const RadarChart = ({ u1, u2 }) => (
  <div className="flex flex-col lg:flex-row items-center gap-8">
    <svg width="280" height="280" viewBox="0 0 280 280" className="flex-shrink-0">
      {/* Grid rings */}
      {[25,50,75,100].map(s => (
        <polygon key={s} points={gridPts(s)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}
      {/* Axes */}
      {Array.from({length: axes}, (_,i) => {
        const [x,y] = radarPt(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
      })}
      {/* User 1 — green */}
      <polygon points={dataPts(u1.topics)} fill="rgba(0,208,132,0.15)" stroke="#00d084" strokeWidth="2" />
      {u1.topics.map((t,i) => {
        const [x,y] = radarPt(i, t.pct);
        return <circle key={i} cx={x} cy={y} r="3.5" fill="#00d084" />;
      })}
      {/* User 2 — blue dashed */}
      <polygon points={dataPts(u2.topics)} fill="rgba(59,130,246,0.12)" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,3" />
      {u2.topics.map((t,i) => {
        const [x,y] = radarPt(i, t.pct);
        return <circle key={i} cx={x} cy={y} r="3" fill="#3b82f6" />;
      })}
      {/* Labels */}
      {u1.topics.map((t,i) => {
        const {x,y} = labelPos(i);
        const anchor = x < cx - 5 ? "end" : x > cx + 5 ? "start" : "middle";
        return (
          <text key={i} x={x} y={y} textAnchor={anchor} fill="#8890a8" fontSize="11" fontFamily="DM Sans, sans-serif" dy="4">
            {t.label}
          </text>
        );
      })}
    </svg>

    {/* Legend + lead summary */}
    <div className="space-y-3 min-w-[180px]">
      <div className="flex items-center gap-2.5 text-sm">
        <div className="w-7 h-0.5 bg-[#00d084] rounded-full flex-shrink-0" />
        <span className="text-[#c8ccd8]">{u1.realName}</span>
      </div>
      <div className="flex items-center gap-2.5 text-sm">
        <div className="w-7 h-0.5 flex-shrink-0"
          style={{ background: "repeating-linear-gradient(90deg,#3b82f6 0,#3b82f6 5px,transparent 5px,transparent 9px)" }} />
        <span className="text-[#c8ccd8]">{u2.realName}</span>
      </div>

      {/* who leads where */}
      <div className="mt-4 bg-[#161820] border border-white/[0.06] rounded-xl p-3 space-y-2.5">
        {(() => {
          const u1Leads = u1.topics.filter((t,i) => t.pct > u2.topics[i].pct);
          const u2Leads = u2.topics.filter((t,i) => t.pct > u1.topics[i].pct);
          return (
            <>
              {u1Leads.length > 0 && (
                <div>
                  <p className="text-[10px] font-mono text-[#50566a] uppercase tracking-wider mb-1">{u1.realName} leads</p>
                  <p className="text-xs text-[#00d084]">
                    {u1Leads.map((t,i) => {
                      const idx = u1.topics.indexOf(t);
                      const diff = t.pct - u2.topics[idx].pct;
                      return `${t.label} (+${diff})`;
                    }).join(" · ")}
                  </p>
                </div>
              )}
              {u2Leads.length > 0 && (
                <div>
                  <p className="text-[10px] font-mono text-[#50566a] uppercase tracking-wider mb-1">{u2.realName} leads</p>
                  <p className="text-xs text-[#3b82f6]">
                    {u2Leads.map((t,i) => {
                      const idx = u2.topics.indexOf(t);
                      const diff = t.pct - u1.topics[idx].pct;
                      return `${t.label} (+${diff})`;
                    }).join(" · ")}
                  </p>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Stat mini-box
───────────────────────────────────────────── */
const StatBox = ({ value, label, color = "text-[#f0f2f8]" }) => (
  <div className="bg-[#0f1117] rounded-xl p-3 text-center border border-white/[0.04]">
    <div className={`text-xl font-bold font-mono ${color}`}>{value}</div>
    <div className="text-[10px] text-[#50566a] mt-0.5 uppercase tracking-wider font-mono">{label}</div>
  </div>
);

/* ─────────────────────────────────────────────
   Win indicator
───────────────────────────────────────────── */
const WinBadge = ({ winner }) =>
  winner === 0
    ? <span className="text-[10px] font-mono text-[#ffc01e] bg-[#ffc01e]/10 border border-[#ffc01e]/20 px-2 py-0.5 rounded-full">TIE</span>
    : winner === 1
    ? <span className="text-[10px] font-mono text-[#00d084] bg-[#00d084]/10 border border-[#00d084]/20 px-2 py-0.5 rounded-full">↑ leads</span>
    : <span className="text-[10px] font-mono text-[#3b82f6] bg-[#3b82f6]/10 border border-[#3b82f6]/20 px-2 py-0.5 rounded-full">↑ leads</span>;

/* ─────────────────────────────────────────────
   Head-to-head bar comparison row
───────────────────────────────────────────── */
const H2HRow = ({ label, v1, v2, color1 = "#00d084", color2 = "#3b82f6" }) => {
  const max = Math.max(v1, v2, 1);
  const winner = v1 > v2 ? 1 : v2 > v1 ? 2 : 0;
  return (
    <div className="grid grid-cols-[1fr_80px_1fr] gap-3 items-center py-2.5 border-b border-white/[0.04] last:border-0">
      {/* user 1 bar */}
      <div className="flex items-center gap-2 justify-end">
        <span className={`text-sm font-bold font-mono ${winner === 1 ? "" : "text-[#8890a8]"}`} style={winner===1?{color:color1}:{}}>{v1}</span>
        <div className="w-24 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
          <div className="h-full rounded-full ml-auto" style={{ width:`${(v1/max)*100}%`, background: color1, marginLeft:"auto", float:"right" }} />
        </div>
      </div>
      {/* label */}
      <div className="text-center">
        <div className="text-[10px] font-mono text-[#50566a] uppercase tracking-wider">{label}</div>
        <div className="mt-1"><WinBadge winner={winner} /></div>
      </div>
      {/* user 2 bar */}
      <div className="flex items-center gap-2">
        <div className="w-24 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width:`${(v2/max)*100}%`, background: color2 }} />
        </div>
        <span className={`text-sm font-bold font-mono ${winner === 2 ? "" : "text-[#8890a8]"}`} style={winner===2?{color:color2}:{}}>{v2}</span>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Problem row in overlap table
───────────────────────────────────────────── */
const ProbRow = ({ p, u1Solved, u2Solved }) => {
  const d = p.difficulty?.toLowerCase();
  const b = diffBadge[d];
  return (
    <div
      onClick={() => window.open(`https://leetcode.com/problems/${p.slug}/description/`, "_blank", "noopener,noreferrer")}
      className="grid grid-cols-[40px_1fr_90px_90px_44px_44px] gap-3 items-center px-5 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.025] cursor-pointer transition-colors group"
    >
      <span className="text-xs font-mono text-[#30354a] group-hover:text-[#50566a]">{p.frontendId}</span>
      <span className="text-sm font-medium text-[#c8ccd8] group-hover:text-[#00d084] transition-colors truncate">{p.title}</span>
      {b
        ? <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-mono font-semibold ${b.textCls} ${b.bgCls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${b.dot}`} />{b.label}
          </span>
        : <span className="text-xs text-[#30354a]">—</span>
      }
      <span className="text-xs font-mono text-[#50566a] bg-[#0f1117] px-2 py-0.5 rounded-lg border border-white/[0.04] truncate">{p.topic || "—"}</span>
      {/* u1 checkmark */}
      <div className="flex justify-center">
        {u1Solved
          ? <span className="w-5 h-5 rounded-full bg-[#00d084]/15 flex items-center justify-center">
              <svg className="w-3 h-3 text-[#00d084]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          : <span className="w-1.5 h-1.5 rounded-full bg-white/[0.07] mt-2" />
        }
      </div>
      {/* u2 checkmark */}
      <div className="flex justify-center">
        {u2Solved
          ? <span className="w-5 h-5 rounded-full bg-[#3b82f6]/15 flex items-center justify-center">
              <svg className="w-3 h-3 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          : <span className="w-1.5 h-1.5 rounded-full bg-white/[0.07] mt-2" />
        }
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN COMPARE PAGE
───────────────────────────────────────────── */
const ComparePage = () => {
  /* 🔌 DYNAMIC: in future, pull :username from URL params via useParams()
     and load the second user from your friends list or a search input.
     const { username } = useParams();   ← the friend being compared
  */
  const loggedUser = localStorage.getItem("username") || "alexchen";

  const [input1, setInput1]   = useState(loggedUser);
  const [input2, setInput2]   = useState("sarahkim");
  const [u1, setU1]           = useState(null);
  const [u2, setU2]           = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [probTab, setProbTab] = useState("common"); // common | u1only | u2only | all

  /* ── LOAD function — swap this body for real API calls ── */
  const loadCompare = async (a, b) => {
    setLoading(true);
    setError("");
    try {
      await new Promise(r => setTimeout(r, 600)); // 🔌 DYNAMIC: remove this fake delay

      /* 🔌 DYNAMIC: replace the two lines below with:
           const [p1, p2] = await Promise.all([getUserProfile(a), getUserProfile(b)]);
           const [s1, s2] = await Promise.all([getUserSolvedQuestions(a), getUserSolvedQuestions(b)]);
           Then build the same shape as STATIC_USERS from p1/p2/s1/s2.
      */
      const p1 = STATIC_USERS[a.toLowerCase()];
      const p2 = STATIC_USERS[b.toLowerCase()];

      if (!p1 || !p2) { setError("User not found. Try: alexchen or sarahkim"); return; }

      setU1(p1);
      setU2(p2);

      /* 🔌 DYNAMIC: replace STATIC_PROBLEMS with a real problem list
           const allProblems = [...s1, ...s2]  (deduplicated by slug)
      */
      setProblems(STATIC_PROBLEMS);
    } catch {
      setError("Failed to load comparison. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCompare("alexchen", "sarahkim"); }, []);

  /* derived sets */
  const commonSlugs = useMemo(() => {
    if (!u1 || !u2) return new Set();
    return new Set([...u1.solvedSlugs].filter(s => u2.solvedSlugs.has(s)));
  }, [u1, u2]);

  const displayProbs = useMemo(() => {
    if (!u1 || !u2) return [];
    return problems.filter(p => {
      if (probTab === "common") return u1.solvedSlugs.has(p.slug) && u2.solvedSlugs.has(p.slug);
      if (probTab === "u1only") return u1.solvedSlugs.has(p.slug) && !u2.solvedSlugs.has(p.slug);
      if (probTab === "u2only") return !u1.solvedSlugs.has(p.slug) && u2.solvedSlugs.has(p.slug);
      return true;
    });
  }, [problems, probTab, u1, u2]);

  const overallWinner = u1 && u2
    ? u1.total > u2.total ? 1 : u2.total > u1.total ? 2 : 0
    : 0;

  return (
    <div className="min-h-screen bg-[#0b0d13] text-[#f0f2f8] relative">
      {/* Grid texture */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />

      <div className="relative z-10 max-w-[1000px] mx-auto py-8 px-6">

        {/* ── Page header ── */}
        <div className="mb-7">
          <p className="text-[11px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-1">COMPARE</p>
          <h1 className="text-2xl font-bold text-[#f0f2f8] tracking-tight">Side-by-side comparison</h1>
          <p className="text-sm text-[#50566a] mt-1">Compare stats, topics, and solved problems</p>
        </div>

        {/* ── User picker ── */}
        <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-5 mb-5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex-1 min-w-[140px]">
              <label className="text-[10px] font-mono text-[#50566a] uppercase tracking-wider block mb-2">User 1</label>
              <input value={input1} onChange={e => setInput1(e.target.value)}
                onKeyDown={e => e.key === "Enter" && loadCompare(input1, input2)}
                placeholder="username…"
                className="w-full bg-[#161820] border border-white/[0.07] rounded-xl px-4 py-2.5 text-sm text-[#f0f2f8] placeholder-[#50566a] focus:outline-none focus:border-[#00d084]/40 focus:ring-2 focus:ring-[#00d084]/10 transition-all"
              />
            </div>

            {/* swap button */}
            <button
              onClick={() => { setInput1(input2); setInput2(input1); }}
              className="w-9 h-9 rounded-xl bg-[#161820] border border-white/[0.07] flex items-center justify-center text-[#50566a] hover:text-[#f0f2f8] hover:border-white/[0.14] transition-all mb-0.5 flex-shrink-0"
              title="Swap users"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>

            <div className="flex-1 min-w-[140px]">
              <label className="text-[10px] font-mono text-[#50566a] uppercase tracking-wider block mb-2">User 2</label>
              <input value={input2} onChange={e => setInput2(e.target.value)}
                onKeyDown={e => e.key === "Enter" && loadCompare(input1, input2)}
                placeholder="username…"
                className="w-full bg-[#161820] border border-white/[0.07] rounded-xl px-4 py-2.5 text-sm text-[#f0f2f8] placeholder-[#50566a] focus:outline-none focus:border-[#3b82f6]/40 focus:ring-2 focus:ring-[#3b82f6]/10 transition-all"
              />
            </div>

            <button
              onClick={() => loadCompare(input1, input2)}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-black bg-gradient-to-r from-[#00d084] to-[#00b874] hover:-translate-y-px transition-all shadow-[0_4px_16px_rgba(0,208,132,0.25)] disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 mb-0.5"
            >
              {loading ? "Loading…" : "Compare"}
            </button>
          </div>
          {error && <p className="mt-3 text-xs text-[#ef4743] font-mono">{error}</p>}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            {[1,2,3].map(i => (
              <div key={i} className="bg-[#11131a] border border-white/[0.08] rounded-2xl h-40" />
            ))}
          </div>
        )}

        {!loading && u1 && u2 && (
          <>
            {/* ── Head-to-Head user cards ── */}
            <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-6 mb-5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
              <p className="text-[10px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-5">HEAD TO HEAD</p>

              <div className="grid grid-cols-[1fr_90px_1fr] gap-4 items-center">
                {/* User 1 */}
                <div className="flex flex-col items-center gap-4">
                  <Link to={`/profile/${u1.username}`} className="flex items-center gap-3 group">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-[0_0_20px_rgba(0,208,132,0.2)] flex-shrink-0 overflow-hidden"
                      style={{ background: avatarGrad(u1.realName[0]) }}>
                      {u1.avatar ? <img src={u1.avatar} alt={u1.username} className="w-full h-full object-cover" /> : u1.realName[0]}
                    </div>
                    <div>
                      <p className="font-bold text-[#f0f2f8] group-hover:text-[#00d084] transition-colors leading-tight">{u1.realName}</p>
                      <p className="text-xs text-[#50566a] font-mono">@{u1.username}</p>
                    </div>
                  </Link>
                  {overallWinner === 1 && (
                    <span className="text-[10px] font-mono text-[#00d084] bg-[#00d084]/10 border border-[#00d084]/20 px-3 py-1 rounded-full">🏆 Overall Leader</span>
                  )}
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <StatBox value={u1.total}  label="Total"  color="text-[#f0f2f8]"  />
                    <StatBox value={u1.easy}   label="Easy"   color="text-[#00d084]"  />
                    <StatBox value={u1.medium} label="Medium" color="text-[#ffc01e]"  />
                    <StatBox value={u1.hard}   label="Hard"   color="text-[#ef4743]"  />
                  </div>
                </div>

                {/* VS center */}
                <div className="flex flex-col items-center gap-3">
                  <div className="text-3xl font-black text-[#30354a] tracking-widest">VS</div>
                  <div className="text-center">
                    <p className="text-[10px] font-mono text-[#50566a] mb-1">In common</p>
                    <div className="bg-[#3b82f6]/10 border border-[#3b82f6]/25 text-[#3b82f6] rounded-full px-4 py-1.5 text-sm font-bold font-mono">
                      {commonSlugs.size}
                    </div>
                    <p className="text-[10px] text-[#50566a] mt-1">problems</p>
                  </div>
                </div>

                {/* User 2 */}
                <div className="flex flex-col items-center gap-4">
                  <Link to={`/profile/${u2.username}`} className="flex items-center gap-3 group">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-[0_0_20px_rgba(59,130,246,0.2)] flex-shrink-0 overflow-hidden"
                      style={{ background: avatarGrad(u2.realName[0]) }}>
                      {u2.avatar ? <img src={u2.avatar} alt={u2.username} className="w-full h-full object-cover" /> : u2.realName[0]}
                    </div>
                    <div>
                      <p className="font-bold text-[#f0f2f8] group-hover:text-[#3b82f6] transition-colors leading-tight">{u2.realName}</p>
                      <p className="text-xs text-[#50566a] font-mono">@{u2.username}</p>
                    </div>
                  </Link>
                  {overallWinner === 2 && (
                    <span className="text-[10px] font-mono text-[#3b82f6] bg-[#3b82f6]/10 border border-[#3b82f6]/20 px-3 py-1 rounded-full">🏆 Overall Leader</span>
                  )}
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <StatBox value={u2.total}  label="Total"  color="text-[#f0f2f8]"  />
                    <StatBox value={u2.easy}   label="Easy"   color="text-[#00d084]"  />
                    <StatBox value={u2.medium} label="Medium" color="text-[#ffc01e]"  />
                    <StatBox value={u2.hard}   label="Hard"   color="text-[#ef4743]"  />
                  </div>
                </div>
              </div>
            </div>

            {/* ── H2H bar comparison ── */}
            <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-6 mb-5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-mono text-[#50566a] tracking-[0.15em] uppercase">STAT BREAKDOWN</p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-[#00d084]"><span className="w-2 h-2 rounded-full bg-[#00d084]" />{u1.realName}</span>
                  <span className="flex items-center gap-1.5 text-[#3b82f6]"><span className="w-2 h-2 rounded-full bg-[#3b82f6]" />{u2.realName}</span>
                </div>
              </div>
              <H2HRow label="Total"  v1={u1.total}  v2={u2.total}  />
              <H2HRow label="Easy"   v1={u1.easy}   v2={u2.easy}   />
              <H2HRow label="Medium" v1={u1.medium} v2={u2.medium} />
              <H2HRow label="Hard"   v1={u1.hard}   v2={u2.hard}   />
              <H2HRow label="Streak" v1={u1.streak} v2={u2.streak} />
            </div>

            {/* ── Radar chart ── */}
            <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-6 mb-5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
              <p className="text-[10px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-5">TOPIC RADAR</p>
              <RadarChart u1={u1} u2={u2} />
            </div>

            {/* ── Problem overlap table ── */}
            <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-[10px] font-mono text-[#50566a] uppercase tracking-wider">PROBLEMS</p>
                  <p className="text-sm font-semibold text-[#f0f2f8] mt-0.5">{displayProbs.length} shown</p>
                </div>
                {/* tab switcher */}
                <div className="flex gap-1 bg-[#0f1117] border border-white/[0.06] rounded-xl p-1">
                  {[
                    { id: "common", label: `Both (${commonSlugs.size})` },
                    { id: "u1only", label: `Only ${u1.realName.split(" ")[0]}` },
                    { id: "u2only", label: `Only ${u2.realName.split(" ")[0]}` },
                    { id: "all",    label: "All" },
                  ].map(({ id, label }) => (
                    <button key={id} onClick={() => setProbTab(id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        probTab === id
                          ? "bg-[#161820] text-[#f0f2f8] border border-white/[0.08] shadow-sm"
                          : "text-[#50566a] hover:text-[#8890a8]"
                      }`}
                    >{label}</button>
                  ))}
                </div>
              </div>

              {/* Table head */}
              <div className="grid grid-cols-[40px_1fr_90px_90px_44px_44px] gap-3 px-5 py-2.5 text-[10px] text-[#50566a] font-mono tracking-[0.1em] uppercase border-b border-white/[0.06] bg-[#0d0f16]/60">
                <div>#</div>
                <div>Title</div>
                <div>Difficulty</div>
                <div>Topic</div>
                <div className="text-center text-[#00d084]">{u1.realName.split(" ")[0]}</div>
                <div className="text-center text-[#3b82f6]">{u2.realName.split(" ")[0]}</div>
              </div>

              {/* Rows */}
              <div className="max-h-[420px] overflow-y-auto no-scrollbar">
                {displayProbs.length === 0
                  ? <div className="flex flex-col items-center justify-center py-12 gap-2">
                      <span className="text-3xl opacity-20">📭</span>
                      <p className="text-sm text-[#50566a] font-mono">No problems in this category</p>
                    </div>
                  : displayProbs.map(p => (
                      <ProbRow key={p.slug} p={p}
                        u1Solved={u1.solvedSlugs.has(p.slug)}
                        u2Solved={u2.solvedSlugs.has(p.slug)} />
                    ))
                }
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ComparePage;
