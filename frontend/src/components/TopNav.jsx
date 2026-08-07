import { Moon, Sun, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate, Link } from "react-router-dom";
import NotificationBell from "./NotificationBell";

const ROLE_LABELS = {
  learner: "Learner",
  debate_coach: "Debate Coach",
  educator: "Educator",
  administrator: "Administrator",
};

export default function TopNav() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header
      className="
        sticky
        top-0
        z-40
        border-b
        border-blue-500/10
        bg-white/80
        backdrop-blur-xl

        dark:border-white/10
        dark:bg-ink-950/80
      "
    >
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <h1
            className="
              font-display
              text-xl
              font-bold
              tracking-tight
              text-ink-900

              dark:text-white
            "
          >
            AI Debate{" "}
            <span
              className="
                bg-gradient-to-r
                from-blue-500
                via-indigo-500
                to-violet-500
                bg-clip-text
                text-transparent
              "
            >
              Coach
            </span>
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Role Badge */}
          {user && (
            <span
              className="
                hidden
                rounded-full
                border
                border-blue-500/20
                bg-gradient-to-r
                from-blue-500/10
                to-violet-500/10
                px-3
                py-1
                text-xs
                font-semibold
                text-blue-600

                dark:border-white/10
                dark:text-blue-300
                md:inline-block
              "
            >
              {ROLE_LABELS[user.role]}
            </span>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-blue-500/20
              bg-gradient-to-br
              from-blue-500/10
              to-violet-500/10
              text-blue-600
              transition-all
              duration-300

              hover:scale-105
              hover:shadow-lg

              dark:border-white/10
              dark:text-blue-300
            "
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <>
              <NotificationBell />

              <button
                onClick={handleLogout}
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-blue-500/20
                  bg-gradient-to-r
                  from-blue-500/10
                  to-violet-500/10
                  px-3
                  py-2
                  text-xs
                  font-semibold
                  text-blue-600
                  transition-all
                  duration-300

                  hover:border-violet-500/40
                  hover:bg-violet-500/10

                  dark:border-white/10
                  dark:text-blue-300
                "
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="
                  rounded-xl
                  border
                  border-blue-500/30
                  bg-white/5
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  text-blue-600
                  transition-all
                  duration-300

                  hover:border-violet-500/50
                  hover:bg-blue-500/10

                  dark:text-blue-300
                "
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="
                  rounded-xl
                  bg-gradient-to-r
                  from-blue-600
                  via-indigo-600
                  to-violet-600
                  px-5
                  py-2
                  text-sm
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-blue-500/20
                  transition-all
                  duration-300

                  hover:scale-105
                  hover:shadow-violet-500/30
                "
              >
                <span className="sm:hidden">Start</span>

                <span className="hidden sm:inline">Get Started</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
