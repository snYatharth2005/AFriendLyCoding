import React, { useEffect, useState } from "react";
import { getSolvedQuestion } from "../api/axiosClient";
import ProfileSidebar from "../components/home/ProfileSidebar";
import ProblemSet from "../components/home/ProblemSet";
import FollowedFriends from "../components/home/FollowedFriends";

const Home = () => {
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getSolvedQuestion()
      .then((data) => setSolvedProblems(data || []))
      .catch((err) =>
        console.error("Error fetching solved problems:", err)
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0d13] pt-24 px-8">
      {/* pt-24 aligns content below floating navbar */}

      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-12 gap-8">

          {/* LEFT PANEL */}
          <aside className="col-span-12 lg:col-span-3">
            <div className="bg-[#11131a] border border-white/10 rounded-xl p-5 shadow-md">
              <ProfileSidebar solvedCount={solvedProblems.length} />
            </div>
          </aside>

          {/* CENTER PANEL */}
          <main className="col-span-12 lg:col-span-6">
            <div className="bg-[#11131a] border border-white/10 rounded-xl shadow-md overflow-hidden ">
              <ProblemSet
                problems={solvedProblems}
                loading={loading}
              />
            </div>
          </main>

          {/* RIGHT PANEL */}
          <aside className="col-span-12 lg:col-span-3">
            <div className="bg-[#11131a] border border-white/10 rounded-xl p-5 shadow-md">
              <FollowedFriends />
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
};

export default Home;