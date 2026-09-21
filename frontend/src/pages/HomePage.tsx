import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

const HomePage: React.FC = () => {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await courseAPI.getAll({ limit: 6 });
        setFeaturedCourses(response.data);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        // Set mock data for demo
        setFeaturedCourses([
          {
            courseId: '1',
            title: 'React.js for Beginners',
            description: 'Learn React.js from scratch and build modern web applications.',
            price: 49.99,
            avgRating: 4.8,
            instructor: { name: 'John Doe' },
            category: { name: 'Web Development' },
          },
          {
            courseId: '2',
            title: 'Advanced TypeScript',
            description: 'Master TypeScript and write type-safe JavaScript code.',
            price: 59.99,
            avgRating: 4.9,
            instructor: { name: 'Jane Smith' },
            category: { name: 'Programming' },
          },
          {
            courseId: '3',
            title: 'Cloud Architecture with AWS',
            description: 'Design and deploy scalable cloud applications on AWS.',
            price: 79.99,
            avgRating: 4.7,
            instructor: { name: 'Mike Johnson' },
            category: { name: 'Cloud Computing' },
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Learn from the Best, Become the Best
            </h1>
            <p className="text-xl mb-8 text-gray-100">
              Access thousands of courses from industry experts and accelerate your career growth.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/courses"
                className="px-8 py-3 bg-white text-secondary font-bold rounded-lg hover:bg-gray-100 transition"
              >
                Explore Courses
              </Link>
              <Link
                to="/register?role=instructor"
                className="px-8 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-secondary transition"
              >
                Teach with Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-secondary">50K+</p>
              <p className="text-gray-700 mt-2">Active Students</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-secondary">1000+</p>
              <p className="text-gray-700 mt-2">Expert Instructors</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-secondary">5000+</p>
              <p className="text-gray-700 mt-2">Quality Courses</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-primary mb-2">Featured Courses</h2>
            <p className="text-gray-600">
              Discover our most popular and highly-rated courses
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading courses...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <CourseCard key={course.courseId} course={course} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/courses"
              className="inline-block px-8 py-3 bg-secondary text-white font-bold rounded-lg hover:bg-primary transition"
            >
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-primary mb-12 text-center">Why Choose Us?</h2>
          <div className="grid grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-4xl mb-4">🎯</p>
              <h3 className="font-bold text-lg mb-2 text-primary">Structured Learning</h3>
              <p className="text-gray-600">
                Courses designed by experts with clear learning paths and milestones.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-4xl mb-4">🏆</p>
              <h3 className="font-bold text-lg mb-2 text-primary">Certifications</h3>
              <p className="text-gray-600">
                Earn recognized certificates upon course completion to boost your resume.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-4xl mb-4">💬</p>
              <h3 className="font-bold text-lg mb-2 text-primary">Community Support</h3>
              <p className="text-gray-600">
                Connect with other learners and get help from instructors in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
