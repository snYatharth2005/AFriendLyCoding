import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { getFriendUser, getSolvedQuestion } from "../api/axiosClient";

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const avatarGrad = (letter = "A") => {
  const g = [
    ["#00d084","#06b6d4"], ["#a855f7","#6366f1"],
    ["#f59e0b","#ef4743"], ["#ec4899","#a855f7"],
    ["#06b6d4","#3b82f6"],
  ];
  const [a,b] = g[(letter.charCodeAt(0) || 65) % g.length];
  return `linear-gradient(135deg,${a},${b})`;
};

const diffBadge = {
  EASY:   { label:"EASY",   textCls:"text-[#00d084]", bgCls:"bg-[#00d084]/10 border-[#00d084]/20", dot:"bg-[#00d084]" },
  MEDIUM: { label:"MEDIUM", textCls:"text-[#ffc01e]", bgCls:"bg-[#ffc01e]/10 border-[#ffc01e]/20", dot:"bg-[#ffc01e]" },
  HARD:   { label:"HARD",   textCls:"text-[#ef4743]", bgCls:"bg-[#ef4743]/10 border-[#ef4743]/20", dot:"bg-[#ef4743]" },
};

/* Build topic radar data from solved problems array
   topics field is a comma-separated string e.g. "Array,Hash Table,Two Pointers" */
const TOP_TOPICS = ["Array", "Dynamic Programming", "Tree", "Graph", "String", "Hash Table"];
const buildTopics = (solvedProblems) => {
  const counts = {};
  for (const p of solvedProblems) {
    const tags = (p.topics || "").split(",").map(t => t.trim()).filter(Boolean);
    for (const tag of tags) counts[tag] = (counts[tag] || 0) + 1;
  }
  // For radar: express as % of solved problems that touch each topic (capped at 100)
  const total = Math.max(solvedProblems.length, 1);
  return TOP_TOPICS.map(label => ({
    label,
    pct: Math.min(Math.round(((counts[label] || 0) / total) * 300), 100), // *3 to make differences visible
  }));
};

/* ─── Radar SVG ──────────────────────────────────────────────── */
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

