import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { LogOut, Menu, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Header() {
  const { user, signOut } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const navigate = useNavigate();

  const displayName =
    (user?.attributes as Record<string, string> | undefined)?.email ??
    ((user?.signInDetails as Record<string, unknown> | undefined)?.loginId as string | undefined) ??
    "Admin";

  const handleLogout = async () => {
    await signOut();
    navigate("/Auth");
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-800 bg-slate-900/95 px-4 backdrop-blur-sm">
      {/* Mobile hamburger */}
      <button
        onClick={toggleSidebar}
        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 focus:ring-2 focus:ring-slate-500 focus:outline-none md:hidden"
        aria-label="Toggle navigation"
      >
        <Menu size={20} />
      </button>

      <h1 className="text-base font-semibold tracking-tight text-slate-200">
        Shazacin Admin
      </h1>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden items-center gap-2 text-sm text-slate-400 sm:flex">
          <User size={16} />
          <span>{displayName}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-red-400 focus:ring-2 focus:ring-slate-500 focus:outline-none"
          aria-label="Sign out"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
