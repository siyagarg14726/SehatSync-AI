import apiClient from './axios';
import { AuthResponse, LoginCredentials, RegisterData, User, ProfileUpdatePayload } from '../types';
import { useAuthStore } from '../store/authStore';

interface BackendUser {
  id: number;
  email: string;
  created_at: string;
  profile?: {
    user_id: number;
    full_name: string;
    age?: number | null;
    gender?: string | null;
    phone?: string | null;
    language_preference?: string;
  } | null;
}

interface BackendAuthResponse {
  access_token: string;
  user: BackendUser;
}

interface BackendProfile {
  user_id: number;
  full_name: string;
  age?: number | null;
  gender?: string | null;
  phone?: string | null;
  language_preference?: string;
}

const mapGender = (value?: string | null): User['gender'] => {
  const normalized = value?.trim().toLowerCase().replace(/[\s-]+/g, '_');
  return normalized === 'male' || normalized === 'female' || normalized === 'other' ||
    normalized === 'prefer_not_to_say'
    ? normalized
    : undefined;
};

const mapLanguage = (value?: string): string | undefined => {
  const languages: Record<string, string> = {
    en: 'English',
    hi: 'Hindi',
    mr: 'Marathi',
    gu: 'Gujarati',
    ta: 'Tamil',
    te: 'Telugu',
    bn: 'Bengali',
  };
  return value ? languages[value.toLowerCase()] ?? value : undefined;
};

const toBackendLanguage = (value?: string): string | undefined => {
  const languageCodes: Record<string, string> = {
    english: 'en',
    hindi: 'hi',
    marathi: 'mr',
    gujarati: 'gu',
    tamil: 'ta',
    telugu: 'te',
    bengali: 'bn',
  };
  return value ? languageCodes[value.toLowerCase()] ?? value : undefined;
};

const mapUser = (user: BackendUser): User => ({
  id: String(user.id),
  name: user.profile?.full_name ?? '',
  email: user.email,
  age: user.profile?.age ?? undefined,
  gender: mapGender(user.profile?.gender),
  phone: user.profile?.phone ?? undefined,
  language: mapLanguage(user.profile?.language_preference),
  created_at: user.created_at,
});

const mapAuthResponse = (response: BackendAuthResponse): AuthResponse => ({
  user: mapUser(response.user),
  token: response.access_token,
});

const mapUpdatedProfile = (profile: BackendProfile): User => {
  const currentUser = useAuthStore.getState().user;
  return {
    id: currentUser?.id ?? String(profile.user_id),
    name: profile.full_name,
    email: currentUser?.email ?? '',
    age: profile.age ?? undefined,
    gender: mapGender(profile.gender),
    phone: profile.phone ?? undefined,
    language: mapLanguage(profile.language_preference),
    created_at: currentUser?.created_at,
  };
};

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<BackendAuthResponse>('/api/v1/auth/login', {
      email: credentials.email,
      password: credentials.password ?? '',
    });
    return mapAuthResponse(response.data);
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<BackendAuthResponse>('/api/v1/auth/register', {
      email: data.email,
      password: data.password ?? '',
      full_name: data.name,
      age: data.age,
      gender: data.gender,
      phone: data.phone,
    });
    return mapAuthResponse(response.data);
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<BackendUser>('/api/v1/users/me');
    return mapUser(response.data);
  },

  updateProfile: async (payload: ProfileUpdatePayload): Promise<User> => {
    const response = await apiClient.put<BackendProfile>('/api/v1/users/me/profile', {
      full_name: payload.name,
      age: payload.age,
      gender: payload.gender,
      phone: payload.phone,
      language_preference: toBackendLanguage(payload.language),
    });
    return mapUpdatedProfile(response.data);
  },
};
