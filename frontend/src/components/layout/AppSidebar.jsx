import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getUserProfile, getIncomingFriendRequests } from "../../api/axiosClient";

const NAV = [
  {
    to: "/home",
    label: "Dashboard",
    end: true, // exact match only — fixes "Problems also active on /home"
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    to: "/problems",
    label: "Problems",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    to: "/friends",
    label: "Friends",
    badge: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    to: "/stats",
    label: "Stats",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    to: "/compare",
    label: "Compare",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
        <path d="M2 12l4-4 4 4" /><path d="M22 12l-4-4-4 4" />
      </svg>
    ),
  },
  {
    to: "/profile/me",
    label: "Profile",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

const AppSidebar = () => {
  const [profile,      setProfile]      = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  const username = localStorage.getItem("username") || "user";
  const initial  = username[0]?.toUpperCase();

  useEffect(() => {
    getUserProfile(username).then(setProfile).catch(() => {});
  }, [username]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getIncomingFriendRequests();
        setPendingCount(data?.length ?? 0);
      } catch { setPendingCount(0); }
    };
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const linkCls = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
      isActive
        ? "bg-[#00d084]/10 text-[#00d084] border border-[#00d084]/20"
        : "text-[#8890a8] hover:text-[#f0f2f8] hover:bg-white/[0.04] border border-transparent"
    }`;

  return (
    <aside className="fixed top-0 left-0 z-40 w-[220px] h-screen bg-[#11131a] border-r border-white/[0.07] flex flex-col shadow-[2px_0_24px_rgba(0,0,0,0.4)]">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/[0.06]">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00d084] to-[#06b6d4] flex items-center justify-center shadow-[0_0_16px_rgba(0,208,132,0.3)] flex-shrink-0">
          <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="text-[15px] font-bold text-[#f0f2f8] tracking-tight">AFriendlyCoding</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto no-scrollbar">
        <p className="text-[10px] font-mono text-[#30354a] tracking-[0.15em] uppercase px-3 mb-2">NAVIGATE</p>

        {NAV.map(({ to, label, icon, badge, end }) => (
          <NavLink key={label} to={to} end={end} className={linkCls}>
            <span className="flex-shrink-0 opacity-80">{icon}</span>
            <span className="flex-1">{label}</span>
            {badge && pendingCount > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 bg-[#ef4743] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(239,71,67,0.5)]">
                {pendingCount}
              </span>
            )}
          </NavLink>
        ))}

        <div className="h-px bg-white/[0.05] my-3" />
        <p className="text-[10px] font-mono text-[#30354a] tracking-[0.15em] uppercase px-3 mb-2">ACCOUNT</p>

        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#50566a] hover:text-[#ef4743] hover:bg-[#ef4743]/[0.06] border border-transparent transition-all duration-150">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </nav>

      {/* User card */}
      <div className="p-3 border-t border-white/[0.06]">
        <NavLink to="/profile/me"
          className="flex items-center gap-3 p-2.5 rounded-xl bg-[#161820] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 group">
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#3b82f6] flex items-center justify-center text-sm font-bold text-white overflow-hidden">
              {profile?.avatar
                ? <img src={profile.avatar} alt={username} className="w-full h-full object-cover" />
                : initial}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#00d084] rounded-full border border-[#161820]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#f0f2f8] truncate group-hover:text-[#00d084] transition-colors">
              {profile?.realName || username}
            </p>
            <p className="text-[10px] text-[#50566a] font-mono truncate">@{username}</p>
          </div>
          <svg className="w-3.5 h-3.5 text-[#30354a] group-hover:text-[#00d084] transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </NavLink>
      </div>
    </aside>
  );
};

export default AppSidebar;
