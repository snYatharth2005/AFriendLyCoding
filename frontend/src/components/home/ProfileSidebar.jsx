import { useEffect, useState } from "react";
import { getUserProfile } from "../../api/axiosClient";
import { NavLink } from "react-router-dom";

const ProfileSidebar = ({ solvedCount }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const username = localStorage.getItem("username");
        if (!username) return;
        const profile = await getUserProfile(username);
        setUserProfile(profile);
      } catch (e) {
        console.error("Error fetching user profile:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const username = localStorage.getItem("username") || "user";
  const initial  = username[0]?.toUpperCase();

  /* ── Skeleton ── */
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-5 animate-pulse">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl bg-white/[0.07]" />
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-white/[0.07] rounded w-3/4" />
              <div className="h-3 bg-white/[0.05] rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-2.5">
            {[1,2,3].map(i => (
              <div key={i} className="h-3 bg-white/[0.05] rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Solved",  value: solvedCount, color: "text-[#00d084]" },
    { label: "Rank",    value: "—",         color: "text-[#8890a8]" },
    { label: "Streak",  value: "—",         color: "text-[#ffc01e]" },
  ];

  return (
    <div className="sticky top-24 space-y-4">

      {/* ── Profile card ── */}
      <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.4)] overflow-hidden">

        {/* Subtle top gradient bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[#00d084] via-[#06b6d4] to-[#3b82f6]" />

        <div className="p-5">
          {/* Avatar + name */}
          <NavLink
            to="/profile/me"
            className="flex items-center gap-3 mb-5 group"
          >
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#3b82f6] flex items-center justify-center text-lg font-bold text-white shadow-[0_0_16px_rgba(168,85,247,0.3)] overflow-hidden">
                {userProfile?.avatar ? (
                  <img
                    src={userProfile.avatar}
                    alt={username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initial
                )}
              </div>
              {/* Online dot */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#00d084] rounded-full border-2 border-[#11131a]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#f0f2f8] group-hover:text-[#00d084] transition-colors truncate">
                {userProfile?.realName || "User"}
              </p>
              <p className="text-xs text-[#50566a] font-mono truncate">
                @{username}
              </p>
            </div>
          </NavLink>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {stats.map(({ label, value, color }) => (
              <div
                key={label}
                className="bg-[#161820] rounded-xl py-3 text-center border border-white/[0.05]"
              >
                <div className={`text-lg font-bold font-mono ${color}`}>
                  {value}
                </div>
                <div className="text-[10px] text-[#50566a] mt-0.5 uppercase tracking-wider">
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar toward 500 */}
          <div className="mb-4">
            <div className="flex justify-between mb-1.5">
              <span className="text-[11px] text-[#50566a] font-mono">Progress to 3000</span>
              <span className="text-[11px] text-[#8890a8] font-mono">
                {solvedCount}/3000
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00d084] to-[#06b6d4] rounded-full transition-all duration-700"
                style={{ width: `${Math.min((solvedCount / 3000) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* ── Difficulty mini-breakdown ── */}
      <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <p className="text-[10px] font-mono text-[#50566a] tracking-[0.15em] uppercase mb-3">
          DIFFICULTY_SPLIT
        </p>
        {[
          { label: "Easy",   color: "#00d084", pct: 55 },
          { label: "Medium", color: "#ffc01e", pct: 31 },
          { label: "Hard",   color: "#ef4743", pct: 14 },
        ].map(({ label, color, pct }) => (
          <div key={label} className="mb-3 last:mb-0">
            <div className="flex justify-between mb-1">
              <span className="text-xs font-mono font-semibold" style={{ color }}>{label}</span>
              <span className="text-xs font-mono text-[#50566a]">{pct}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default ProfileSidebar;
