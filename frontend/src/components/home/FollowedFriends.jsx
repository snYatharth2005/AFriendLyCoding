import FriendList from "../FriendList";
import { NavLink } from "react-router-dom";
const FollowedFriends = () => {
  return (
    <div
      className="
        sticky top-28
        relative
        rounded-2xl
        bg-gradient-to-b from-[#12151f] to-[#0f1117]
        border border-white/10
        shadow-xl
        p-4
      "
    >
      <div className="flex items-center justify-between mb-4">

        <div>
          <p className="text-[11px] tracking-widest text-blue-400">
            FOLLOWING
          </p>
          <p className="text-xs text-white/40">
            People you follow
          </p>
        </div>

        <NavLink
          className="
            text-xs text-blue-400
            hover:text-blue-300
            cursor-pointer
            transition
          "
          to="/friends"
        >
          View all →
        </NavLink>

      </div>

      <div className="h-px bg-white/10 mb-3" />

      <FriendList />
    </div>
  );
};

export default FollowedFriends;
