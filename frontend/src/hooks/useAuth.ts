import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';
import { LoginCredentials, RegisterData, ProfileUpdatePayload } from '../types';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const getErrorMessage = (error: any, fallback: string): string => {
  const detail = error.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (error.code === 'ERR_NETWORK') return fallback;
  return error.response?.data?.message || fallback;
};

export const useAuth = () => {
  const { user, token, isAuthenticated, isLoading, login, logout, updateUser, setLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const res = await authApi.login(credentials);
      login(res.user, res.token);
      toast.success(`Welcome back, ${res.user.name}!`);
      navigate('/');
      return res;
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Unable to sign in. Check your connection and credentials.'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: RegisterData) => {
    try {
      setLoading(true);
      const res = await authApi.register(data);
      login(res.user, res.token);
      toast.success('Registration successful! Welcome to SehatSync AI.');
      navigate('/');
      return res;
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Unable to create your account. Check your connection and try again.'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  const handleUpdateProfile = async (payload: ProfileUpdatePayload) => {
    try {
      setLoading(true);
      const updated = await authApi.updateProfile(payload);
      updateUser(updated);
      toast.success('Profile updated successfully!');
      return updated;
    } catch (error: any) {
      toast.error('Failed to update profile.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateProfile: handleUpdateProfile,
  };
};
