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
    <div ref={wrapperRef} className="relative w-full max-w-md">
      {/* ================= SEARCH INPUT ================= */}
      <div className="bg-[#11131a] border border-white/10 rounded-xl px-4 py-2 shadow-md">
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="
            w-full bg-transparent
            text-sm text-white
            placeholder-white/40
            focus:outline-none
          "
        />
      </div>

      {/* ================= SEARCH RESULTS ================= */}
      {open && (
        <div
          className="
            absolute mt-2 w-full
            bg-[#0f1117]
            border border-white/10
            rounded-xl
            shadow-2xl
            overflow-hidden
            z-50
          "
        >
          {Array.isArray(results) && results.length > 0 ? (
            results.map((user) => (
              <div
                key={user.id}
                onClick={() => {
                  navigate(`/profile/${user.username}`);
                  setQuery("");
                  setOpen(false);
                }}
                className="
                  flex items-center gap-3
                  px-4 py-3
                  cursor-pointer
                  hover:bg-white/5
                  transition
                "
              >
                {/* Avatar */}
                <div
                  className="
                  w-9 h-9 rounded-full
                  bg-blue-600/30
                  flex items-center justify-center
                  text-blue-400 font-semibold
                "
                >
                  {user.avatar ? <img src={user.avatar} alt={user.username} className="w-9 h-9 rounded-full" /> : user.username[0].toUpperCase()}
                </div>

                {/* User Info */}
                <div className="flex flex-col">
                  <span className="text-sm text-white font-medium">
                    {user.username}
                  </span>
                  <span className="text-xs text-white/40">
                    {user.name || "AFriendlyCoding user"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-white/40">
              No users found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
