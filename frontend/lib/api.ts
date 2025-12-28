// API client wrapper with authentication and error handling
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getToken, clearAuth } from './auth';
import { ApiError } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response) {
      const { status, data } = error.response;

      // Handle 401 - Unauthorized (token expired or invalid)
      if (status === 401) {
        clearAuth();
        // Redirect to login if not already there
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      // Handle 403 - Forbidden (insufficient permissions)
      if (status === 403) {
        console.error('Access denied:', data.message);
      }

      // Return formatted error
      return Promise.reject({
        message: data?.message || 'An error occurred',
        statusCode: status,
        error: data?.error,
      } as ApiError);
    }

    // Network error or no response
    return Promise.reject({
      message: error.message || 'Network error',
      statusCode: 0,
    } as ApiError);
  }
);

export default apiClient;

// Helper function to handle API errors in components
export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as ApiError).message;
  }
  return 'An unexpected error occurred';
};
