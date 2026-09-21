import React, { useState, useEffect } from 'react';
import { courseAPI } from '../api/client';
import CourseCard from '../components/CourseCard';

interface Course {
  courseId: string;
  title: string;
  description: string;
  price: number;
  avgRating: number;
  instructor?: { name: string };
  category?: { name: string };
}

const CourseCataloguePage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);

  const categories = [
    { id: 'cat-web-dev', name: 'Web Development' },
    { id: 'cat-mobile', name: 'Mobile Development' },
    { id: 'cat-data', name: 'Data Science' },
    { id: 'cat-ai', name: 'Artificial Intelligence' },
    { id: 'cat-cloud', name: 'Cloud Computing' }
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getAll();
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      // Set mock data
      setCourses([
        {
          courseId: '1',
          title: 'React.js Fundamentals',
          description: 'Learn React from the ground up',
          price: 49.99,
          avgRating: 4.8,
          instructor: { name: 'John Doe' },
          category: { name: 'Web Development' }
        },
        {
          courseId: '2',
          title: 'Advanced TypeScript',
          description: 'Master TypeScript for production apps',
          price: 59.99,
          avgRating: 4.9,
          instructor: { name: 'Jane Smith' },
          category: { name: 'Web Development' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      if (searchQuery) {
        const response = await courseAPI.search(searchQuery);
        setCourses(response.data);
      } else {
        await fetchCourses();
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesCategory = !selectedCategory || course.category?.id === selectedCategory;
    const matchesPrice = course.price >= priceRange[0] && course.price <= priceRange[1];
    return matchesCategory && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">Course Catalogue</h1>

        {/* Filters */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          {/* Search */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-primary transition"
              >
                Search
              </button>
            </div>
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
                <option key={cat.id} value={cat.id}>
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
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="w-full"
            />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading courses...</p>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">Found {filteredCourses.length} courses</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course.courseId} course={course} />
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">No courses found. Try adjusting your filters.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CourseCataloguePage;