const RadarChart = ({ u1, u2 }) => (
  <div className="flex flex-col lg:flex-row items-center gap-8">
    <svg width="280" height="280" viewBox="0 0 280 280" className="flex-shrink-0">
      {[25,50,75,100].map(s => (
        <polygon key={s} points={gridPts(s)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}
      {Array.from({length: axes}, (_,i) => {
        const [x,y] = radarPt(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
      })}
      <polygon points={dataPts(u1.topics)} fill="rgba(0,208,132,0.15)" stroke="#00d084" strokeWidth="2" />
      {u1.topics.map((t,i) => {
        const [x,y] = radarPt(i, t.pct);
        return <circle key={i} cx={x} cy={y} r="3.5" fill="#00d084" />;
      })}
      <polygon points={dataPts(u2.topics)} fill="rgba(59,130,246,0.12)" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,3" />
      {u2.topics.map((t,i) => {
        const [x,y] = radarPt(i, t.pct);
        return <circle key={i} cx={x} cy={y} r="3" fill="#3b82f6" />;
      })}
      {u1.topics.map((t,i) => {
        const [px,py] = radarPt(i, 118);
        const anchor = px < cx - 5 ? "end" : px > cx + 5 ? "start" : "middle";
        return (
          <text key={i} x={px} y={py} textAnchor={anchor} fill="#8890a8" fontSize="10" fontFamily="monospace" dy="4">
            {t.label.length > 8 ? t.label.slice(0,8)+"…" : t.label}
          </text>
        );
      })}
    </svg>
    <div className="space-y-3 min-w-[180px]">
      <div className="flex items-center gap-2.5 text-sm">
        <div className="w-7 h-0.5 bg-[#00d084] rounded-full flex-shrink-0" />
        <span className="text-[#c8ccd8] font-mono">@{u1.username}</span>
      </div>
      <div className="flex items-center gap-2.5 text-sm">
        <div className="w-7 h-0.5 flex-shrink-0"
          style={{ background: "repeating-linear-gradient(90deg,#3b82f6 0,#3b82f6 5px,transparent 5px,transparent 9px)" }} />
        <span className="text-[#c8ccd8] font-mono">@{u2.username}</span>
      </div>
      <div className="mt-4 bg-[#161820] border border-white/[0.06] rounded-xl p-3 space-y-2.5">
        {(() => {
          const u1Leads = u1.topics.filter((t,i) => t.pct > u2.topics[i].pct);
          const u2Leads = u2.topics.filter((t,i) => t.pct < u2.topics[i].pct);
          return (
            <>
              {u1Leads.length > 0 && (
                <div>
                  <p className="text-[10px] font-mono text-[#50566a] uppercase tracking-wider mb-1">@{u1.username} leads</p>
                  <p className="text-xs text-[#00d084]">{u1Leads.map(t => t.label).join(" · ")}</p>
                </div>
              )}
              {u2Leads.length > 0 && (
                <div>
                  <p className="text-[10px] font-mono text-[#50566a] uppercase tracking-wider mb-1">@{u2.username} leads</p>
                  <p className="text-xs text-[#3b82f6]">{u2Leads.map(t => t.label).join(" · ")}</p>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  </div>
);

/* ─── Stat mini-box ──────────────────────────────────────────── */
const StatBox = ({ value, label, color = "text-[#f0f2f8]" }) => (
  <div className="bg-[#0f1117] rounded-xl p-3 text-center border border-white/[0.04]">
    <div className={`text-xl font-bold font-mono ${color}`}>{value ?? "—"}</div>
    <div className="text-[10px] text-[#50566a] mt-0.5 uppercase tracking-wider font-mono">{label}</div>
  </div>
);

/* ─── Win badge ──────────────────────────────────────────────── */
const WinBadge = ({ winner }) =>
  winner === 0
    ? <span className="text-[10px] font-mono text-[#ffc01e] bg-[#ffc01e]/10 border border-[#ffc01e]/20 px-2 py-0.5 rounded-full">TIE</span>
    : winner === 1
    ? <span className="text-[10px] font-mono text-[#00d084] bg-[#00d084]/10 border border-[#00d084]/20 px-2 py-0.5 rounded-full">↑ leads</span>
    : <span className="text-[10px] font-mono text-[#3b82f6] bg-[#3b82f6]/10 border border-[#3b82f6]/20 px-2 py-0.5 rounded-full">↑ leads</span>;

/* ─── H2H bar row ────────────────────────────────────────────── */
const H2HRow = ({ label, v1, v2, color1 = "#00d084", color2 = "#3b82f6" }) => {
  const max = Math.max(v1 ?? 0, v2 ?? 0, 1);
  const winner = (v1 ?? 0) > (v2 ?? 0) ? 1 : (v2 ?? 0) > (v1 ?? 0) ? 2 : 0;
  return (
    <div className="grid grid-cols-[1fr_80px_1fr] gap-3 items-center py-2.5 border-b border-white/[0.04] last:border-0">
      <div className="flex items-center gap-2 justify-end">
        <span className="text-sm font-bold font-mono" style={{ color: winner === 1 ? color1 : "#8890a8" }}>{v1 ?? "—"}</span>
        <div className="w-24 h-1.5 bg-white/[0.05] rounded-full overflow-hidden flex justify-end">
          <div className="h-full rounded-full" style={{ width:`${((v1??0)/max)*100}%`, background: color1 }} />
        </div>
      </div>
      <div className="text-center">
        <div className="text-[10px] font-mono text-[#50566a] uppercase tracking-wider">{label}</div>
        <div className="mt-1"><WinBadge winner={winner} /></div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-24 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width:`${((v2??0)/max)*100}%`, background: color2 }} />
        </div>
        <span className="text-sm font-bold font-mono" style={{ color: winner === 2 ? color2 : "#8890a8" }}>{v2 ?? "—"}</span>
      </div>
    </div>
  );
};

/* ─── Problem row ────────────────────────────────────────────── */
const ProbRow = ({ p, u1Solved, u2Solved }) => {
  const diff = p.difficulty?.toUpperCase();
  const b = diffBadge[diff];
  return (
    <div
      onClick={() => window.open(`https://leetcode.com/problems/${p.slug}/`, "_blank", "noopener,noreferrer")}
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
      <span className="text-xs font-mono text-[#50566a] bg-[#0f1117] px-2 py-0.5 rounded-lg border border-white/[0.04] truncate">
        {(p.topics || "").split(",")[0] || "—"}
      </span>
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

/* ════════════════════════════════════════════
   MAIN
════════════════════════════════════════════ */
const ComparePage = () => {
  const { username: urlUser } = useParams(); // friend's username from /compare/:username
  const loggedUser = localStorage.getItem("username") || "";

  const [input1, setInput1]     = useState(loggedUser);
  const [input2, setInput2]     = useState(urlUser || "");
  const [u1, setU1]             = useState(null);
  const [u2, setU2]             = useState(null);
  const [allProblems, setAllProblems] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [probTab, setProbTab]   = useState("common");

  const loadCompare = async (a, b) => {
    if (!a || !b) { setError("Enter both usernames."); return; }
    if (a === b)  { setError("Can't compare a user with themselves."); return; }
    setLoading(true); setError(""); setU1(null); setU2(null);

    try {
      // Fetch UserDto (stats) and solved problems for both users in parallel
      const [dto1, dto2, solved1Raw, solved2Raw] = await Promise.all([
        getFriendUser(a),
        getFriendUser(b),
        getSolvedQuestion(a),
        getSolvedQuestion(b),
      ]);

      // solved problems come as array of { frontendId, title, slug, difficulty, topics, users: [...] }
      // users array contains all users who solved it — we just need slugs
      const solved1 = solved1Raw || [];
      const solved2 = solved2Raw || [];

      // Build slug sets from solved lists
      // getSolvedQuestion returns problems that user has solved — each item has a users array
      // We need to filter: keep only problems where the target user is in the users array
      const slugSet1 = new Set(solved1.map(p => p.slug));
      const slugSet2 = new Set(solved2.map(p => p.slug));

      // Union of all problems both have touched
      const allSlugs = new Set([...slugSet1, ...slugSet2]);
      const problemMap = new Map();
      [...solved1, ...solved2].forEach(p => {
        if (!problemMap.has(p.slug)) problemMap.set(p.slug, p);
      });
      const unionProblems = [...allSlugs].map(s => problemMap.get(s)).filter(Boolean);

      setU1({
        username: dto1.username ?? a,
        avatar:   dto1.avatar   ?? null,
        total:    dto1.totalProblems  ?? 0,
        easy:     dto1.easyProblems   ?? 0,
        medium:   dto1.mediumProblems ?? 0,
        hard:     dto1.hardProblems   ?? 0,
        streak:   dto1.streak         ?? null,
        thisWeek: dto1.solvedInAWeek  ?? null,
        solvedSlugs: slugSet1,
        topics: buildTopics(solved1),
      });
      setU2({
        username: dto2.username ?? b,
        avatar:   dto2.avatar   ?? null,
        total:    dto2.totalProblems  ?? 0,
        easy:     dto2.easyProblems   ?? 0,
        medium:   dto2.mediumProblems ?? 0,
        hard:     dto2.hardProblems   ?? 0,
        streak:   dto2.streak         ?? null,
        thisWeek: dto2.solvedInAWeek  ?? null,
        solvedSlugs: slugSet2,
        topics: buildTopics(solved2),
      });
      setAllProblems(unionProblems);

    } catch (e) {
      console.error("Compare load error:", e);
      setError("Could not load one or both users. Make sure they've synced via the extension.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-load if url has a username param
  useEffect(() => {
    if (loggedUser && urlUser && loggedUser !== urlUser) {
      setInput1(loggedUser);
      setInput2(urlUser);
      loadCompare(loggedUser, urlUser);
    }
  }, [urlUser]);

  const commonSlugs = useMemo(() => {
    if (!u1 || !u2) return new Set();
    return new Set([...u1.solvedSlugs].filter(s => u2.solvedSlugs.has(s)));
  }, [u1, u2]);

  const displayProbs = useMemo(() => {
    if (!u1 || !u2) return [];
    return allProblems.filter(p => {
      if (probTab === "common") return u1.solvedSlugs.has(p.slug) && u2.solvedSlugs.has(p.slug);
      if (probTab === "u1only") return u1.solvedSlugs.has(p.slug) && !u2.solvedSlugs.has(p.slug);
      if (probTab === "u2only") return !u1.solvedSlugs.has(p.slug) && u2.solvedSlugs.has(p.slug);
      return true;
    });
  }, [allProblems, probTab, u1, u2]);

  const overallWinner = u1 && u2
    ? (u1.total > u2.total ? 1 : u2.total > u1.total ? 2 : 0)
    : 0;

  return (
    <div className="min-h-screen bg-[#0b0d13] text-[#f0f2f8] relative">
      <div className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />

      <div className="relative z-10 max-w-[1000px] mx-auto py-8 px-6">

        {/* header */}
        <div className="mb-7">
          <p className="text-[11px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-1">COMPARE</p>
          <h1 className="text-2xl font-bold tracking-tight">Side-by-side comparison</h1>
          <p className="text-sm text-[#50566a] mt-1">Compare stats, topics, and solved problems</p>
        </div>

        {/* user picker */}
        <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-5 mb-5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex-1 min-w-[140px]">
              <label className="text-[10px] font-mono text-[#50566a] uppercase tracking-wider block mb-2">User 1</label>
              <input value={input1} onChange={e => setInput1(e.target.value)}
                onKeyDown={e => e.key === "Enter" && loadCompare(input1, input2)}
                placeholder="username…"
                className="w-full bg-[#161820] border border-white/[0.07] rounded-xl px-4 py-2.5 text-sm text-[#f0f2f8] placeholder-[#50566a] focus:outline-none focus:border-[#00d084]/40 focus:ring-2 focus:ring-[#00d084]/10 transition-all" />
            </div>
            <button onClick={() => { setInput1(input2); setInput2(input1); }}
              className="w-9 h-9 rounded-xl bg-[#161820] border border-white/[0.07] flex items-center justify-center text-[#50566a] hover:text-[#f0f2f8] hover:border-white/[0.14] transition-all mb-0.5 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
            <div className="flex-1 min-w-[140px]">
              <label className="text-[10px] font-mono text-[#50566a] uppercase tracking-wider block mb-2">User 2</label>
              <input value={input2} onChange={e => setInput2(e.target.value)}
                onKeyDown={e => e.key === "Enter" && loadCompare(input1, input2)}
                placeholder="username…"
                className="w-full bg-[#161820] border border-white/[0.07] rounded-xl px-4 py-2.5 text-sm text-[#f0f2f8] placeholder-[#50566a] focus:outline-none focus:border-[#3b82f6]/40 focus:ring-2 focus:ring-[#3b82f6]/10 transition-all" />
            </div>
            <button onClick={() => loadCompare(input1, input2)} disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-black bg-gradient-to-r from-[#00d084] to-[#00b874] hover:-translate-y-px transition-all shadow-[0_4px_16px_rgba(0,208,132,0.25)] disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 mb-0.5">
              {loading ? "Loading…" : "Compare"}
            </button>
          </div>
          {error && <p className="mt-3 text-xs text-[#ef4743] font-mono">{error}</p>}
        </div>

        {/* loading skeleton */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="bg-[#11131a] border border-white/[0.08] rounded-2xl h-40" />)}
          </div>
        )}

        {/* empty state */}
        {!loading && !u1 && !error && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="text-5xl opacity-20">⚔️</div>
            <p className="text-[#50566a] text-sm">Enter two usernames and click Compare</p>
          </div>
        )}

        {!loading && u1 && u2 && (
          <>
            {/* head to head */}
            <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-6 mb-5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
              <p className="text-[10px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-5">HEAD TO HEAD</p>
              <div className="grid grid-cols-[1fr_90px_1fr] gap-4 items-center">
                {/* user 1 */}
                <div className="flex flex-col items-center gap-4">
                  <Link to={`/profile/${u1.username}`} className="flex items-center gap-3 group">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white overflow-hidden flex-shrink-0"
                      style={{ background: avatarGrad(u1.username[0]) }}>
                      {u1.avatar ? <img src={u1.avatar} alt={u1.username} className="w-full h-full object-cover" /> : u1.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-[#f0f2f8] group-hover:text-[#00d084] transition-colors leading-tight">@{u1.username}</p>
                    </div>
                  </Link>
                  {overallWinner === 1 && (
                    <span className="text-[10px] font-mono text-[#00d084] bg-[#00d084]/10 border border-[#00d084]/20 px-3 py-1 rounded-full">🏆 Overall Leader</span>
                  )}
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <StatBox value={u1.total}   label="Total"     color="text-[#f0f2f8]" />
                    <StatBox value={u1.easy}    label="Easy"      color="text-[#00d084]" />
                    <StatBox value={u1.medium}  label="Medium"    color="text-[#ffc01e]" />
                    <StatBox value={u1.hard}    label="Hard"      color="text-[#ef4743]" />
                    <StatBox value={u1.streak != null ? `${u1.streak}d` : "—"} label="Streak" color="text-[#ffc01e]" />
                    <StatBox value={u1.thisWeek ?? "—"} label="This Week" color="text-[#06b6d4]" />
                  </div>
                </div>

                {/* VS */}
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

                {/* user 2 */}
                <div className="flex flex-col items-center gap-4">
                  <Link to={`/profile/${u2.username}`} className="flex items-center gap-3 group">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white overflow-hidden flex-shrink-0"
                      style={{ background: avatarGrad(u2.username[0]) }}>
                      {u2.avatar ? <img src={u2.avatar} alt={u2.username} className="w-full h-full object-cover" /> : u2.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-[#f0f2f8] group-hover:text-[#3b82f6] transition-colors leading-tight">@{u2.username}</p>
                    </div>
                  </Link>
                  {overallWinner === 2 && (
                    <span className="text-[10px] font-mono text-[#3b82f6] bg-[#3b82f6]/10 border border-[#3b82f6]/20 px-3 py-1 rounded-full">🏆 Overall Leader</span>
                  )}
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <StatBox value={u2.total}   label="Total"     color="text-[#f0f2f8]" />
                    <StatBox value={u2.easy}    label="Easy"      color="text-[#00d084]" />
                    <StatBox value={u2.medium}  label="Medium"    color="text-[#ffc01e]" />
                    <StatBox value={u2.hard}    label="Hard"      color="text-[#ef4743]" />
                    <StatBox value={u2.streak != null ? `${u2.streak}d` : "—"} label="Streak" color="text-[#ffc01e]" />
                    <StatBox value={u2.thisWeek ?? "—"} label="This Week" color="text-[#06b6d4]" />
                  </div>
                </div>
              </div>
            </div>

            {/* H2H bars */}
            <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-6 mb-5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-mono text-[#50566a] tracking-[0.15em] uppercase">STAT BREAKDOWN</p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-[#00d084]"><span className="w-2 h-2 rounded-full bg-[#00d084]" />@{u1.username}</span>
                  <span className="flex items-center gap-1.5 text-[#3b82f6]"><span className="w-2 h-2 rounded-full bg-[#3b82f6]" />@{u2.username}</span>
                </div>
              </div>
              <H2HRow label="Total"     v1={u1.total}    v2={u2.total}    />
              <H2HRow label="Easy"      v1={u1.easy}     v2={u2.easy}     />
              <H2HRow label="Medium"    v1={u1.medium}   v2={u2.medium}   />
              <H2HRow label="Hard"      v1={u1.hard}     v2={u2.hard}     />
              <H2HRow label="Streak"    v1={u1.streak}   v2={u2.streak}   />
              <H2HRow label="This Week" v1={u1.thisWeek} v2={u2.thisWeek} />
            </div>

            {/* radar */}
            <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-6 mb-5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
              <p className="text-[10px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-5">TOPIC RADAR</p>
              <RadarChart u1={u1} u2={u2} />
            </div>

            {/* problem overlap */}
            <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
              <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-[10px] font-mono text-[#50566a] uppercase tracking-wider">PROBLEMS</p>
                  <p className="text-sm font-semibold text-[#f0f2f8] mt-0.5">{displayProbs.length} shown</p>
                </div>
                <div className="flex gap-1 bg-[#0f1117] border border-white/[0.06] rounded-xl p-1">
                  {[
                    { id: "common", label: `Both (${commonSlugs.size})` },
                    { id: "u1only", label: `Only @${u1.username}` },
                    { id: "u2only", label: `Only @${u2.username}` },
                    { id: "all",    label: "All" },
                  ].map(({ id, label }) => (
                    <button key={id} onClick={() => setProbTab(id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        probTab === id
                          ? "bg-[#161820] text-[#f0f2f8] border border-white/[0.08] shadow-sm"
                          : "text-[#50566a] hover:text-[#8890a8]"
                      }`}>{label}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-[40px_1fr_90px_90px_44px_44px] gap-3 px-5 py-2.5 text-[10px] text-[#50566a] font-mono tracking-[0.1em] uppercase border-b border-white/[0.06] bg-[#0d0f16]/60">
                <div>#</div><div>Title</div><div>Difficulty</div><div>Topic</div>
                <div className="text-center text-[#00d084]">@{u1.username.slice(0,6)}</div>
                <div className="text-center text-[#3b82f6]">@{u2.username.slice(0,6)}</div>
              </div>
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