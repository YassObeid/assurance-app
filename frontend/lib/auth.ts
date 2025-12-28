// Authentication utilities - token management and JWT decoding
import { jwtDecode } from 'jwt-decode';
import { JWTPayload, Role } from './types';

const TOKEN_KEY = 'access_token';

// Store token in localStorage
export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

// Get token from localStorage
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

// Remove token and clear auth
export const clearAuth = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

// Decode JWT token
export const decodeToken = (token?: string): JWTPayload | null => {
  try {
    const accessToken = token || getToken();
    if (!accessToken) return null;
    return jwtDecode<JWTPayload>(accessToken);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;

  const decoded = decodeToken(token);
  if (!decoded) return false;

  // Check if token is expired
  if (decoded.exp && decoded.exp * 1000 < Date.now()) {
    clearAuth();
    return false;
  }

  return true;
};

// Get current user info from token
export const getCurrentUser = (): JWTPayload | null => {
  if (!isAuthenticated()) return null;
  return decodeToken();
};

// Get user role
export const getUserRole = (): Role | null => {
  const user = getCurrentUser();
  return user?.role || null;
};

// Check if user has specific role
export const hasRole = (role: Role | Role[]): boolean => {
  const userRole = getUserRole();
  if (!userRole) return false;

  if (Array.isArray(role)) {
    return role.includes(userRole);
  }

  return userRole === role;
};

// Check if user is GM
export const isGM = (): boolean => hasRole(Role.GM);

// Check if user is Region Manager
export const isRegionManager = (): boolean => hasRole(Role.REGION_MANAGER);

// Check if user is Delegate
export const isDelegate = (): boolean => hasRole(Role.DELEGATE);
