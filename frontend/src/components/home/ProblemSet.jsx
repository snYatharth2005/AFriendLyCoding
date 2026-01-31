import { useMemo, useState } from "react";
import ProblemRow from "./ProblemRow";

const SkeletonRow = () => (
  <div className="grid grid-cols-12 px-5 py-3 border-b border-white/5 animate-pulse">
    <div className="col-span-1 h-4 bg-white/10 rounded" />
    <div className="col-span-7 mx-2 h-4 bg-white/10 rounded" />
    <div className="col-span-2 mx-2 h-4 bg-white/10 rounded" />
    <div className="col-span-2 mx-2 h-4 bg-white/10 rounded" />
  </div>
);

const ProblemSet = ({ problems, loading }) => {
  const [search, setSearch] = useState("");
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
    <div className="rounded-xl bg-[#11131a] border border-white/10 overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10">
        <p className="text-xs font-mono text-blue-400 tracking-widest">
          PROBLEMSET
        </p>
        <h1 className="mt-1 text-lg font-semibold text-white">
          Solved Problems
        </h1>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 px-5 py-4 border-b border-white/10">
        <input
          type="text"
          placeholder="Search by title or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            flex-1 rounded-md bg-[#0b0d13]
            border border-white/10 px-3 py-2
            text-sm text-white placeholder:text-white/30
            focus:outline-none focus:border-blue-500/40
            focus:ring-2 focus:ring-blue-500/20
          "
        />

        <div className="flex gap-2 text-sm font-mono">
          {["all", "easy", "medium", "hard"].map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              className={`px-3 py-2 rounded-md border border-white/10 transition
                ${
                  difficulty === level
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }
              `}
            >
              {level.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 px-5 py-2 text-xs text-white/50 font-mono border-b border-white/10 sticky top-0 bg-[#11131a] z-10">
        <div className="col-span-1">#</div>
        <div className="col-span-7">Title</div>
        <div className="col-span-2">Difficulty</div>
        <div className="col-span-2">Slug</div>
      </div>

      {/* Rows */}
      <div className="h-120 overflow-y-auto no-scrollbar">
      {loading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))
      ) : filteredProblems.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-white/40 font-mono">
          No matching problems found.
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
