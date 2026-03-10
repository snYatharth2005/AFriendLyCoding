import { useMemo, useState } from "react";
import ProblemRow from "./ProblemRow";

/* ── Skeleton row ── */
const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-5 py-3.5 border-b border-white/[0.04] animate-pulse">
    <div className="w-8 h-3 bg-white/[0.07] rounded flex-shrink-0" />
    <div className="flex-1 h-3 bg-white/[0.07] rounded" />
    <div className="w-16 h-5 bg-white/[0.05] rounded-md flex-shrink-0" />
    <div className="w-20 h-3 bg-white/[0.05] rounded flex-shrink-0" />
    <div className="w-16 h-3 bg-white/[0.04] rounded flex-shrink-0" />
  </div>
);

const DIFFICULTIES = ["all", "easy", "medium", "hard"];

const diffChipStyle = {
  all:    "bg-[#00d084]/10 text-[#00d084] border-[#00d084]/25",
  easy:   "bg-[#00d084]/10 text-[#00d084] border-[#00d084]/25",
  medium: "bg-[#ffc01e]/10 text-[#ffc01e] border-[#ffc01e]/25",
  hard:   "bg-[#ef4743]/10 text-[#ef4743] border-[#ef4743]/25",
};

const ProblemSet = ({ problems, loading }) => {
  const [search, setSearch]         = useState("");
  const [difficulty, setDifficulty] = useState("all");

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase());
      const matchesDifficulty =
        difficulty === "all" ||
        p.difficulty?.toLowerCase() === difficulty;
      return matchesSearch && matchesDifficulty;
    });
  }, [problems, search, difficulty]);

  return (
    <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)]">

      {/* ── Header ── */}
      <div className="px-5 py-4 border-b border-white/[0.08]">
        <p className="text-[11px] font-mono text-[#00d084] tracking-[0.15em] uppercase mb-1">
          PROBLEMSET
        </p>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#f0f2f8]">
            Solved Problems
          </h2>
          <span className="text-xs font-mono text-[#50566a] bg-[#161820] border border-white/[0.06] px-2.5 py-1 rounded-lg">
            {loading ? "…" : problems.length} total
          </span>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="px-5 py-3.5 border-b border-white/[0.06] bg-[#0f1117]/40 space-y-3">
        {/* Search */}
        <div className="relative flex items-center">
          <svg
            className="absolute left-3 w-3.5 h-3.5 text-[#50566a] pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by title or slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full bg-[#161820] border border-white/[0.07]
              rounded-xl pl-9 pr-4 py-2
              text-sm text-[#f0f2f8] placeholder-[#50566a]
              focus:outline-none focus:border-[#00d084]/40
              focus:ring-2 focus:ring-[#00d084]/10
              transition-all duration-200
            "
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 text-[#50566a] hover:text-[#8890a8] transition-colors text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Difficulty chips */}
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`
                px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold
                transition-all duration-150 uppercase tracking-wider
                ${difficulty === d
                  ? diffChipStyle[d]
                  : "bg-transparent border-white/[0.07] text-[#50566a] hover:text-[#8890a8] hover:border-white/[0.12]"
                }
              `}
            >
              {d}
            </button>
          ))}
          {/* filtered count */}
          {!loading && (difficulty !== "all" || search) && (
            <span className="ml-auto text-xs font-mono text-[#50566a] self-center">
              {filteredProblems.length} shown
            </span>
          )}
        </div>
      </div>

      {/* ── Table header ── */}
      <div className="grid grid-cols-[48px_1fr_90px_120px_110px] gap-3 px-5 py-2.5 text-[10px] text-[#50566a] font-mono tracking-[0.1em] uppercase border-b border-white/[0.06] bg-[#0d0f16]/60 sticky top-0 z-10">
        <div>#</div>
        <div>Title</div>
        <div>Difficulty</div>
        <div>Slug</div>
        <div>Solved by</div>
      </div>

      {/* ── Rows ── */}
      <div className="h-[520px] overflow-y-auto no-scrollbar">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
        ) : filteredProblems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="text-4xl opacity-30">🔍</div>
            <p className="text-sm text-[#50566a] font-mono">
              {search ? `No results for "${search}"` : "No problems found"}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-xs text-[#00d084] hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          filteredProblems.map((q) => (
            <ProblemRow key={q.slug} question={q} />
          ))
        )}
      </div>
    </div>
  );
};

export default ProblemSet;
