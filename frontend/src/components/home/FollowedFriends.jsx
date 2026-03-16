import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getAcceptedFriends, getFriendUser } from "../../api/axiosClient";
import FriendList from "../FriendList";

const medalFor = (i) => ["🥇", "🥈", "🥉"][i] ?? null;

const FollowedFriends = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading,     setLoading]     = useState(true);

  const loggedUser = localStorage.getItem("username");

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch friends + self
        const raw = (await getAcceptedFriends()) || [];

        const friendUsernames = raw.map(f =>
          loggedUser === f.sender ? f.receiver : f.sender
        );

        // Include self
        const allUsernames = [loggedUser, ...friendUsernames];

        const dtos = await Promise.all(
          allUsernames.map(u => getFriendUser(u).catch(() => null))
        );

        const entries = dtos
          .map((dto, i) => ({
            name:     dto?.username         ?? allUsernames[i],
            avatar:   dto?.avatar           ?? null,
            solved:   dto?.totalProblems    ?? 0,
            streak:   dto?.streak           ?? 0,
            thisWeek: dto?.solvedInAWeek    ?? 0,
            isSelf:   allUsernames[i] === loggedUser,
          }))
          .filter(e => e.name);

        // Sort by solved desc, then streak desc
        entries.sort((a, b) =>
          b.solved - a.solved || b.streak - a.streak
        );

        // Assign global rank
        entries.forEach((e, i) => { e.rank = i + 1; });

        setLeaderboard(entries);
      } catch {
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Show top 10; if self is outside top 10, show top 9 + self
  const selfEntry  = leaderboard.find(e => e.isSelf);
  const selfRank   = selfEntry?.rank ?? null;
  const inTopTen   = selfRank !== null && selfRank <= 10;

  let displayList;
  if (inTopTen || leaderboard.length <= 10) {
    displayList = leaderboard.slice(0, 10);
  } else {
    // top 9 + separator + self
    displayList = [...leaderboard.slice(0, 9), { isSeparator: true }, selfEntry];
  }

  return (
    <div className="sticky top-24 space-y-4">

      {/* ── Following panel ── */}
      <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <div className="h-1 w-full bg-gradient-to-r from-[#3b82f6] via-[#a855f7] to-[#06b6d4]" />
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-mono text-[#3b82f6] tracking-[0.15em] uppercase">FOLLOWING</p>
              <p className="text-xs text-[#50566a] mt-0.5">People you follow</p>
            </div>
            <NavLink to="/friends" className="text-xs text-[#3b82f6] hover:text-[#60a5fa] transition-colors flex items-center gap-1">
              View all →
            </NavLink>
          </div>
          <div className="h-px bg-white/[0.06] mb-3" />
          <FriendList />
        </div>
      </div>

      {/* ── Leaderboard ── */}
      <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <div className="h-1 w-full bg-gradient-to-r from-[#ffc01e] via-[#00d084] to-[#06b6d4]" />
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-mono text-[#ffc01e] tracking-[0.15em] uppercase">LEADERBOARD</p>
              <p className="text-xs text-[#50566a] mt-0.5">Ranked by problems solved</p>
            </div>
            <NavLink to="/friends" className="text-xs text-[#3b82f6] hover:text-[#60a5fa] transition-colors flex items-center gap-1">
              Full →
            </NavLink>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center gap-2.5 px-2 py-2 animate-pulse">
                  <div className="w-5 h-3 bg-white/[0.07] rounded flex-shrink-0" />
                  <div className="w-7 h-7 rounded-lg bg-white/[0.07] flex-shrink-0" />
                  <div className="flex-1 h-3 bg-white/[0.07] rounded" />
                  <div className="w-8 h-3 bg-white/[0.04] rounded" />
                </div>
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="flex flex-col items-center py-6 gap-2">
              <span className="text-3xl opacity-20">🏆</span>
              <p className="text-xs text-[#50566a]">Add friends to see rankings</p>
            </div>
          ) : (
            <div className="space-y-1">
              {displayList.map((entry, idx) => {
                // Separator row
                if (entry.isSeparator) return (
                  <div key="sep" className="flex items-center gap-2 py-1 px-2">
                    <div className="flex-1 border-t border-dashed border-white/[0.08]" />
                    <span className="text-[9px] font-mono text-[#30354a]">···</span>
                    <div className="flex-1 border-t border-dashed border-white/[0.08]" />
                  </div>
                );

                const medal   = medalFor(entry.rank - 1);
                const rankDisp = medal ?? `#${entry.rank}`;
                const initial  = (entry.name || "U")[0].toUpperCase();

                return (
                  <div key={entry.name}
                    className={`
                      flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-200
                      ${entry.isSelf
                        ? "bg-[#00d084]/[0.06] border border-[#00d084]/25 shadow-[0_0_12px_rgba(0,208,132,0.08)]"
                        : "hover:bg-white/[0.03] border border-transparent"
                      }
                    `}
                  >
                    {/* rank */}
                    <span className="text-sm w-5 text-center flex-shrink-0 leading-none">
                      {medal ?? <span className="text-[10px] font-mono text-[#50566a]">#{entry.rank}</span>}
                    </span>

                    {/* avatar */}
                    {entry.avatar ? (
                      <img src={entry.avatar} alt={entry.name}
                        className="w-7 h-7 rounded-lg object-cover border border-white/[0.08] flex-shrink-0" />
                    ) : (
                      <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold text-white
                        ${entry.isSelf ? "bg-gradient-to-br from-[#00d084] to-[#06b6d4]" : "bg-[#161820] border border-white/[0.08]"}`}>
                        {initial}
                      </div>
                    )}

                    {/* name */}
                    <span className={`text-xs font-mono flex-1 truncate ${entry.isSelf ? "text-[#00d084]" : "text-[#c8ccd8]"}`}>
                      {entry.name}
                      {entry.isSelf && (
                        <span className="ml-1.5 text-[9px] bg-[#00d084]/15 text-[#00d084] border border-[#00d084]/25 px-1 py-0.5 rounded font-semibold">
                          you
                        </span>
                      )}
                    </span>

                    {/* solved count */}
                    <span className="text-[11px] font-mono text-[#50566a] flex-shrink-0">
                      {entry.solved}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default FollowedFriends;