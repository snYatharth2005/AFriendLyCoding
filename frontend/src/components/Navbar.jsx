import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { logo } from "../assets/assets";
import SearchBar from "./SearchBar";
import { getIncomingFriendRequests } from "../api/axiosClient";

const Navbar = () => {
  const username = localStorage.getItem("username");
  const location = useLocation();
  const currentPath = location.pathname;

  const [isMobile, setIsMobile] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  /* ================= SCREEN SIZE ================= */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ================= FRIEND BADGE ================= */
  useEffect(() => {
    if (!username) return;
    const loadRequests = async () => {
      try {
        const data = await getIncomingFriendRequests();
        setPendingCount(data.length);
      } catch {
        setPendingCount(0);
      }
    };
    loadRequests();
    const interval = setInterval(loadRequests, 30000);
    return () => clearInterval(interval);
  }, [username]);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const toggleDropdown = () => {
    if (isMobile) setOpenDropdown((prev) => !prev);
  };

  /* ================= ACTIVE LINK STYLE ================= */
  const navLinkStyle = ({ isActive }) =>
    `text-sm font-medium transition-all duration-200 px-1 pb-0.5 border-b-2 ${
      isActive
        ? "text-[#00d084] border-[#00d084]"
        : "text-[#8890a8] border-transparent hover:text-[#f0f2f8]"
    }`;

  return (
    <nav className="w-full fixed top-0 left-0 z-50 px-6 py-3 bg-transparent">
      <div
        className="
          max-w-[1400px] mx-auto
          flex items-center justify-between gap-4
          bg-[#11131a]/90 backdrop-blur-md
          border border-white/[0.08]
          rounded-2xl px-6 py-3
          shadow-[0_1px_0_rgba(255,255,255,0.04),0_4px_24px_rgba(0,0,0,0.4)]
        "
      >
        {/* ================= LOGO ================= */}
        <NavLink to="/home" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00d084] to-[#06b6d4] flex items-center justify-center shadow-[0_0_16px_rgba(0,208,132,0.3)]">
            <img src={logo} alt="logo" className="h-5 w-5" />
          </div>
          <span className="text-[15px] font-semibold text-[#f0f2f8] tracking-tight hidden sm:block">
            AFriendlyCoding
          </span>
        </NavLink>

        {/* ================= NAV LINKS ================= */}
        <ul className="hidden md:flex items-center gap-6">
          <li>
            <NavLink to="/home" className={navLinkStyle}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/problems" className={navLinkStyle}>
              Problems
            </NavLink>
          </li>
          <li className="relative">
            <NavLink to="/friends" className={navLinkStyle}>
              Friends
            </NavLink>
            {pendingCount > 0 && (
              <span
                className="
                  absolute -top-2 -right-3
                  bg-[#ef4743] text-white text-[10px] font-bold
                  min-w-[18px] h-[18px] px-1
                  rounded-full flex items-center justify-center
                  shadow-[0_0_8px_rgba(239,71,67,0.5)]
                "
              >
                {pendingCount}
              </span>
            )}
          </li>
          <li>
            <NavLink to="/stats" className={navLinkStyle}>
              Stats
            </NavLink>
          </li>
        </ul>

        {/* ================= SEARCH ================= */}
        <div className="hidden md:flex flex-1 max-w-xs justify-center">
          <SearchBar />
        </div>

        {/* ================= RIGHT ACTIONS ================= */}
        <div className="flex items-center gap-3">
          {/* ⌘K hint */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-[11px] text-[#50566a] font-mono">
            <span>⌘K</span>
          </div>

          {!username ? (
            currentPath === "/login" ? (
              <NavLink
                to="/register"
                className="
                  relative overflow-hidden
                  px-4 py-2 rounded-xl text-sm font-semibold text-black
                  bg-gradient-to-r from-[#00d084] to-[#00b874]
                  transition-all duration-200 hover:-translate-y-px
                  shadow-[0_4px_16px_rgba(0,208,132,0.25)]
                "
              >
                Register
              </NavLink>
            ) : (
              <NavLink
                to="/login"
                className="
                  px-4 py-2 rounded-xl text-sm font-semibold text-black
                  bg-gradient-to-r from-[#00d084] to-[#00b874]
                  transition-all duration-200 hover:-translate-y-px
                  shadow-[0_4px_16px_rgba(0,208,132,0.25)]
                "
              >
                Login
              </NavLink>
            )
          ) : (
            <div
              className={`relative group ${isMobile ? "" : "cursor-pointer"}`}
              onClick={toggleDropdown}
            >
              {/* USER BUTTON */}
              <button
                className="
                  flex items-center gap-2.5
                  px-4 py-2 rounded-xl
                  bg-[#161820] border border-white/[0.08]
                  text-sm font-medium text-[#f0f2f8]
                  transition-all duration-200
                  hover:border-white/[0.14] hover:bg-[#1c1e28]
                "
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#a855f7] to-[#3b82f6] flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
                  {username?.[0]?.toUpperCase()}
                </div>
                <span className="truncate max-w-[90px]">{username}</span>
                <svg className="w-3.5 h-3.5 text-[#50566a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* DROPDOWN */}
              <div
                className={`
                  absolute right-0 top-full mt-2 w-44
                  bg-[#11131a] border border-white/[0.08] rounded-xl
                  shadow-[0_8px_32px_rgba(0,0,0,0.5)]
                  overflow-hidden
                  transition-all duration-200 ease-out
                  ${
                    isMobile
                      ? openDropdown
                        ? "opacity-100 visible translate-y-0"
                        : "opacity-0 invisible -translate-y-2"
                      : "opacity-0 invisible -translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0"
                  }
                `}
              >
                <NavLink
                  to={`/profile/${username}`}
                  className="
                    flex items-center gap-2.5 px-4 py-3
                    text-sm text-[#8890a8] hover:text-[#f0f2f8] hover:bg-white/[0.04]
                    transition-colors border-b border-white/[0.06]
                  "
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="
                    w-full flex items-center gap-2.5 px-4 py-3
                    text-sm text-[#ef4743] hover:bg-[#ef4743]/10
                    transition-colors
                  "
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
