import { Search, Bell, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../layout/NotificationBell";

const Topbar = () => {
  const { user } = useAuth();

  return (
    <header
      className="
        h-20
        bg-slate-950/80 backdrop-blur-xl
        border-b border-slate-800/80
        flex items-center justify-between
        px-8
        text-white
        sticky top-0 z-40
      "
    >
      {/* Left Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Dashboard
        </h1>
        <p className="text-xs text-slate-400 font-medium">
          Welcome back, <span className="text-slate-200 font-semibold">{user?.fullName || "User"}</span> 👋
        </p>
      </div>

      {/* Right Action Items */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Search Input */}
        <div
          className="
            hidden md:flex items-center
            bg-slate-900/80
            border border-slate-800
            rounded-xl px-3.5 py-2
            w-64 focus-within:border-blue-500/50 transition-colors
          "
        >
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search medical profile..."
            className="
              bg-transparent
              outline-none
              ml-2.5
              text-xs text-white
              placeholder:text-slate-500
              w-full
            "
          />
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-800 border border-slate-700 rounded">
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        {/* <button
          title="Notifications"
          className="
            relative p-2.5 rounded-xl
            bg-slate-900/80 border border-slate-800
            text-slate-300 hover:text-white hover:border-slate-700
            transition
          "
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
        </button> */}

        <NotificationBell/>

        {/* Settings */}
        <Link
          to="/dashboard/settings"
          title="Account Settings"
          className="
            p-2.5 rounded-xl
            bg-slate-900/80 border border-slate-800
            text-slate-300 hover:text-white hover:border-slate-700
            transition
          "
        >
          <Settings size={18} />
        </Link>

        {/* User Chip */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800/80">
          <div
            className="
              w-10 h-10
              rounded-xl
              bg-gradient-to-tr from-blue-600 to-cyan-500
              text-white
              flex items-center justify-center
              font-extrabold text-sm
              shadow-lg shadow-blue-500/20
            "
          >
            {user?.fullName?.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="hidden lg:block">
            <h3 className="font-bold text-xs text-white leading-tight">
              {user?.fullName || "User"}
            </h3>
            <p className="text-[10px] text-slate-400 capitalize font-medium">
              {user?.role === "admin" ? "System Admin" : user?.accountType === "responder" ? "Verified Responder" : "Verified Citizen"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
