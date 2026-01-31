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

  if (loading) {
    return (
      <div className="rounded-xl bg-[#11131a] border border-white/10 p-5 text-white/50">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="sticky top-6 space-y-4">
      {/* Profile Card */}
      <div className="rounded-xl bg-[#11131a] border border-white/10 p-5">
        <NavLink
          to="/profile/me"
          className="flex items-center space-x-2 cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-mono overflow-hidden">
              {userProfile?.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt={localStorage.getItem("username")}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                "U"
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-white">
                {userProfile?.realName || "User"}
              </p>
              <p className="text-xs text-white/50 font-mono">
                {userProfile?.username || "coder profile"}
              </p>
            </div>
          </div>
        </NavLink>

        {/* Stats */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-white/70">
            <span>Solved</span>
            <span className="font-mono text-white">{solvedCount}</span>
          </div>
          <div className="flex justify-between text-white/70">
            <span>Rank</span>
            <span className="font-mono text-white">—</span>
          </div>
          <div className="flex justify-between text-white/70">
            <span>Streak</span>
            <span className="font-mono text-white">—</span>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="rounded-xl bg-[#11131a] border border-white/10 p-4">
        <p className="text-xs font-mono text-white/50 mb-3">QUICK_ACTIONS</p>
        <div className="space-y-2 text-sm">
          <button className="w-full text-left text-white/70 hover:text-white transition">
            → View Profile
          </button>
          <button className="w-full text-left text-white/70 hover:text-white transition">
            → Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
