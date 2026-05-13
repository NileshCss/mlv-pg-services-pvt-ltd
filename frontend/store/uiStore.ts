import { create } from 'zustand'

interface UIStoreState {
  // Mobile: drawer open/close
  mobileOpen: boolean
  // Desktop: drawer open/close (hidden by default)
  desktopOpen: boolean
  // Tablet: icon-only collapsed mode
  tabletCollapsed: boolean
  // Legacy - kept for compatibility
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  activeModal: string | null
  toggleMobileSidebar: () => void
  closeMobileSidebar: () => void
  toggleDesktopSidebar: () => void
  closeDesktopSidebar: () => void
  toggleTabletCollapsed: () => void
  // Legacy
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  openModal: (id: string) => void
  closeModal: () => void
}

export const useUIStore = create<UIStoreState>((set) => ({
  mobileOpen: false,
  desktopOpen: false,   // hidden by default on desktop
  tabletCollapsed: true,
  sidebarOpen: true,
  sidebarCollapsed: false,
  activeModal: null,

  toggleMobileSidebar: () => set((state) => ({ mobileOpen: !state.mobileOpen })),
  closeMobileSidebar: () => set({ mobileOpen: false }),
  toggleDesktopSidebar: () => set((state) => ({ desktopOpen: !state.desktopOpen })),
  closeDesktopSidebar: () => set({ desktopOpen: false }),
  toggleTabletCollapsed: () => set((state) => ({ tabletCollapsed: !state.tabletCollapsed })),

  toggleSidebar: () => set((state) => ({
    sidebarOpen: !state.sidebarOpen,
    mobileOpen: !state.mobileOpen,
  })),

  setSidebarCollapsed: (collapsed) => set({
    sidebarCollapsed: collapsed,
    tabletCollapsed: collapsed,
  }),

  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
}))

