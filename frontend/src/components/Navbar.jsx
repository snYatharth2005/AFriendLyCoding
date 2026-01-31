import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { logo } from "../assets/assets";
import SearchBar from "./SearchBar";
import { getIncomingFriendRequests } from "../api/axiosClient"; // ✅ NEW

const Navbar = () => {
  const username = localStorage.getItem("username");
  const location = useLocation();
  const currentPath = location.pathname;

  const [isMobile, setIsMobile] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);

  // 🔔 NEW
  const [pendingCount, setPendingCount] = useState(0);

  /* ================= SCREEN SIZE ================= */

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

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

  return (
    <nav className="w-full fixed top-0 left-0 z-50 px-8 py-4 bg-transparent">
      <div className="flex items-center justify-between gap-6">

        {/* ================= LEFT BLOCK ================= */}
        <div className="flex items-center space-x-8 bg-[#11131a] border border-white/10 rounded-xl px-6 py-3 shadow-md">

          <NavLink to="/home" className="flex items-center space-x-2">
            <img src={logo} alt="logo" className="h-9 w-9" />
            <span className="text-lg font-semibold text-white">
              AFriendlyCoding
            </span>
          </NavLink>

          <ul className="hidden md:flex space-x-6 text-sm text-white/60">

            <li>
              <NavLink to="/home" className="hover:text-white transition">
                Dashboard
              </NavLink>
            </li>

            <li>
              <NavLink to="/problems" className="hover:text-white transition">
                Problems
              </NavLink>
            </li>

            {/* 🔔 FRIENDS WITH BADGE */}
            <li className="relative">
              <NavLink to="/friends" className="hover:text-white transition">
                Friends
              </NavLink>

              {pendingCount > 0 && (
                <span
                  className="
                    absolute -top-2 -right-3
                    bg-red-500
                    text-white text-xs
                    px-2 py-0.5
                    rounded-full
                  "
                >
                  {pendingCount}
                </span>
              )}
            </li>

            <li>
              <NavLink to="/stats" className="hover:text-white transition">
                Stats
              </NavLink>
            </li>

          </ul>
        </div>

        {/* ================= MIDDLE BLOCK ================= */}
        <div className="hidden md:flex flex-1 justify-center">
          <SearchBar />
        </div>

        {/* ================= RIGHT BLOCK ================= */}
        <div className="flex items-center space-x-4 bg-[#11131a] border border-white/10 rounded-xl px-6 py-3 shadow-md">

          {/* ⌘K BLOCK (RESTORED) */}
          <div className="hidden sm:flex px-3 py-1.5 rounded-md bg-white/5 text-xs text-white/40 font-mono">
            ⌘K
          </div>

          {!username ? (
            currentPath === "/login" ? (
              <NavLink
                to="/register"
                className="relative group overflow-hidden px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md transition hover:scale-95"
              >
                <span className="relative z-10">Register</span>
                <span className="absolute inset-0 bg-blue-400 translate-y-full group-hover:translate-y-0 transition-transform"></span>
              </NavLink>
            ) : (
              <NavLink
                to="/login"
                className="relative group overflow-hidden px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md transition hover:scale-95"
              >
                <span className="relative z-10">Login</span>
                <span className="absolute inset-0 bg-blue-400 translate-y-full group-hover:translate-y-0 transition-transform"></span>
              </NavLink>
            )
          ) : (
            <div
              className={`relative group ${isMobile ? "" : "cursor-pointer"}`}
              onClick={toggleDropdown}
            >
              {/* USER BUTTON */}
              <span className="relative inline-block overflow-hidden px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md transition hover:scale-95">
                <span className="relative z-10 truncate max-w-[110px] block">
                  Hi, {username}
                </span>
                <span className="absolute inset-0 bg-blue-400 translate-y-full group-hover:translate-y-0 transition-transform"></span>
              </span>

              {/* DROPDOWN */}
              <div
                className={`
                  absolute left-0 right-0 top-full mt-2
                  transition-all duration-300 ease-out
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
                  className="block px-6 py-2 bg-[#11131a] border border-white/10 text-white rounded-md hover:bg-white/5 transition"
                >
                  Profile
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="mt-3 w-full px-6 py-2 bg-red-500/10 text-red-400 rounded-md hover:bg-red-500/20 transition"
                >
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
