import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../redux/store';

interface Course {
  courseId: string;
  title: string;
  status: string;
  enrollments: number;
  avgRating: number;
  createdAt: string;
}

const InstructorDashboardPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);

  // Call hooks BEFORE early return
  useEffect(() => {
    if (user?.role === 'instructor') {
      // Simulate fetching courses
      setTimeout(() => {
        setCourses([
          {
            courseId: '1',
            title: 'React Fundamentals',
            status: 'published',
            enrollments: 42,
            avgRating: 4.8,
            createdAt: '2025-01-10'
          },
          {
            courseId: '2',
            title: 'Advanced TypeScript',
            status: 'under_review',
            enrollments: 0,
            avgRating: 0,
            createdAt: '2025-01-15'
          }
        ]);
        setLoading(false);
      }, 500);
    }
  }, [user?.role]);

  // Redirect if not instructor (after hooks)
  if (user?.role !== 'instructor') {
    return <Navigate to="/" />;
  }

  const statusColors: { [key: string]: string } = {
    published: 'bg-green-100 text-green-800',
    under_review: 'bg-yellow-100 text-yellow-800',
    draft: 'bg-gray-100 text-gray-800',
    rejected: 'bg-red-100 text-red-800'
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary">My Courses</h1>
            <p className="text-gray-600">Create and manage your courses</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-secondary text-white font-bold rounded-lg hover:bg-primary transition"
          >
            {showForm ? '✕ Cancel' : '+ Create Course'}
          </button>
        </div>

        {/* Create Course Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">Create New Course</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                <input
                  type="text"
                  placeholder="Enter course title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary">
                  <option>Web Development</option>
                  <option>Mobile Development</option>
                  <option>Data Science</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Describe your course"
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-secondary text-white font-bold rounded-lg hover:bg-primary transition"
              >
                Create Course
              </button>
            </form>
          </div>
        )}

        {/* Course List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading your courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-2xl font-bold text-gray-700 mb-4">No courses yet</p>
            <p className="text-gray-600 mb-6">Get started by creating your first course!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {courses.map((course) => (
              <div key={course.courseId} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-primary mb-2">{course.title}</h3>
                    <div className="flex items-center gap-4 text-gray-600">
                      <span>👥 {course.enrollments} students</span>
                      {course.avgRating > 0 && <span>⭐ {course.avgRating.toFixed(1)} rating</span>}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block px-4 py-2 rounded-full font-bold text-sm mb-4 ${statusColors[course.status]}`}>
                      {course.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <div className="space-x-2">
                      <button className="px-4 py-2 text-secondary font-bold hover:text-primary">
                        Edit
                      </button>
                      <button className="px-4 py-2 text-danger font-bold hover:opacity-70">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t text-sm text-gray-500">
                  Created on {new Date(course.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboardPage;
