import { create } from 'zustand'

interface DashboardStats {
  totalRegistrations: number
  totalBookings: number
  activeResidents: number
  pendingFollowups: number
  monthlyTrend: number
  bookingTrend: number
  residenceTrend: number
  followupTrend: number
}

interface DashboardStoreState {
  stats: DashboardStats | null
  isLoadingStats: boolean
  filters: {
    dateRange: [string, string]
    status: string | null
    searchQuery: string
  }
  
  setStats: (stats: DashboardStats) => void
  setLoadingStats: (loading: boolean) => void
  setFilters: (filters: Partial<DashboardStoreState['filters']>) => void
  resetFilters: () => void
}

const defaultFilters = {
  dateRange: ['', ''] as [string, string],
  status: null,
  searchQuery: '',
}

export const useDashboardStore = create<DashboardStoreState>((set) => ({
  stats: null,
  isLoadingStats: false,
  filters: defaultFilters,

  setStats: (stats) => set({ stats }),

  setLoadingStats: (loading) => set({ isLoadingStats: loading }),

  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters },
  })),

  resetFilters: () => set({ filters: defaultFilters }),
}))
