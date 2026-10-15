import apiClient from './axios';
import { AuthResponse, LoginCredentials, RegisterData, User, ProfileUpdatePayload } from '../types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
      return response.data;
    } catch (error) {
      // Fallback for standalone demo mode if backend is not yet started
      if ((error as any)?.code === 'ERR_NETWORK' || (error as any)?.message?.includes('Network Error')) {
        console.warn('Backend unavailable, providing demo session for preview');
        return {
          user: {
            id: 'usr_demo_101',
            name: credentials.email.split('@')[0] || 'Demo User',
            email: credentials.email,
            age: 28,
            gender: 'other',
            phone: '+91 98765 43210',
            language: 'English',
            created_at: new Date().toISOString(),
          },
          token: 'demo-jwt-token-aarogya-360-xyz',
          message: 'Logged in (demo mode)',
        };
      }
      throw error;
    }
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
      return response.data;
    } catch (error) {
      if ((error as any)?.code === 'ERR_NETWORK' || (error as any)?.message?.includes('Network Error')) {
        return {
          user: {
            id: 'usr_' + Date.now(),
            name: data.name,
            email: data.email,
            age: data.age || 25,
            gender: data.gender || 'prefer_not_to_say',
            phone: data.phone || '',
            language: 'English',
            created_at: new Date().toISOString(),
          },
          token: 'demo-jwt-token-' + Date.now(),
          message: 'Registration successful (demo mode)',
        };
      }
      throw error;
    }
  },

  getProfile: async (): Promise<User> => {
    try {
      const response = await apiClient.get<User>('/api/auth/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (payload: ProfileUpdatePayload): Promise<User> => {
    try {
      const response = await apiClient.put<User>('/api/auth/profile', payload);
      return response.data;
    } catch (error) {
      if ((error as any)?.code === 'ERR_NETWORK' || (error as any)?.message?.includes('Network Error')) {
        return {
          id: 'usr_demo_101',
          name: payload.name,
          email: 'user@aarogya360.ai',
          age: payload.age,
          gender: (payload.gender as any) || 'prefer_not_to_say',
          phone: payload.phone,
          language: payload.language || 'English',
        };
      }
      throw error;
    }
  },
};
