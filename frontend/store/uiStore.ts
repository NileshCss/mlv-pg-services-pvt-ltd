import { create } from 'zustand'

interface UIStoreState {
  // Mobile: drawer open/close
  mobileOpen: boolean
  // Tablet: icon-only collapsed mode
  tabletCollapsed: boolean
  // Legacy - kept for compatibility
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  activeModal: string | null
  toggleMobileSidebar: () => void
  closeMobileSidebar: () => void
  toggleTabletCollapsed: () => void
  // Legacy
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  openModal: (id: string) => void
  closeModal: () => void
}

export const useUIStore = create<UIStoreState>((set) => ({
  mobileOpen: false,
  tabletCollapsed: true, // tablets start collapsed (icon-only)
  sidebarOpen: true,
  sidebarCollapsed: false,
  activeModal: null,

  toggleMobileSidebar: () => set((state) => ({ mobileOpen: !state.mobileOpen })),
  closeMobileSidebar: () => set({ mobileOpen: false }),
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
