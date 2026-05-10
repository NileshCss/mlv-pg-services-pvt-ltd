import { create } from 'zustand'

interface UIStoreState {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  activeModal: string | null
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  openModal: (id: string) => void
  closeModal: () => void
}

export const useUIStore = create<UIStoreState>((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  activeModal: null,

  toggleSidebar: () => set((state) => ({
    sidebarOpen: !state.sidebarOpen,
  })),

  setSidebarCollapsed: (collapsed) => set({
    sidebarCollapsed: collapsed,
  }),

  openModal: (id) => set({
    activeModal: id,
  }),

  closeModal: () => set({
    activeModal: null,
  }),
}))
