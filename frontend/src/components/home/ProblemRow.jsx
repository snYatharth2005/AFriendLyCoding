const difficultyStyles = {
  easy: "text-green-400",
  medium: "text-yellow-400",
  hard: "text-red-400",
};

const ProblemRow = ({ question }) => {
  const openProblem = () => {
    if(!question.difficulty) return;
    window.open(
      `https://leetcode.com/problems/${question.slug}/description/`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div
      onClick={openProblem}
      className="
        grid grid-cols-12 px-5 py-3
        text-sm text-white
        border-b border-white/5
        hover:bg-white/5
        cursor-pointer
        transition
      "
    >
      <div className="col-span-1 text-white/40 font-mono">
        {question.frontendId}
      </div>

      <div className="col-span-7 font-medium hover:text-blue-400 transition">
        {question.title}
      </div>

      <div
        className={`col-span-2 font-mono capitalize ${
          difficultyStyles[question.difficulty?.toLowerCase()] ||
          "text-white/40"
        }`}
      >
        {question.difficulty || "unknown"}
      </div>

      <div className="col-span-2 text-xs text-white/40 font-mono truncate">
        {question.slug}
      </div>
    </div>
  );
};

export default ProblemRow;
