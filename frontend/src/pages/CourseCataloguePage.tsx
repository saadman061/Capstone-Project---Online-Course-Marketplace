import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { courseAPI, categoriesAPI } from '../api/client';
import CourseCard from '../components/CourseCard';

interface Course {
  courseId: string;
  title: string;
  description: string;
  price: number;
  avgRating: number;
  instructor?: { name: string };
  category?: { categoryId: string; name: string };
}

interface Category {
  categoryId: string;
  name: string;
}

const CourseCataloguePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);

  // Load categories and courses on mount
  useEffect(() => {
    loadCategoriesAndCourses();
  }, []);

  // Apply filters whenever any filter changes
  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedCategory, priceRange, allCourses]);

  const loadCategoriesAndCourses = async () => {
    try {
      setLoading(true);

      // Load categories
      const categoriesResponse = await categoriesAPI.getAll();
      const categoriesData = Array.isArray(categoriesResponse.data)
        ? categoriesResponse.data
        : categoriesResponse.data?.data || [];
      setCategories(categoriesData);

      // Load all published courses
      const coursesResponse = await courseAPI.getAll();
      const coursesData = Array.isArray(coursesResponse.data)
        ? coursesResponse.data
        : coursesResponse.data?.data || [];
      setAllCourses(coursesData);
    } catch (error) {
      console.error('Failed to load courses and categories:', error);
      setAllCourses([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allCourses];

    // Filter by search query (title, description, instructor name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.instructor?.name.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((course) => course.category?.categoryId === selectedCategory);
    }

    // Filter by price range
    filtered = filtered.filter((course) => course.price >= priceRange[0] && course.price <= priceRange[1]);

    setCourses(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">Course Catalogue</h1>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Courses</label>
            <input
              type="text"
              placeholder="Search by title, topic, or instructor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Price: ${priceRange[1]}</label>
            <input
              type="range"
              min="0"
              max="1000"
              step="10"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="w-full"
            />
          </div>
        </div>

        {/* Filter Info & Reset */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Found <span className="font-semibold text-primary">{courses.length}</span> course{courses.length !== 1 ? 's' : ''}
          </p>
          {(searchQuery || selectedCategory || priceRange[1] < 1000) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setPriceRange([0, 1000]);
              }}
              className="text-sm text-secondary hover:text-primary font-medium transition"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading courses...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.courseId} course={course} />
              ))}
            </div>

            {courses.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No courses found.</p>
                <p className="text-gray-500 mt-2">Try adjusting your search, category, or price filters.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CourseCataloguePage;