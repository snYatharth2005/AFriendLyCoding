import FriendList from "../FriendList";
import { NavLink } from "react-router-dom";

const FollowedFriends = () => {
  return (
    <div className="sticky top-24 space-y-4">

      {/* ── Following panel ── */}
      <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)]">

        {/* Top gradient bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[#3b82f6] via-[#a855f7] to-[#06b6d4]" />

        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-mono text-[#3b82f6] tracking-[0.15em] uppercase">
                FOLLOWING
              </p>
              <p className="text-xs text-[#50566a] mt-0.5">
                People you follow
              </p>
            </div>
            <NavLink
              to="/friends"
              className="
                text-xs text-[#3b82f6] hover:text-[#60a5fa]
                transition-colors flex items-center gap-1
              "
            >
              View all →
            </NavLink>
          </div>

          <div className="h-px bg-white/[0.06] mb-3" />

          <FriendList />
        </div>
      </div>

      {/* ── Leaderboard teaser ── */}
      <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <p className="text-[10px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-3">
          WEEKLY_LEADERBOARD
        </p>
        {[
          { rank: "🥇", name: "You",        n: 12, color: "text-[#00d084]", you: true },
          { rank: "🥈", name: "sarahkim",   n: 9,  color: "text-[#8890a8]" },
          { rank: "🥉", name: "marcuslee",  n: 7,  color: "text-[#8890a8]" },
        ].map(({ rank, name, n, color, you }) => (
          <div
            key={name}
            className={`
              flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-1.5 last:mb-0
              ${you
                ? "bg-[#00d084]/[0.06] border border-[#00d084]/20"
                : "hover:bg-white/[0.03] border border-transparent"
              }
              transition-colors
            `}
          >
            <span className="text-base flex-shrink-0">{rank}</span>
            <span className={`text-sm font-mono flex-1 truncate ${color}`}>
              {name}
              {you && (
                <span className="ml-1.5 text-[10px] bg-[#00d084]/15 text-[#00d084] border border-[#00d084]/25 px-1.5 py-0.5 rounded font-semibold">
                  you
                </span>
              )}
            </span>
            <span className="text-xs font-mono text-[#3b82f6] flex-shrink-0">
              +{n}
            </span>
          </div>
        ))}

        <NavLink
          to="/friends"
          className="
            mt-3 flex items-center justify-center gap-1.5
            text-xs text-[#50566a] hover:text-[#8890a8]
            transition-colors pt-3 border-t border-white/[0.05]
          "
        >
          Full leaderboard →
        </NavLink>
      </div>

    </div>
  );
};

export default FollowedFriends;
