import { NavLink } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#0b0d13] flex items-center justify-center px-6">
      <div className="max-w-2xl text-center">

        <p className="text-xs font-mono text-blue-400 tracking-widest">
          LEETCODE TRACKER
        </p>

        <h1 className="mt-4 text-4xl font-bold text-white leading-tight">
          Track your problem-solving journey
        </h1>

        <p className="mt-4 text-white/60 text-lg">
          A focused dashboard to track solved problems, progress, and momentum.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <NavLink
            to="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-500 transition"
          >
            Sign in
          </NavLink>

          <NavLink
            to="/register"
            className="px-6 py-3 border border-white/20 text-white rounded-md hover:bg-white/5 transition"
          >
            Create account
          </NavLink>
        </div>

        <p className="mt-10 text-xs text-white/40 font-mono">
          Built for consistency, not noise.
        </p>
      </div>
    </div>
  );
};

export default Landing;
