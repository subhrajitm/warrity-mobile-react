"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import apiClient from '@/lib/api-client';
import type { User, AuthResponse, ApiErrorResponse } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null; // Added for refresh token support
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: Record<string, string>) => Promise<void>;
  register: (details: Record<string, string>) => Promise<void>;
  logout: () => Promise<void>; // Updated to handle API logout
  refreshAccessToken: () => Promise<void>; // New function
  forgotPassword: (email: string) => Promise<void>; // New function
  resetPassword: (token: string, newPassword: string) => Promise<void>; // New function
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>; // New function
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<void>; // New function
  uploadProfilePicture: (file: File) => Promise<void>; // New function
  updateUserInContext: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_DATA_KEY = 'userData';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const initializeAuth = useCallback(() => {
    setIsLoading(true);
    try {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_DATA_KEY);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setRefreshToken(storedRefreshToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error initializing auth from localStorage:", error);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const handleAuthSuccess = (data: AuthResponse) => {
    setToken(data.token);
    setUser(data.user);
    if (data.refreshToken) {
      setRefreshToken(data.refreshToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    }
    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
    router.push('/dashboard');
  };

  const login = async (credentials: Record<string, string>) => {
    try {
      const data = await apiClient<AuthResponse>('/auth/login', { data: credentials, method: 'POST' });
      handleAuthSuccess(data);
      toast({ title: "Login Successful", description: `Welcome back, ${data.user.username}!` });
    } catch (error) {
      const apiError = error as Error & { data?: ApiErrorResponse };
      toast({ title: "Login Failed", description: apiError.data?.message || apiError.message, variant: "destructive" });
      throw error;
    }
  };

  const register = async (details: Record<string, string>) => {
    try {
      const data = await apiClient<AuthResponse>('/auth/register', { data: details, method: 'POST' });
      handleAuthSuccess(data);
      toast({ title: "Registration Successful", description: `Welcome, ${data.user.username}!` });
    } catch (error) {
      const apiError = error as Error & { data?: ApiErrorResponse };
      toast({ title: "Registration Failed", description: apiError.data?.message || apiError.message, variant: "destructive" });
      throw error;
    }
  };

  const logout = useCallback(async () => {
    try {
      if (token) {
        // Call the logout API endpoint
        await apiClient('/auth/logout', { 
          method: 'POST',
          token
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear local state regardless of API success
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
      router.push('/login');
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    }
  }, [router, toast, token]);


  const fetchUserProfile = useCallback(async () => {
    if (!user?._id || !token) return;
    try {
      const fetchedUser = await apiClient<User>(`/users/${user._id}`, { token });
      setUser(fetchedUser);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(fetchedUser));
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      // Potentially logout if token is invalid (e.g., 401 error)
      const apiError = error as Error & { status?: number };
      if (apiError.status === 401) {
        logout();
      }
    }
  }, [user?._id, token, logout]);

  const updateUserInContext = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
  };

  const isAuthenticated = !!token && !!user;

  // Effect for redirecting if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !['/login', '/register'].includes(pathname)) {
        if (pathname !== '/') router.push('/login');
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  // Refresh access token
  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) return;
    
    try {
      const data = await apiClient<AuthResponse>('/auth/refresh-token', {
        method: 'POST',
        data: { refreshToken }
      });
      
      setToken(data.token);
      if (data.refreshToken) {
        setRefreshToken(data.refreshToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      }
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // If refresh token is invalid, log the user out
      const apiError = error as Error & { status?: number };
      if (apiError.status === 401) {
        logout();
      }
    }
  }, [refreshToken, logout]);

  // Forgot password
  const forgotPassword = async (email: string) => {
    try {
      await apiClient('/auth/forgot-password', {
        method: 'POST',
        data: { email }
      });
      
      toast({ 
        title: "Password Reset Email Sent", 
        description: "Please check your email for instructions to reset your password." 
      });
    } catch (error) {
      const apiError = error as Error & { data?: ApiErrorResponse };
      toast({ 
        title: "Request Failed", 
        description: apiError.data?.message || apiError.message, 
        variant: "destructive" 
      });
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (token: string, newPassword: string) => {
    try {
      await apiClient('/auth/reset-password', {
        method: 'POST',
        data: { token, newPassword }
      });
      
      toast({ 
        title: "Password Reset Successful", 
        description: "Your password has been reset. You can now log in with your new password." 
      });
      router.push('/login');
    } catch (error) {
      const apiError = error as Error & { data?: ApiErrorResponse };
      toast({ 
        title: "Password Reset Failed", 
        description: apiError.data?.message || apiError.message, 
        variant: "destructive" 
      });
      throw error;
    }
  };

  // Change password (authenticated)
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!token) {
      toast({ 
        title: "Authentication Required", 
        description: "You must be logged in to change your password.", 
        variant: "destructive" 
      });
      return;
    }
    
    try {
      await apiClient('/auth/change-password', {
        method: 'POST',
        data: { currentPassword, newPassword },
        token
      });
      
      toast({ 
        title: "Password Changed", 
        description: "Your password has been successfully updated." 
      });
    } catch (error) {
      const apiError = error as Error & { data?: ApiErrorResponse };
      toast({ 
        title: "Password Change Failed", 
        description: apiError.data?.message || apiError.message, 
        variant: "destructive" 
      });
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (userData: Partial<User>) => {
    if (!user?._id || !token) {
      toast({ 
        title: "Authentication Required", 
        description: "You must be logged in to update your profile.", 
        variant: "destructive" 
      });
      return;
    }
    
    try {
      const updatedUser = await apiClient<User>(`/users/${user._id}`, {
        method: 'PUT',
        data: userData,
        token
      });
      
      setUser(updatedUser);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
      
      toast({ 
        title: "Profile Updated", 
        description: "Your profile has been successfully updated." 
      });
    } catch (error) {
      const apiError = error as Error & { data?: ApiErrorResponse };
      toast({ 
        title: "Profile Update Failed", 
        description: apiError.data?.message || apiError.message, 
        variant: "destructive" 
      });
      throw error;
    }
  };

  // Upload profile picture
  const uploadProfilePicture = async (file: File) => {
    if (!user?._id || !token) {
      toast({ 
        title: "Authentication Required", 
        description: "You must be logged in to upload a profile picture.", 
        variant: "destructive" 
      });
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const updatedUser = await apiClient<User>(`/users/${user._id}/profile-picture`, {
        method: 'POST',
        body: formData,
        token
      });
      
      setUser(updatedUser);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
      
      toast({ 
        title: "Profile Picture Updated", 
        description: "Your profile picture has been successfully updated." 
      });
    } catch (error) {
      const apiError = error as Error & { data?: ApiErrorResponse };
      toast({ 
        title: "Upload Failed", 
        description: apiError.data?.message || apiError.message, 
        variant: "destructive" 
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      refreshToken,
      isLoading, 
      isAuthenticated, 
      login, 
      register, 
      logout, 
      refreshAccessToken,
      forgotPassword,
      resetPassword,
      changePassword,
      fetchUserProfile, 
      updateUserProfile,
      uploadProfilePicture,
      updateUserInContext 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
