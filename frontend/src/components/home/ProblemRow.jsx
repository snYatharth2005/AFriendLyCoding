/* ── Difficulty badge styles ── */
const difficultyBadge = {
  easy: {
    text:   "text-[#00d084]",
    bg:     "bg-[#00d084]/10",
    border: "border-[#00d084]/20",
    label:  "EASY",
  },
  medium: {
    text:   "text-[#ffc01e]",
    bg:     "bg-[#ffc01e]/10",
    border: "border-[#ffc01e]/20",
    label:  "MEDIUM",
  },
  hard: {
    text:   "text-[#ef4743]",
    bg:     "bg-[#ef4743]/10",
    border: "border-[#ef4743]/20",
    label:  "HARD",
  },
};

const ProblemRow = ({ question }) => {
  const openProblem = () => {
    if (!question.difficulty) return;
    window.open(
      `https://leetcode.com/problems/${question.slug}/description/`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const diff   = question.difficulty?.toLowerCase();
  const badge  = difficultyBadge[diff];
  const hasUsers = question.users?.length > 0;

  return (
    <div
      onClick={openProblem}
      className="
        grid grid-cols-[48px_1fr_90px_120px_110px] gap-3
        items-center px-5 py-3.5
        border-b border-white/[0.04]
        hover:bg-white/[0.025] cursor-pointer
        transition-colors duration-150 group
      "
    >
      {/* # */}
      <div className="text-xs font-mono text-[#30354a] group-hover:text-[#50566a] transition-colors">
        {question.frontendId}
      </div>

      {/* Title */}
      <div className="min-w-0">
        <span className="text-sm text-[#c8ccd8] group-hover:text-[#00d084] transition-colors duration-150 font-medium truncate block">
          {question.title}
        </span>
      </div>

      {/* Difficulty badge */}
      <div>
        {badge ? (
          <span
            className={`
              inline-flex items-center px-2 py-0.5
              rounded-md border text-[10px] font-mono font-semibold
              ${badge.text} ${badge.bg} ${badge.border}
            `}
          >
            {badge.label}
          </span>
        ) : (
          <span className="text-xs text-[#30354a] font-mono">—</span>
        )}
      </div>

      {/* Slug */}
      <div className="text-[11px] text-[#30354a] font-mono truncate group-hover:text-[#50566a] transition-colors">
        {question.slug}
      </div>

      {/* Avatar stack */}
      <div>
        {hasUsers ? (
          <div className="flex items-center -space-x-2.5">
            {question.users.slice(0, 4).map((u) =>
              u?.avatar ? (
                <img
                  key={u.username}
                  src={u.avatar}
                  alt={u.username}
                  title={u.username}
                  className="
                    w-7 h-7 rounded-full
                    border-2 border-[#11131a]
                    object-cover flex-shrink-0
                    hover:z-10 hover:scale-110
                    transition-transform duration-200
                  "
                />
              ) : (
                <div
                  key={u.username}
                  title={u.username}
                  className="
                    w-7 h-7 rounded-full flex-shrink-0
                    bg-gradient-to-br from-[#3b82f6] to-[#a855f7]
                    border-2 border-[#11131a]
                    flex items-center justify-center
                    text-[10px] text-white font-bold
                    hover:z-10 hover:scale-110
                    transition-transform duration-200
                  "
                >
                  {u.username?.[0]?.toUpperCase()}
                </div>
              )
            )}
            {question.users.length > 4 && (
              <div
                className="
                  w-7 h-7 rounded-full flex-shrink-0
                  bg-[#1c1e28] border-2 border-[#11131a]
                  flex items-center justify-center
                  text-[10px] text-[#8890a8] font-mono font-medium
                "
              >
                +{question.users.length - 4}
              </div>
            )}
          </div>
        ) : (
          <span className="text-xs text-[#30354a]">—</span>
        )}
      </div>
    </div>
  );
};

export default ProblemRow;
