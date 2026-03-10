import { Link } from "react-router-dom";

/* Deterministic gradient per first letter */
const avatarGradient = (letter = "A") => {
  const gradients = [
    "from-[#a855f7] to-[#3b82f6]",   // A, F, K, P, U, Z
    "from-[#00d084] to-[#06b6d4]",   // B, G, L, Q, V
    "from-[#f59e0b] to-[#ef4743]",   // C, H, M, R, W
    "from-[#ec4899] to-[#a855f7]",   // D, I, N, S, X
    "from-[#06b6d4] to-[#3b82f6]",   // E, J, O, T, Y
  ];
  return gradients[letter.charCodeAt(0) % gradients.length];
};

const FriendCard = ({ user }) => {
  const name    = user?.name || "User";
  const initial = name[0].toUpperCase();
  const grad    = avatarGradient(initial);

  return (
    <Link
      to={`/profile/${name}`}
      className="
        flex items-center gap-3 px-3 py-2.5
        rounded-xl border border-transparent
        hover:bg-[#161820] hover:border-white/[0.08]
        transition-all duration-200 group
      "
    >
      {/* Avatar */}
      <div className="flex-shrink-0 relative">
        {user?.avatar ? (
          <img
            src={user.avatar}
            className="
              w-9 h-9 rounded-xl object-cover
              border border-white/[0.08]
              group-hover:scale-105 transition-transform duration-200
            "
            alt={name}
          />
        ) : (
          <div
            className={`
              w-9 h-9 rounded-xl flex-shrink-0
              bg-gradient-to-br ${grad}
              flex items-center justify-center
              text-sm font-bold text-white
              group-hover:scale-105 transition-transform duration-200
              shadow-[0_2px_8px_rgba(0,0,0,0.3)]
            `}
          >
            {initial}
          </div>
        )}
        {/* Online indicator */}
        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#00d084] rounded-full border border-[#11131a]" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#c8ccd8] group-hover:text-[#f0f2f8] transition-colors truncate">
          {name}
        </p>
        {user?.leetcodeUsername && (
          <p className="text-[11px] text-[#50566a] font-mono truncate">
            @{user.leetcodeUsername}
          </p>
        )}
      </div>

      {/* Arrow */}
      <svg
        className="w-3.5 h-3.5 text-[#30354a] group-hover:text-[#3b82f6] group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
};

export default FriendCard;
