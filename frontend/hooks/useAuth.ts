// TanStack Query hooks for Auth
import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { LoginDto, LoginResponse, JWTPayload } from '@/lib/types';
import { setToken, clearAuth, decodeToken } from '@/lib/auth';

// Login mutation
export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: LoginDto): Promise<LoginResponse> => {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      setToken(data.access_token);
    },
  });
};

// Get current user from /auth/me endpoint
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async (): Promise<JWTPayload> => {
      const response = await apiClient.get<JWTPayload>('/auth/me');
      return response.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Logout function
export const useLogout = () => {
  return () => {
    clearAuth();
    window.location.href = '/login';
  };
};
