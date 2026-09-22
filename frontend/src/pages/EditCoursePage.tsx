import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { courseAPI, categoriesAPI } from '../api/client';
import { RootState } from '../redux/store';

const EditCoursePage: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const auth = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    categoryId: ''
  });
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchCourse();
    fetchCategories();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      if (!courseId) return;
      
      const response = await courseAPI.getById(courseId);
      const course = response.data;

      setFormData({
        title: course.title || '',
        description: course.description || '',
        price: course.price?.toString() || '',
        categoryId: course.categoryId || course.category?.categoryId || ''
      });
    } catch (err: any) {
      console.error('Error fetching course:', err);
      setError('Failed to load course. Please try again.');
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
      setError('Failed to load categories');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.description || !formData.price || !formData.categoryId) {
      setError('All fields are required');
      return;
    }

    if (!courseId) {
      setError('Course ID not found');
      return;
    }

    try {
      await courseAPI.update(courseId, {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId
      });

      setSuccess('Course updated successfully!');
      setTimeout(() => navigate('/instructor/dashboard'), 2000);
    } catch (err: any) {
      console.error('Error updating course:', err);
      setError(err.response?.data?.error || 'Failed to update course');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading course...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/instructor/dashboard')}
          className="mb-6 text-secondary hover:text-primary font-medium"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-primary mb-6">Edit Course</h1>

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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                required
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-secondary text-white font-bold rounded-lg hover:bg-primary transition"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => navigate('/instructor/dashboard')}
                className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCoursePage;