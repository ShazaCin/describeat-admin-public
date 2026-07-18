import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileUp,
  MessageSquare,
  Settings,
  Users,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { clsx } from "clsx";
import type { ComponentType } from "react";
import { version } from "../../../package.json";

interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/titleManagement", label: "Title Management", icon: FileUp },
  { to: "/UserCommunication", label: "User Communication", icon: MessageSquare },
  { to: "/OperatorConfig", label: "Operator Config", icon: Settings },
  { to: "/UsersOverview", label: "Users Overview", icon: Users },
  { to: "/UsersFeedback", label: "Users Feedback", icon: MessageCircle },
];

export function Sidebar() {
  const { sidebarOpen, sidebarMini, toggleSidebar, setSidebarMini } =
    useUIStore();

  const isExpanded = sidebarOpen && !sidebarMini;

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && !sidebarMini && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={clsx(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-slate-800 bg-slate-900 transition-all duration-300",
          isExpanded ? "w-64" : "w-16",
          !sidebarOpen && "-translate-x-full"
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* App branding */}
        <div className="flex h-14 items-center justify-between border-b border-slate-800 px-3">
          {isExpanded && (
            <span className="text-sm font-bold tracking-wider text-slate-200">
              SHAZACIN
            </span>
          )}
          <button
            onClick={() => setSidebarMini(!sidebarMini)}
            className="ml-auto rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 focus:ring-2 focus:ring-slate-500 focus:outline-none"
            aria-label={sidebarMini ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarMini ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => {
                if (window.innerWidth < 768) {
                  toggleSidebar();
                }
              }}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  "hover:bg-slate-800 hover:text-white focus:ring-2 focus:ring-slate-500 focus:outline-none",
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-400",
                  !isExpanded && "justify-center px-2"
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {isExpanded && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Version footer */}
        <div className={clsx(
          "border-t border-slate-800 px-3 py-2 text-xs text-slate-500",
          !isExpanded && "text-center"
        )}>
          {isExpanded ? `Shazacin Admin v${version}` : `v${version}`}
        </div>
      </aside>
    </>
  );
}
