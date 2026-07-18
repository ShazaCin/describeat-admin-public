import { type ReactNode } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useUIStore } from "@/stores/uiStore";

export function AppShell({ children }: { children?: ReactNode }) {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const sidebarMini = useUIStore((s) => s.sidebarMini);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      <Sidebar />
      <div
        className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${
          sidebarOpen && !sidebarMini ? "md:ml-64" : "md:ml-16"
        }`}
      >
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {children ?? <Outlet />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
