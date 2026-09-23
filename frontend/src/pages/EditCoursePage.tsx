import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { courseAPI, categoriesAPI } from '../api/client';
import { RootState } from '../redux/store';

interface Lesson {
  lessonId: string;
  title: string;
  videoUrl: string;
  durationSec: number;
}

interface Module {
  moduleId: string;
  title: string;
  sortOrder: number;
  lessons: Lesson[];
}

interface LessonFormState {
  title: string;
  videoUrl: string;
  duration: string;
}

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

  // Course content (modules & lessons)
  const [modules, setModules] = useState<Module[]>([]);
  const [addingModule, setAddingModule] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleError, setModuleError] = useState('');
  const [activeLessonModuleId, setActiveLessonModuleId] = useState<string | null>(null);
  const [lessonForms, setLessonForms] = useState<{ [moduleId: string]: LessonFormState }>({});
  const [lessonError, setLessonError] = useState('');

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
      setModules(course.modules || []);
    } catch (err: any) {
      console.error('Error fetching course:', err);
      setError('Failed to load course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getLessonForm = (moduleId: string): LessonFormState =>
    lessonForms[moduleId] || { title: '', videoUrl: '', duration: '' };

  const updateLessonForm = (moduleId: string, field: keyof LessonFormState, value: string) => {
    setLessonForms({
      ...lessonForms,
      [moduleId]: { ...getLessonForm(moduleId), [field]: value }
    });
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setModuleError('');

    if (!moduleTitle.trim()) {
      setModuleError('Module title is required');
      return;
    }

    if (!courseId) return;

    try {
      const response = await courseAPI.addModule(courseId, {
        title: moduleTitle,
        sortOrder: modules.length + 1
      });
      setModules([...modules, { ...response.data, lessons: [] }]);
      setModuleTitle('');
      setAddingModule(false);
    } catch (err: any) {
      console.error('Error adding module:', err);
      setModuleError(err.response?.data?.error || 'Failed to add module');
    }
  };

  const handleAddLesson = async (e: React.FormEvent, moduleId: string) => {
    e.preventDefault();
    setLessonError('');

    const form = getLessonForm(moduleId);
    if (!form.title.trim() || !form.videoUrl.trim() || !form.duration) {
      setLessonError('All lesson fields are required');
      return;
    }

    if (!courseId) return;

    try {
      const durationSec = Math.round(parseFloat(form.duration) * 60);
      const response = await courseAPI.addLesson(courseId, moduleId, {
        title: form.title,
        videoUrl: form.videoUrl,
        durationSec
      });

      setModules(modules.map(m =>
        m.moduleId === moduleId
          ? { ...m, lessons: [...(m.lessons || []), response.data] }
          : m
      ));
      setLessonForms({ ...lessonForms, [moduleId]: { title: '', videoUrl: '', duration: '' } });
      setActiveLessonModuleId(null);
    } catch (err: any) {
      console.error('Error adding lesson:', err);
      setLessonError(err.response?.data?.error || 'Failed to add lesson');
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

        {/* Course Content: Modules & Lessons */}
        <div className="bg-white rounded-lg shadow p-8 mt-8">
          <h2 className="text-2xl font-bold text-primary mb-6">Course Content</h2>

          {moduleError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {moduleError}
            </div>
          )}

          <div className="space-y-4 mb-6">
            {modules.length === 0 ? (
              <p className="text-gray-600">No modules yet. Add your first module below.</p>
            ) : (
              modules.map((module) => (
                <div key={module.moduleId} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-3">{module.title}</h3>

                  {module.lessons && module.lessons.length > 0 && (
                    <ul className="space-y-2 mb-3">
                      {module.lessons.map((lesson) => (
                        <li key={lesson.lessonId} className="flex items-center gap-3 text-gray-600 text-sm">
                          <span>▶️</span>
                          <span>{lesson.title}</span>
                          <span className="ml-auto text-gray-500">
                            {Math.floor(lesson.durationSec / 60)}m
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {activeLessonModuleId === module.moduleId ? (
                    <form
                      onSubmit={(e) => handleAddLesson(e, module.moduleId)}
                      className="space-y-3 mt-3 bg-gray-50 p-4 rounded-lg"
                    >
                      {lessonError && (
                        <div className="text-red-700 text-sm">{lessonError}</div>
                      )}
                      <input
                        type="text"
                        placeholder="Lesson title"
                        value={getLessonForm(module.moduleId).title}
                        onChange={(e) => updateLessonForm(module.moduleId, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                        required
                      />
                      <input
                        type="url"
                        placeholder="Video URL"
                        value={getLessonForm(module.moduleId).videoUrl}
                        onChange={(e) => updateLessonForm(module.moduleId, 'videoUrl', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                        required
                      />
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="Duration (minutes)"
                        value={getLessonForm(module.moduleId).duration}
                        onChange={(e) => updateLessonForm(module.moduleId, 'duration', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                        required
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-secondary text-white font-bold rounded-lg text-sm hover:bg-primary transition"
                        >
                          Save Lesson
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveLessonModuleId(null);
                            setLessonError('');
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-300 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveLessonModuleId(module.moduleId);
                        setLessonError('');
                      }}
                      className="text-secondary font-bold text-sm hover:text-primary transition"
                    >
                      + Add Lesson
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {addingModule ? (
            <form onSubmit={handleAddModule} className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <input
                type="text"
                placeholder="Module title"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-secondary text-white font-bold rounded-lg hover:bg-primary transition"
                >
                  Save Module
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddingModule(false);
                    setModuleTitle('');
                    setModuleError('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setAddingModule(true)}
              className="px-4 py-2 bg-secondary text-white font-bold rounded-lg hover:bg-primary transition"
            >
              + Add Module
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditCoursePage;
