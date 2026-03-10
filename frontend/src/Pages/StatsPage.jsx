import React from "react";

const StatsPage = () => {
  const stats = {
    totalSolved: 248,
    totalQuestions: 3200,
    easy: 120,
    medium: 92,
    hard: 36,
  };

  const completion   = ((stats.totalSolved / stats.totalQuestions) * 100).toFixed(1);
  const radius       = 60;
  const circumference = 2 * Math.PI * radius;
  const offset       = circumference - (completion / 100) * circumference;

  const heatLevels = [
    0,1,2,3,4,2,1, 0,2,3,4,1,0,2, 1,3,4,2,0,3,1,
    0,1,2,4,3,1,0, 2,4,3,1,0,2,3, 1,0,3,4,2,1,0,
    3,2,1,0,4,3,2,
  ];
  const cellColors = [
    "bg-white/[0.04]",
    "bg-[#00d084]/20",
    "bg-[#00d084]/40",
    "bg-[#00d084]/65",
    "bg-[#00d084]",
  ];

  return (
    <div className="min-h-screen bg-[#0b0d13] text-[#f0f2f8] py-8 px-6">
      <div className="max-w-[860px] mx-auto space-y-5">

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
              <div className="relative flex-shrink-0">
                <img
                  src="https://i.pravatar.cc/150?img=3"
                  className="w-20 h-20 rounded-2xl border border-white/[0.1] object-cover"
                  alt="avatar"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00d084] rounded-full border-2 border-[#11131a]" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold tracking-tight">Yatharth Singh</h2>
                <p className="text-sm text-[#50566a] mt-0.5">Competitive Programmer</p>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#ffc01e]/10 border border-[#ffc01e]/20 text-xs font-mono text-[#ffc01e]">
                    🔥 45-day streak
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#00d084]/10 border border-[#00d084]/20 text-xs font-mono text-[#00d084]">
                    {completion}% complete
                  </span>
                </div>
              </div>
              {/* Quick stat pills */}
              <div className="hidden sm:grid grid-cols-3 gap-3 flex-shrink-0">
                {[
                  { label: "Solved", value: stats.totalSolved, color: "text-[#00d084]" },
                  { label: "Easy",   value: stats.easy,        color: "text-[#00d084]" },
                  { label: "Hard",   value: stats.hard,        color: "text-[#ef4743]" },
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
                <span className="text-4xl font-bold font-mono text-[#f0f2f8]">{stats.totalSolved}</span>
                <span className="text-xs text-[#50566a] mt-0.5 font-mono">/ {stats.totalQuestions.toLocaleString()}</span>
              </div>
            </div>

            {/* Bars */}
            <div className="flex-1 w-full space-y-5">
              <DifficultyBar label="Easy"   solved={stats.easy}   total={1200} color="bg-[#00d084]" textColor="text-[#00d084]" />
              <DifficultyBar label="Medium" solved={stats.medium} total={1400} color="bg-[#ffc01e]" textColor="text-[#ffc01e]" />
              <DifficultyBar label="Hard"   solved={stats.hard}   total={600}  color="bg-[#ef4743]" textColor="text-[#ef4743]" />
            </div>
          </div>
        </div>

        {/* ══ ACTIVITY HEATMAP ══ */}
        <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[10px] font-mono text-[#50566a] tracking-[0.15em] uppercase">ACTIVITY_HEATMAP</p>
            <span className="text-xs text-[#50566a] font-mono">{stats.totalSolved} solves this year</span>
          </div>
          <div className="grid grid-cols-7 gap-2 max-w-sm">
            {heatLevels.map((level, i) => (
              <div key={i} className={`w-full aspect-square rounded-md ${cellColors[level]} transition-colors`} />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="text-[11px] text-[#50566a]">Less</span>
            {cellColors.map((c, i) => <div key={i} className={`w-3.5 h-3.5 rounded-sm ${c}`} />)}
            <span className="text-[11px] text-[#50566a]">More</span>
          </div>
        </div>

      </div>
    </div>
  );
};

const DifficultyBar = ({ label, solved, total, color, textColor }) => {
  const pct = Math.min((solved / total) * 100, 100).toFixed(1);
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className={`text-xs font-mono font-semibold ${textColor}`}>{label}</span>
        <span className="text-xs font-mono text-[#50566a]">{solved} <span className="text-[#30354a]">/</span> {total}</span>
      </div>
      <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export default StatsPage;
