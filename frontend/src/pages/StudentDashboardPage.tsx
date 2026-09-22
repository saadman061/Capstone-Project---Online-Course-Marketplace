import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { enrollmentAPI } from '../api/client';
import { RootState } from '../redux/store';

interface Enrollment {
  enrollmentId: string;
  progressPercent: number;
  completed: boolean;
  enrolledAt: string;
  course: {
    courseId: string;
    title: string;
    instructor: { name: string };
  };
}

const StudentDashboardPage: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);

  // Call hooks BEFORE early return
  useEffect(() => {
    if (user?.role === 'student') {
      fetchEnrollments();
    }
  }, [user?.role]);

  // Redirect if not student (after hooks)
  if (user?.role !== 'student') {
    return <Navigate to="/" />;
  }

  const fetchEnrollments = async () => {
    try {
      const response = await enrollmentAPI.getAll();
      setEnrollments(response.data);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (enrollmentId: string) => {
    setActionLoading(enrollmentId);
    setError(null);
    try {
      const response = await enrollmentAPI.markComplete(enrollmentId);
      console.log('✅ Course marked as complete:', response.data);
      
      // Update enrollments state
      setEnrollments(enrollments.map(e => 
        e.enrollmentId === enrollmentId ? { ...e, ...response.data.enrollment } : e
      ));
    } catch (err: any) {
      console.error('Failed to mark course as complete:', err);
      setError(err.response?.data?.error || 'Failed to mark course as complete');
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateCertificate = async (enrollmentId: string) => {
    setActionLoading(enrollmentId);
    setError(null);
    try {
      const response = await enrollmentAPI.generateCertificate(enrollmentId);
      console.log('📜 Certificate generated:', response.data.certificate);
      
      // Download the certificate as SVG
      const certificate = response.data.certificate;
      const link = document.createElement('a');
      link.href = certificate.fileUrl;
      link.download = `certificate-${enrollmentId}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      console.error('Failed to generate certificate:', err);
      setError(err.response?.data?.error || 'Failed to generate certificate');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">My Learning</h1>
          <p className="text-gray-600">Continue learning and track your progress</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading your courses...</p>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-2xl font-bold text-gray-700 mb-4">No courses yet</p>
            <p className="text-gray-600 mb-6">You haven't enrolled in any courses. Explore our catalogue to get started!</p>
            <a
              href="/courses"
              className="inline-block px-6 py-3 bg-secondary text-white font-bold rounded-lg hover:bg-primary transition"
            >
              Browse Courses
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {enrollments.map((enrollment) => (
              <div key={enrollment.enrollmentId} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-primary mb-2">
                      {enrollment.course.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Instructor: {enrollment.course.instructor.name}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>{enrollment.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-accent h-2 rounded-full transition-all duration-300"
                          style={{ width: `${enrollment.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status Badge & Actions */}
                  <div className="ml-6">
                    {enrollment.completed ? (
                      <div className="space-y-2">
                        <div className="text-center mb-3">
                          <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full font-bold">
                            ✅ Completed
                          </span>
                        </div>
                        <button
                          onClick={() => handleGenerateCertificate(enrollment.enrollmentId)}
                          disabled={actionLoading === enrollment.enrollmentId}
                          className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-secondary transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                          {actionLoading === enrollment.enrollmentId ? '⏳ Generating...' : '📜 Download Certificate'}
                        </button>
                      </div>
                    ) : enrollment.progressPercent === 100 ? (
                      <div className="space-y-2">
                        <button
                          onClick={() => handleMarkComplete(enrollment.enrollmentId)}
                          disabled={actionLoading === enrollment.enrollmentId}
                          className="w-full px-6 py-2 bg-accent text-white rounded-lg hover:bg-secondary transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                          {actionLoading === enrollment.enrollmentId ? '⏳ Processing...' : '✓ Mark as Complete'}
                        </button>
                      </div>
                    ) : (
                      <a
                        href={`/learn/${enrollment.course.courseId}/${enrollment.enrollmentId}`}
                        className="block px-6 py-2 bg-secondary text-white rounded-lg hover:bg-primary transition text-center font-semibold"
                      >
                        Continue Learning
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t text-sm text-gray-500">
                  Enrolled on {new Date(enrollment.enrolledAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboardPage;