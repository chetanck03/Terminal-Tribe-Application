import axios from 'axios';
import { supabase } from './supabase';

// Types
interface CreateClubData {
  name: string;
  description: string;
  content?: string;
  image?: string | null;
  category: string;
}

// Create axios instance with base URL and default headers
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Export the configured axios instance
export default api;

// API functions using the configured instance
export const getClubs = (params?: any) => api.get('/clubs', { params });
export const getClubById = (id: string) => api.get(`/clubs/${id}`);
export const createClub = async (clubData: CreateClubData) => {
  const response = await api.post('/clubs', clubData);
  return response.data;
};
export const updateClub = (id: string, data: any) => api.put(`/clubs/${id}`, data);
export const deleteClub = (id: string) => api.delete(`/clubs/${id}`);
export const joinClub = (id: string) => api.post(`/clubs/${id}/join`);
export const leaveClub = (id: string) => api.delete(`/clubs/${id}/join`);

// Add caching for dashboard stats to improve loading performance
let dashboardStatsCache = null;
let lastFetchTime = 0;
const CACHE_TTL = 60000; // 1 minute cache

// API endpoints

// Users
export const getUsers = () => api.get('/users');
export const getUserById = (id: string) => api.get(`/users/${id}`);
export const updateUser = (id: string, data: any) => api.put(`/users/${id}`, data);
export const deleteUser = (id: string) => api.delete(`/users/${id}`);

// Events
export const getEvents = (params?: any) => api.get('/events', { params });
export const getEventById = (id: string) => api.get(`/events/${id}`);
export const createEvent = (data: any) => api.post('/events', data);
export const updateEvent = (id: string, data: any) => api.put(`/events/${id}`, data);
export const deleteEvent = (id: string) => api.delete(`/events/${id}`);
export const approveEvent = (id: string) => api.post(`/events/${id}/approve`);
export const rejectEvent = (id: string) => api.post(`/events/${id}/reject`);
export const joinEvent = (id: string) => api.post(`/events/${id}/join`);
export const leaveEvent = (id: string) => api.delete(`/events/${id}/join`);

// Notifications
export const getNotifications = () => api.get('/notifications');
export const markNotificationAsRead = (id: string) => api.put(`/notifications/${id}/read`);
export const deleteNotification = (id: string) => api.delete(`/notifications/${id}`);

// Posts
export const getPosts = (params?: any) => api.get('/posts', { params });
export const getPostById = (id: string) => api.get(`/posts/${id}`);
export const createPost = (data: any) => api.post('/posts', data);
export const updatePost = (id: string, data: any) => api.put(`/posts/${id}`, data);
export const deletePost = (id: string) => api.delete(`/posts/${id}`);

// Admin
export const getDashboardStats = async () => {
  const now = Date.now();
  
  // Return cached data if still valid
  if (dashboardStatsCache && (now - lastFetchTime < CACHE_TTL)) {
    return { data: dashboardStatsCache };
  }
  
  try {
    // Make actual API call to the server endpoint
    const response = await api.get('/admin/dashboard');
    
    // Update cache
    dashboardStatsCache = response.data;
    lastFetchTime = now;
    
    return { data: response.data };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
}; 