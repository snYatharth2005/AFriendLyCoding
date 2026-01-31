import { Link } from "react-router-dom";

const FriendCard = ({ user }) => {

  const name = user?.name || "User";
  const initial = name[0].toUpperCase();

  return (
    <Link
      to={`/profile/${name}`}
      className="
        group
        flex items-center justify-between
        px-3 py-2.5
        rounded-xl
        bg-[#0f1117]
        hover:bg-[#141824]
        transition-all
        duration-200
        border border-white/5
        hover:border-blue-500/40
        hover:shadow-lg
      "
    >

      {/* LEFT */}
      <div className="flex items-center gap-3">

        {/* Avatar */}
        {user?.avatar ? (
          <img
            src={user.avatar}
            className="
              w-10 h-10 rounded-full
              border border-white/10
              group-hover:scale-105
              transition
            "
          />
        ) : (
          <div
            className="
              w-10 h-10 rounded-full
              bg-blue-600/20
              flex items-center justify-center
              text-blue-400 font-semibold
              group-hover:scale-105
              transition
            "
          >
            {initial}
          </div>
        )}

        {/* Text */}
        <div className="min-w-0">

          <p className="text-sm text-gray-300 font-medium truncate">
            {name}
          </p>

          {user?.leetcodeUsername && (
            <p className="text-xs text-white/40 truncate">
              @{user.leetcodeUsername}
            </p>
          )}

        </div>

      </div>

      {/* Arrow */}
      <span
        className="
          text-white/20
          group-hover:text-blue-400
          group-hover:translate-x-1
          transition-all
        "
      >
        →
      </span>

    </Link>
  );
};

export default FriendCard;
