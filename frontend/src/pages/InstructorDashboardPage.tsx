import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { courseAPI, categoriesAPI } from '../api/client';
import { RootState } from '../redux/store';

interface Course {
  courseId: string;
  title: string;
  description: string;
  status: string;
  price: number;
  avgRating: number;
  createdAt: string;
}

const InstructorDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    categoryId: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const user = useSelector((state: RootState) => state.auth.user);

  // Call hooks BEFORE early return
  useEffect(() => {
    if (user?.role === 'instructor') {
      fetchCourses();
      fetchCategories();
    }
  }, [user?.role, user?.userId]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getAll({ instructorId: user?.userId });
      console.log('✅ Courses fetched:', response.data);
      setCourses(response.data);
    } catch (err: any) {
      console.error('❌ Error fetching courses:', err);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('📁 Fetching categories from API...');
      const response = await categoriesAPI.getAll();
      console.log('✅ Categories fetched:', response.data);
      setCategories(response.data);
    } catch (err: any) {
      console.error('❌ Error fetching categories:', err);
      setError('Failed to load categories. Please refresh the page.');
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.description || !formData.price || !formData.categoryId) {
      setError('All fields are required');
      return;
    }

    try {
      const response = await courseAPI.create({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId
      });

      setCourses([...courses, response.data]);
      setFormData({ title: '', description: '', price: '', categoryId: '' });
      setShowForm(false);
      setSuccess('Course created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error creating course:', err);
      setError(err.response?.data?.error || 'Failed to create course');
    }
  };

  const handlePublishCourse = async (courseId: string) => {
    setError('');
    setSuccess('');

    if (!window.confirm('Submit this course for review?')) {
      return;
    }

    try {
      await courseAPI.publish(courseId);
      setCourses(courses.map(c => 
        c.courseId === courseId ? { ...c, status: 'under_review' } : c
      ));
      setSuccess('Course submitted for review!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error publishing course:', err);
      setError(err.response?.data?.error || 'Failed to publish course');
    }
  };

  const handleResubmitCourse = async (courseId: string) => {
    setError('');
    setSuccess('');

    try {
      await courseAPI.resubmit(courseId);
      setCourses(courses.map(c =>
        c.courseId === courseId ? { ...c, status: 'draft' } : c
      ));
      setSuccess('Course moved back to draft — edit it and submit for review again.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      console.error('Error resubmitting course:', err);
      setError(err.response?.data?.error || 'Failed to resubmit course');
    }
  };

  const handleDiscontinueCourse = async (courseId: string) => {
    setError('');
    setSuccess('');

    if (!window.confirm('Discontinue this course? It will be archived and removed from the catalogue.')) {
      return;
    }

    try {
      await courseAPI.discontinue(courseId);
      setCourses(courses.map(c =>
        c.courseId === courseId ? { ...c, status: 'archived' } : c
      ));
      setSuccess('Course discontinued and archived.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error discontinuing course:', err);
      setError(err.response?.data?.error || 'Failed to discontinue course');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await courseAPI.delete(courseId);
      setCourses(courses.filter(c => c.courseId !== courseId));
      setSuccess('Course deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error deleting course:', err);
      setError(err.response?.data?.error || 'Failed to delete course');
    }
  };

  // Redirect if not instructor (after hooks)
  if (user?.role !== 'instructor') {
    return <Navigate to="/" />;
  }

  const statusColors: { [key: string]: string } = {
    published: 'bg-green-100 text-green-800',
    under_review: 'bg-yellow-100 text-yellow-800',
    draft: 'bg-gray-100 text-gray-800',
    rejected: 'bg-red-100 text-red-800',
    suspended: 'bg-orange-100 text-orange-800',
    archived: 'bg-gray-300 text-gray-800'
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

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
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter course title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your course"
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  required
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
                  <div className="flex-1 pr-4">
                    <h3 className="text-2xl font-bold text-primary mb-2">{course.title}</h3>
                    <p className="text-gray-600 mb-2 text-sm">{course.description.substring(0, 150)}...</p>
                    <div className="flex items-center gap-6 text-gray-600 text-sm">
                      <span>💰 ${typeof course.price === 'string' ? parseFloat(course.price).toFixed(2) : course.price.toFixed(2)}</span>
                      {course.avgRating > 0 && (
                        <span>⭐ {typeof course.avgRating === 'string' ? parseFloat(course.avgRating).toFixed(1) : course.avgRating.toFixed(1)} rating</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block px-4 py-2 rounded-full font-bold text-sm mb-4 ${statusColors[course.status]}`}>
                      {course.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <div className="space-y-2 flex flex-col items-end gap-2">
                      {course.status === 'draft' && (
                        <>
                          <button
                            onClick={() => navigate(`/edit-course/${course.courseId}`)}
                            className="px-4 py-2 text-secondary font-bold hover:text-primary transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handlePublishCourse(course.courseId)}
                            className="px-4 py-2 bg-secondary text-white font-bold rounded hover:bg-primary transition text-sm"
                          >
                            Publish
                          </button>
                        </>
                      )}
                      {course.status === 'rejected' && (
                        <button
                          onClick={() => handleResubmitCourse(course.courseId)}
                          className="px-4 py-2 bg-secondary text-white font-bold rounded hover:bg-primary transition text-sm"
                        >
                          Edit &amp; Resubmit
                        </button>
                      )}
                      {course.status === 'published' && (
                        <button
                          onClick={() => handleDiscontinueCourse(course.courseId)}
                          className="px-4 py-2 text-gray-700 font-bold hover:text-gray-900 transition text-sm"
                        >
                          Discontinue
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCourse(course.courseId)}
                        className="px-4 py-2 text-danger font-bold hover:opacity-70 transition"
                      >
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
