import { create } from 'zustand';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

const initialToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null; 
const initialUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;

export const useAuthStore = create<AuthState>((set) => ({
  token: initialToken,
  user: initialUser,
  setToken: (token) => set({ token }),
  setUser: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null });
  },
}));