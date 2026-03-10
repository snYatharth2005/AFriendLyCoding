import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSolvedQuestion } from "../api/axiosClient";
import FollowedFriends from "../components/home/FollowedFriends";

/* ─────────────────────────────────────────────
   Stat card — top row of 4 (matches screenshot)
───────────────────────────────────────────── */
const StatCard = ({ icon, label, value, sub, valueColor = "text-[#f0f2f8]" }) => (
  <div className="
    bg-[#11131a] border border-white/[0.08] rounded-2xl p-5
    flex items-start gap-4
    shadow-[0_4px_20px_rgba(0,0,0,0.35)]
    hover:border-white/[0.13] transition-all duration-200
  ">
    {/* icon box */}
    <div className="w-11 h-11 rounded-xl bg-[#161820] border border-white/[0.07] flex items-center justify-center text-xl flex-shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-mono text-[#50566a] tracking-[0.14em] uppercase leading-none mb-1.5">
        {label}
      </p>
      <p className={`text-3xl font-bold font-mono leading-none ${valueColor}`}>
        {value}
      </p>
      {sub && (
        <p className="text-xs text-[#50566a] mt-1.5 leading-snug">{sub}</p>
      )}
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Solve Distribution panel (left of bottom row)
───────────────────────────────────────────── */
const SolveDistribution = ({ solved, easy, medium, hard }) => {
  const total      = 3356;
  const completion = ((solved / total) * 100).toFixed(1);
  const radius     = 52;
  const circ       = 2 * Math.PI * radius;
  const offset     = circ - (Math.min(completion / 100, 1)) * circ;

  return (
    <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.35)] h-full">
      <p className="text-[10px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-5">
        SOLVE DISTRIBUTION
      </p>

      <div className="flex items-center gap-6">
        {/* SVG ring */}
        <div className="relative flex-shrink-0 w-[128px] h-[128px]">
          <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r={radius} stroke="rgba(255,255,255,0.06)" strokeWidth="10" fill="none" />
            <circle cx="64" cy="64" r={radius}
              stroke="url(#dashGrad)" strokeWidth="10" fill="none"
              strokeDasharray={circ} strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.8s ease" }}
            />
            <defs>
              <linearGradient id="dashGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#00d084" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold font-mono text-[#f0f2f8] leading-none">{solved}</span>
            <span className="text-[11px] text-[#50566a] font-mono mt-0.5">/{total}</span>
            <span className="text-[10px] text-[#50566a] mt-1">Total</span>
          </div>
        </div>

        {/* bars */}
        <div className="flex-1 space-y-4 min-w-0">
          {[
            { label: "EASY",   count: easy,   total: 839,  color: "#00d084" },
            { label: "MEDIUM", count: medium, total: 1759, color: "#ffc01e" },
            { label: "HARD",   count: hard,   total: 758,  color: "#ef4743" },
          ].map(({ label, count, total: t, color }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-bold" style={{ color }}>{label}</span>
                <span className="text-xs font-mono text-[#50566a]">{count}/{t}</span>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min((count/t)*100, 100)}%`, background: color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Recent Solves panel (center of bottom row)
───────────────────────────────────────────── */
const diffColor = (d) => {
  const dl = (d || "").toLowerCase();
  if (dl === "easy")   return "bg-[#00d084]";
  if (dl === "medium") return "bg-[#ffc01e]";
  if (dl === "hard")   return "bg-[#ef4743]";
  return "bg-[#50566a]";
};

const timeAgo = (idx) => {
  const times = ["2h ago","5h ago","1d ago","1d ago","2d ago","2d ago","3d ago","3d ago","4d ago","5d ago"];
  return times[idx % times.length];
};

const RecentSolves = ({ problems, loading }) => (
  <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.35)] h-full flex flex-col">
    <div className="flex items-center justify-between mb-5">
      <p className="text-[10px] font-mono text-[#50566a] tracking-[0.15em] uppercase">RECENT SOLVES</p>
      <Link to="/profile/me" className="text-xs text-[#00d084] hover:text-[#00b874] transition-colors font-medium">
        See all →
      </Link>
    </div>

    <div className="flex-1 space-y-1 overflow-hidden">
      {loading
        ? Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-white/[0.07] flex-shrink-0" />
              <div className="flex-1 h-3 bg-white/[0.07] rounded" />
              <div className="w-14 h-3 bg-white/[0.04] rounded" />
            </div>
          ))
        : problems.length === 0
        ? (
          <div className="flex flex-col items-center justify-center h-full py-8 gap-2">
            <span className="text-3xl opacity-25">📭</span>
            <p className="text-sm text-[#50566a] font-mono">No solves yet</p>
          </div>
        )
        : problems.slice(0, 8).map((p, i) => (
            <div key={p.slug || i} className="flex items-center gap-3 py-2 border-b border-white/[0.03] last:border-0 group">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${diffColor(p.difficulty)}`} />
              <p className="flex-1 text-sm text-[#c8ccd8] font-mono truncate group-hover:text-[#f0f2f8] transition-colors">
                {p.id ? `${p.id}. ` : ""}{p.title}
              </p>
              <span className="text-xs text-[#50566a] flex-shrink-0 font-mono">{timeAgo(i)}</span>
            </div>
          ))
      }
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Top Topics panel (right of bottom row)
   — static for now, easy to wire up later
───────────────────────────────────────────── */
const TOP_TOPICS = [
  { label: "Array",         n: 82 },
  { label: "Dynamic Prog.", n: 65 },
  { label: "Hash Table",    n: 61 },
  { label: "Two Pointers",  n: 50 },
  { label: "Tree",          n: 43 },
  { label: "Graph",         n: 32 },
  { label: "BFS/DFS",       n: 27 },
];

const TopTopics = () => (
  <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.35)] h-full">
    <p className="text-[10px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-5">TOP TOPICS</p>
    <div className="space-y-0">
      {TOP_TOPICS.map(({ label, n }) => (
        <div key={label} className="
          flex items-center justify-between
          py-2.5 border-b border-white/[0.04] last:border-0
          hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors
        ">
          <span className="text-sm text-[#c8ccd8]">{label}</span>
          <span className="text-sm font-mono text-[#50566a]">{n}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Main Dashboard
───────────────────────────────────────────── */
const Home = () => {
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getSolvedQuestion(localStorage.getItem("username"))
      .then(data => setSolvedProblems(data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const username = localStorage.getItem("username") || "there";

  const easy   = solvedProblems.filter(p => p.difficulty?.toLowerCase() === "easy").length;
  const medium = solvedProblems.filter(p => p.difficulty?.toLowerCase() === "medium").length;
  const hard   = solvedProblems.filter(p => p.difficulty?.toLowerCase() === "hard").length;
  const total  = solvedProblems.length;
  const pct    = ((total / 3356) * 100).toFixed(2);

  /* greeting */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-[#0b0d13] text-[#f0f2f8] relative">

      {/* grid texture */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />

      <div className="relative z-10 flex gap-0">

        {/* ── Main content area ── */}
        <div className="flex-1 min-w-0 py-8 px-7">

          {/* ── Header row ── */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-[26px] font-bold text-[#f0f2f8] tracking-tight leading-tight">
              {greeting},{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d084] to-[#06b6d4]">
                {username}
              </span>{" "}
              👋
            </h1>
              <p className="text-sm text-[#8890a8] mt-1">
                Here's your coding progress at a glance.
              </p>
            </div>

            <Link
              to="/home"
              className="
                hidden sm:flex items-center gap-2
                px-5 py-2.5 rounded-xl text-sm font-semibold text-black
                bg-gradient-to-r from-[#00d084] to-[#00b874]
                transition-all duration-200 hover:-translate-y-px
                shadow-[0_4px_16px_rgba(0,208,132,0.3)]
                flex-shrink-0 mt-1
              "
            >
              💻 View Problems
            </Link>
          </div>

          {/* ── 4 stat cards ── */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon="💻"
              label="Problems Solved"
              value={loading ? "…" : total}
              sub={`${pct}% complete`}
              valueColor="text-[#00d084]"
            />
            <StatCard
              icon="🔥"
              label="Daily Streak"
              value="23d"
              sub="Keep it up!"
              valueColor="text-[#ffc01e]"
            />
            <StatCard
              icon="📋"
              label="This Week"
              value="12"
              sub="problems solved"
              valueColor="text-[#3b82f6]"
            />
            <StatCard
              icon="🏆"
              label="Hard Solved"
              value={loading ? "…" : hard}
              sub="challenging problems"
              valueColor="text-[#ef4743]"
            />
          </div>

          {/* ── Bottom 3-col row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Solve distribution */}
            <SolveDistribution
              solved={total}
              easy={easy}
              medium={medium}
              hard={hard}
            />

            {/* Recent solves */}
            <RecentSolves problems={solvedProblems} loading={loading} />

            {/* Top topics */}
            <TopTopics />

          </div>
        </div>

        {/* ── RIGHT SIDE — kept exactly as before ── */}
        <aside className="hidden xl:block w-[280px] flex-shrink-0 py-8 pr-6">
          <FollowedFriends />
        </aside>

      </div>
    </div>
  );
};

export default Home;