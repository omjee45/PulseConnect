import { create } from 'zustand'
import { persist } from 'zustand/middleware'


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
