import { create } from 'zustand'
import { User } from '@supabase/supabase-js'

interface AuthStoreState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  
  setUser: (user) => set({
    user,
    isAuthenticated: !!user,
    isLoading: false,
  }),

  setLoading: (loading) => set({ isLoading: loading }),

  logout: () => set({
    user: null,
    isAuthenticated: false,
  }),
}))
