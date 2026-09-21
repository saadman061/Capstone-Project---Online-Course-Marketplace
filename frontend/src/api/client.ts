import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============ AUTH API ============
export const authAPI = {
  register: (data: { name: string; email: string; password: string; role: 'student' | 'instructor' }) =>
    api.post('/auth/register', data),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

// ============ COURSE API ============
export const courseAPI = {
  getAll: (filters?: { status?: string; categoryId?: string; instructorId?: string }) =>
    api.get('/courses', { params: filters }),
  getById: (courseId: string) =>
    api.get(`/courses/${courseId}`),
  create: (data: { title: string; description: string; price: number; categoryId: string }) =>
    api.post('/courses', data),
  update: (courseId: string, data: Partial<any>) =>
    api.put(`/courses/${courseId}`, data),
  publish: (courseId: string) =>
    api.post(`/courses/${courseId}/publish`, {}),
  delete: (courseId: string) =>
    api.delete(`/courses/${courseId}`),
  getReviews: (courseId: string) =>
    api.get(`/courses/${courseId}/reviews`),
  submitReview: (courseId: string, data: { rating: number; comment?: string }) =>
    api.post(`/courses/${courseId}/reviews`, data),
  addModule: (courseId: string, data: { title: string; sortOrder: number }) =>
    api.post(`/courses/${courseId}/modules`, data),
  addLesson: (courseId: string, moduleId: string, data: { title: string; videoUrl: string; durationSec: number }) =>
    api.post(`/courses/${courseId}/modules/${moduleId}/lessons`, data),
};

// ============ ENROLLMENT API ============
export const enrollmentAPI = {
  getStudentEnrollments: (studentId: string) =>
    api.get(`/enrollments/student/${studentId}`),
  getCourseEnrollments: (courseId: string) =>
    api.get(`/enrollments/course/${courseId}`),
  enroll: (data: { courseId: string; coursePrice: number; paymentMethod?: string }) =>
    api.post('/enrollments/enroll', data),
  getById: (enrollmentId: string) =>
    api.get(`/enrollments/${enrollmentId}`),
  updateProgress: (enrollmentId: string, progressPercent: number) =>
    api.put(`/enrollments/${enrollmentId}/progress`, { progressPercent }),
  getAll: () =>
    api.get('/enrollments/student/me'),
};

// ============ USER API ============
export const userAPI = {
  getProfile: () =>
    api.get('/users/profile'),
  updateProfile: (data: { name?: string; bio?: string; payoutAccount?: string }) =>
    api.put('/users/profile', data),
  getWishlist: () =>
    api.get('/users/wishlist'),
  addToWishlist: (courseId: string) =>
    api.post('/users/wishlist', { courseId }),
  removeFromWishlist: (courseId: string) =>
    api.delete(`/users/wishlist/${courseId}`),
};

// ============ ADMIN API ============
export const adminAPI = {
  getPendingCourses: () =>
    api.get('/admin/courses/pending'),
  getPublishedCourses: () =>
    api.get('/admin/courses/published'),
  approveCourse: (courseId: string) =>
    api.post(`/admin/courses/${courseId}/approve`, {}),
  rejectCourse: (courseId: string, reason: string) =>
    api.post(`/admin/courses/${courseId}/reject`, { reason }),
  getCourses: () =>
    api.get('/admin/courses/pending'),
  getAllUsers: () =>
    api.get('/admin/users'),
  suspendUser: (userId: string) =>
    api.post(`/admin/users/${userId}/suspend`, {}),
  activateUser: (userId: string) =>
    api.post(`/admin/users/${userId}/activate`, {}),
  getAnalytics: () =>
    api.get('/admin/analytics'),
};

export default api;
