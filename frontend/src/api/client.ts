import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  register: (data: any) => apiClient.post('/auth/register', data),
  login: (data: any) => apiClient.post('/auth/login', data),
};

export const courseAPI = {
  getAll: (params?: any) => apiClient.get('/courses', { params }),
  getById: (id: string) => apiClient.get(`/courses/${id}`),
  create: (data: any) => apiClient.post('/courses', data),
  update: (id: string, data: any) => apiClient.put(`/courses/${id}`, data),
  delete: (id: string) => apiClient.delete(`/courses/${id}`),
  search: (query: string) => apiClient.get(`/courses/search?q=${query}`),
};

export const enrollmentAPI = {
  getAll: () => apiClient.get('/enrollments'),
  getById: (id: string) => apiClient.get(`/enrollments/${id}`),
  create: (data: any) => apiClient.post('/enrollments', data),
  updateProgress: (id: string, progress: number) => 
    apiClient.patch(`/enrollments/${id}/progress`, { progressPercent: progress }),
};

export const userAPI = {
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (data: any) => apiClient.put('/users/profile', data),
  getWishlist: () => apiClient.get('/users/wishlist'),
  addToWishlist: (courseId: string) => apiClient.post('/users/wishlist', { courseId }),
  removeFromWishlist: (courseId: string) => apiClient.delete(`/users/wishlist/${courseId}`),
};

export const adminAPI = {
  getCourses: () => apiClient.get('/admin/courses'),
  approveCourse: (courseId: string) => apiClient.post(`/admin/courses/${courseId}/approve`),
  rejectCourse: (courseId: string, reason: string) => 
    apiClient.post(`/admin/courses/${courseId}/reject`, { reason }),
  getUsers: () => apiClient.get('/admin/users'),
  suspendUser: (userId: string) => apiClient.post(`/admin/users/${userId}/suspend`),
};

export default apiClient;
