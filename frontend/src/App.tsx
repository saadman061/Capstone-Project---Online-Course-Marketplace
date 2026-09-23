import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CourseCataloguePage from './pages/CourseCataloguePage';
import CourseDetailPage from './pages/CourseDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import InstructorDashboardPage from './pages/InstructorDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import CheckoutPage from './pages/CheckoutPage';
import EditCoursePage from './pages/EditCoursePage';
import CourseLearningPage from './pages/CourseLearningPage';
import SupportTicketsPage from './pages/SupportTicketsPage';
import SupportAgentDashboardPage from './pages/SupportAgentDashboardPage';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header />
          <main className="flex-grow">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/courses" element={<CourseCataloguePage />} />
              <Route path="/courses/:courseId" element={<CourseDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Protected routes - Student */}
              <Route path="/student/dashboard" element={<StudentDashboardPage />} />
              <Route path="/learn/:courseId/:enrollmentId" element={<CourseLearningPage />} />

              {/* Protected routes - Instructor */}
              <Route path="/instructor/dashboard" element={<InstructorDashboardPage />} />

              {/* Protected routes - Admin */}
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

              {/* Support tickets */}
              <Route path="/support" element={<SupportTicketsPage />} />
              <Route path="/support/dashboard" element={<SupportAgentDashboardPage />} />

              {/* Checkout */}
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/edit-course/:courseId" element={<EditCoursePage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </Provider>
  );
};

export default App;
