import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FilePlus2,
  ListChecks,
  Users,
  Building2,
  Tags,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";

const LINKS = {
  student: [
    { to: "/student", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/student/raise", label: "Raise Complaint", icon: FilePlus2 },
    { to: "/student/complaints", label: "My Complaints", icon: ListChecks },
  ],
  staff: [
    { to: "/staff", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/staff/complaints", label: "Assigned Complaints", icon: ListChecks },
  ],
  admin: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/complaints", label: "All Complaints", icon: ListChecks },
    { to: "/admin/users", label: "Manage Users", icon: Users },
    { to: "/admin/departments", label: "Departments", icon: Building2 },
    { to: "/admin/categories", label: "Categories", icon: Tags },
    { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  ],
};

const Sidebar = () => {
  const { user } = useAuth();
  const links = LINKS[user?.role] || [];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 backdrop-blur-xl px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="h-9 w-9 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-display font-bold">C</div>
        <div>
          <p className="font-display font-bold text-neutral-900 dark:text-white leading-tight">CampusConnect</p>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 -mt-0.5">AI Complaint Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-brand-gradient text-white shadow-md"
                  : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-2 pt-4 text-xs text-neutral-400">
        Signed in as <span className="font-semibold capitalize">{user?.role}</span>
      </div>
    </aside>
  );
};

export default Sidebar;
