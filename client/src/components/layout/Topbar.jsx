import { Moon, Sun, LogOut, Bell } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const Topbar = ({ title }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/40 backdrop-blur-xl sticky top-0 z-10">
      <h1 className="font-display text-xl font-bold text-neutral-900 dark:text-white">{title}</h1>

      <div className="flex items-center gap-3">
        <button
          className="p-2 rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="h-8 w-8 rounded-full bg-brand-gradient text-white text-xs font-bold flex items-center justify-center">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-xl text-neutral-500 hover:bg-danger/10 hover:text-danger transition"
          aria-label="Log out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
