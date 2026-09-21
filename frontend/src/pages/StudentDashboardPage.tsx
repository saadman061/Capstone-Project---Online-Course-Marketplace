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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">My Learning</h1>
          <p className="text-gray-600">Continue learning and track your progress</p>
        </div>

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

                  {/* Status Badge */}
                  <div className="ml-6">
                    {enrollment.completed ? (
                      <div className="text-center">
                        <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full font-bold">
                          ✅ Completed
                        </span>
                      </div>
                    ) : (
                      <button className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-primary transition">
                        Continue Learning
                      </button>
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