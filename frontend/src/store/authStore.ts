import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updatedFields: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

const STORAGE_KEY_TOKEN = 'aarogya360_token';
const STORAGE_KEY_USER = 'aarogya360_user';

// Restore an existing authenticated session when available.
const getInitialState = () => {
  try {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    const userStr = localStorage.getItem(STORAGE_KEY_USER);
    if (token && userStr) {
      return {
        token,
        user: JSON.parse(userStr) as User,
        isAuthenticated: true,
      };
    }
  } catch (e) {
    console.error('Error loading auth from localStorage', e);
  }
  return {
    token: null,
    user: null,
    isAuthenticated: false,
  };
};

const initial = getInitialState();

export const useAuthStore = create<AuthState>((set) => ({
  user: initial.user,
  token: initial.token,
  isAuthenticated: initial.isAuthenticated,
  isLoading: false,

  login: (user: User, token: string) => {
    try {
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    try {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_USER);
    } catch (e) {
      console.error('Failed to remove auth from localStorage', e);
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  updateUser: (updatedFields: Partial<User>) => {
    set((state) => {
      if (!state.user) return state;
      const newUser = { ...state.user, ...updatedFields };
      try {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
      } catch (e) {
        console.error('Failed to update user in localStorage', e);
      }
      return { user: newUser };
    });
  },

  setLoading: (isLoading: boolean) => set({ isLoading }),
}));
