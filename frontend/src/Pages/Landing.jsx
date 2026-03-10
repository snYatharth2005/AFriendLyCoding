import { NavLink } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#0b0d13] flex items-center justify-center px-6 relative overflow-hidden">

      {/* ── Ambient glow blobs ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#00d084]/[0.06] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#3b82f6]/[0.05] rounded-full blur-[80px]" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-[#a855f7]/[0.04] rounded-full blur-[80px]" />
      </div>

      {/* ── Grid texture overlay ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 max-w-2xl w-full text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00d084]/10 border border-[#00d084]/20 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00d084] animate-pulse" />
          <span className="text-xs font-mono text-[#00d084] tracking-widest">
            LEETCODE TRACKER
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl font-bold text-[#f0f2f8] leading-tight tracking-tight mb-5">
          Track your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d084] to-[#06b6d4]">
            problem-solving
          </span>{" "}
          journey
        </h1>

        <p className="text-[#8890a8] text-lg leading-relaxed mb-10">
          A focused dashboard to track solved problems, compare progress with
          friends, and build momentum — one problem at a time.
        </p>

        {/* CTAs */}
        <div className="flex justify-center gap-3 flex-wrap">
          <NavLink
            to="/login"
            className="
              px-6 py-3 rounded-xl text-sm font-semibold text-black
              bg-gradient-to-r from-[#00d084] to-[#00b874]
              transition-all duration-200 hover:-translate-y-0.5
              shadow-[0_4px_20px_rgba(0,208,132,0.3)]
            "
          >
            Sign in
          </NavLink>
          <NavLink
            to="/register"
            className="
              px-6 py-3 rounded-xl text-sm font-medium text-[#f0f2f8]
              bg-[#11131a] border border-white/[0.1]
              transition-all duration-200 hover:border-white/[0.18] hover:bg-[#161820]
            "
          >
            Create account
          </NavLink>
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-3 gap-4 max-w-sm mx-auto">
          {[
            { value: "3,356", label: "Total Problems" },
            { value: "∞",     label: "Friend Battles" },
            { value: "🔥",    label: "Streaks Tracked" },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="bg-[#11131a] border border-white/[0.07] rounded-xl p-3"
            >
              <div className="text-xl font-bold font-mono text-[#f0f2f8]">{value}</div>
              <div className="text-xs text-[#50566a] mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-xs text-[#50566a] font-mono">
          Built for consistency, not noise.
        </p>
      </div>
    </div>
  );
};

export default Landing;
