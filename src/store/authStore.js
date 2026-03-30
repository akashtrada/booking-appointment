import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useAuthStore = create(devtools((set) => ({
  isAuthenticated: !!localStorage.getItem('token'),
  user: null,
  isLoading: false,
  error: null,

  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  logout: () => {
    localStorage.removeItem('token');
    set({ isAuthenticated: false, user: null });
  },
}), { name: 'authStore' }));

export default useAuthStore;