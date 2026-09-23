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
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  logout: () =>
    api.post('/auth/logout', {}),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

// ============ CATEGORIES API ============
export const categoriesAPI = {
  getAll: () =>
    api.get('/categories'),
};

// ============ COURSE API ============
export const courseAPI = {
  getAll: (filters?: { status?: string; categoryId?: string; instructorId?: string; search?: string }) =>
    api.get('/courses', { params: filters }),
  search: (query: string, filters?: { categoryId?: string }) =>
    api.get('/courses', { params: { search: query, ...filters } }),
  getById: (courseId: string) =>
    api.get(`/courses/${courseId}`),
  create: (data: { title: string; description: string; price: number; categoryId: string }) =>
    api.post('/courses', data),
  update: (courseId: string, data: Partial<any>) =>
    api.put(`/courses/${courseId}`, data),
  publish: (courseId: string) =>
    api.post(`/courses/${courseId}/publish`, {}),
  resubmit: (courseId: string) =>
    api.post(`/courses/${courseId}/resubmit`, {}),
  discontinue: (courseId: string) =>
    api.post(`/courses/${courseId}/discontinue`, {}),
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
  markComplete: (enrollmentId: string) =>
    api.post(`/enrollments/${enrollmentId}/complete`, {}),
  generateCertificate: (enrollmentId: string) =>
    api.post(`/enrollments/${enrollmentId}/certificate`, {}),
  getCertificate: (enrollmentId: string) =>
    api.get(`/enrollments/${enrollmentId}/certificate`),
  getStudentCertificates: (studentId: string) =>
    api.get(`/enrollments/student/${studentId}/certificates`),
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

// ============ LESSONS API ============
export const lessonsAPI = {
  completeLesson: (enrollmentId: string, lessonId: string) =>
    api.post(`/lessons/${enrollmentId}/lessons/${lessonId}/complete`, {}),
  getLessonProgress: (enrollmentId: string) =>
    api.get(`/lessons/${enrollmentId}/progress`),
  checkLessonStatus: (enrollmentId: string, lessonId: string) =>
    api.get(`/lessons/${enrollmentId}/lessons/${lessonId}/status`),
  getStudentProgress: () =>
    api.get('/lessons/student/me/all'),
  resetProgress: (enrollmentId: string) =>
    api.post(`/lessons/${enrollmentId}/reset`, {}),
};

// ============ ADMIN API ============
export const adminAPI = {
  getPendingCourses: () =>
    api.get('/admin/courses/pending'),
  getPublishedCourses: () =>
    api.get('/admin/courses/published'),
  getSuspendedCourses: () =>
    api.get('/admin/courses/suspended'),
  suspendCourse: (courseId: string) =>
    api.post(`/admin/courses/${courseId}/suspend`, {}),
  reinstateCourse: (courseId: string) =>
    api.post(`/admin/courses/${courseId}/reinstate`, {}),
  archiveCourse: (courseId: string) =>
    api.post(`/admin/courses/${courseId}/archive`, {}),
  approveCourse: (courseId: string) =>
    api.post(`/admin/courses/${courseId}/approve`, {}),
  rejectCourse: (courseId: string, reason: string) =>
    api.post(`/admin/courses/${courseId}/reject`, { reason }),
  getCourses: () =>
    api.get('/admin/courses/pending'),
  getAllUsers: () =>
    api.get('/admin/users'),
  createSupportAgent: (data: { name: string; email: string; password: string }) =>
    api.post('/admin/users/support-agent', data),
  suspendUser: (userId: string) =>
    api.post(`/admin/users/${userId}/suspend`, {}),
  activateUser: (userId: string) =>
    api.post(`/admin/users/${userId}/activate`, {}),
  getAnalytics: () =>
    api.get('/admin/analytics'),
};

// ============ TICKET API ============
export const ticketAPI = {
  create: (data: { subject: string; description: string; priority?: string }) =>
    api.post('/tickets', data),
  getMine: () =>
    api.get('/tickets/my'),
  getInbox: () =>
    api.get('/tickets'),
  getById: (ticketId: string) =>
    api.get(`/tickets/${ticketId}`),
  update: (ticketId: string, data: { status?: string; priority?: string; claim?: boolean }) =>
    api.put(`/tickets/${ticketId}`, data),
};

// ============ STATS API ============
export const statsAPI = {
  getPublic: () =>
    api.get('/stats/public'),
};

// ============ NOTIFICATION API ============
export const notificationAPI = {
  getMine: () =>
    api.get('/notifications/me'),
  markRead: (notificationId: string) =>
    api.put(`/notifications/${notificationId}/read`, {}),
  markAllRead: () =>
    api.post('/notifications/read-all', {}),
};

export default api;
