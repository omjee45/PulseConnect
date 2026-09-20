import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Global auth state store.
 * 
 * `user` is persisted to sessionStorage so a page refresh keeps the user logged in
 * (the HTTP-only cookie still handles the actual auth; this is just for UI state).
 * 
 * The `isLoading` flag is true on app start while we call GET /api/auth/me
 * to verify the session is still valid. It prevents the ProtectedRoute from
 * flashing to /login before the check finishes.
 */
const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isLoading: true,

      setUser: (user) => set({ user, isLoading: false }),
      clearUser: () => set({ user: null, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'pulseconnect-auth',
      // Only persist `user`, not `isLoading` (that's always reset on load)
      partialize: (state) => ({ user: state.user }),
      storage: {
        getItem: (name) => {
          const val = sessionStorage.getItem(name)
          return val ? JSON.parse(val) : null
        },
        setItem: (name, value) => sessionStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => sessionStorage.removeItem(name),
      },
    }
  )
)

export default useAuthStore
