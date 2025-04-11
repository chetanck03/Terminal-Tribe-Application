import { create } from 'zustand';
import React, { useEffect } from 'react';
import axios from 'axios';

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:5000';

interface AuthState {
  user: any | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: any | null) => void;
  setAdmin: (isAdmin: boolean) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string, emailConfirmationRequired?: boolean }>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAdmin: localStorage.getItem('isAdmin') === 'true',
  isAuthenticated: false,
  loading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAdmin: (isAdmin) => {
    localStorage.setItem('isAdmin', isAdmin.toString());
    set({ isAdmin });
  },
  setLoading: (loading) => set({ loading }),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    set({ user: null, isAdmin: false, isAuthenticated: false });
  },
  signIn: async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      if (token && user) {
        localStorage.setItem('token', token);
        set({ 
          user, 
          isAuthenticated: true,
          isAdmin: user.role === 'ADMIN'
        });
        return {};
      }
      return { error: 'Invalid credentials' };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'An error occurred during sign in' };
    }
  },
  signUp: async (email: string, password: string, name: string) => {
    try {
      const response = await axios.post('/api/auth/signup', { email, password, name });
      const { token, user } = response.data;
      
      if (token && user) {
        localStorage.setItem('token', token);
        set({ 
          user, 
          isAuthenticated: true,
          isAdmin: user.role === 'ADMIN'
        });
        return {};
      }
      return { error: 'Failed to sign up' };
    } catch (error) {
      console.error('Sign up error:', error);
      if (axios.isAxiosError(error) && error.response) {
        return { error: error.response.data.error || 'An error occurred during sign up' };
      }
      return { error: 'An error occurred during sign up' };
    }
  }
}));

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { setUser, setLoading, setAdmin } = useAuth();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if there's a stored token
        const token = localStorage.getItem('token');
        if (token) {
          // Set the token in axios headers for all subsequent requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch current user data with the token
          try {
            const response = await axios.get('/api/auth/me');
            const userData = response.data;
            
            setUser(userData);
            setAdmin(userData.role === 'ADMIN');
          } catch (tokenError) {
            // Token is invalid or expired, remove it
            console.error('Token validation error:', tokenError);
            localStorage.removeItem('token');
            axios.defaults.headers.common['Authorization'] = '';
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [setUser, setLoading, setAdmin]);

  return <>{children}</>;
}; 