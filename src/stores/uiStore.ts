import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  sidebarMini: boolean;
  toggleSidebar: () => void;
  setSidebarMini: (mini: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  sidebarMini: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarMini: (mini: boolean) => set({ sidebarMini: mini }),
}));
