import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchUsers } from "../api/axiosClient";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const data = await searchUsers(query);
        setResults(Array.isArray(data) ? data : []);
        setOpen(true);
      } catch {
        setResults([]);
        setOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  /* ================= CLOSE ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-sm">
      {/* ================= INPUT ================= */}
      <div className="relative flex items-center">
        <svg
          className="absolute left-3 w-4 h-4 text-[#50566a] pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="
            w-full
            bg-[#161820] border border-white/[0.08]
            rounded-xl pl-9 pr-4 py-2
            text-sm text-[#f0f2f8] placeholder-[#50566a]
            focus:outline-none focus:border-[#00d084]/40
            focus:ring-2 focus:ring-[#00d084]/10
            transition-all duration-200
          "
        />
      </div>

      {/* ================= DROPDOWN ================= */}
      {open && (
        <div
          className="
            absolute top-full mt-2 w-full z-50
            bg-[#11131a] border border-white/[0.08]
            rounded-xl overflow-hidden
            shadow-[0_8px_32px_rgba(0,0,0,0.5)]
          "
        >
          {results.length > 0 ? (
            results.map((user) => (
              <div
                key={user.id}
                onClick={() => {
                  navigate(`/profile/${user.username}`);
                  setQuery("");
                  setOpen(false);
                }}
                className="
                  flex items-center gap-3 px-4 py-3
                  cursor-pointer hover:bg-white/[0.04]
                  transition-colors border-b border-white/[0.04] last:border-0
                "
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#a855f7] to-[#3b82f6] flex items-center justify-center text-sm font-bold text-white flex-shrink-0 overflow-hidden">
                  {user.avatar
                    ? <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                    : user.username[0].toUpperCase()
                  }
                </div>

                {/* Info */}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#f0f2f8] truncate">
                    {user.username}
                  </p>
                  <p className="text-xs text-[#50566a] truncate">
                    {user.name || "AFriendlyCoding user"}
                  </p>
                </div>

                <svg className="w-4 h-4 text-[#50566a] ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))
          ) : (
            <div className="px-4 py-4 text-sm text-[#50566a] text-center font-mono">
              No users found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
