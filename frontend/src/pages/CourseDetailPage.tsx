import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { courseAPI, enrollmentAPI } from '../api/client';
import { RootState, cartActions } from '../redux/store';

interface Module {
  moduleId: string;
  title: string;
  lessons: Lesson[];
}

interface Lesson {
  lessonId: string;
  title: string;
  videoUrl: string;
  durationSec: number;
}

interface Review {
  reviewId: string;
  rating: number;
  comment: string;
  student: { name: string };
  createdAt: string;
}

interface Course {
  courseId: string;
  title: string;
  description: string;
  price: number;
  avgRating: number;
  instructor?: { name: string };
  category?: { name: string };
  modules?: Module[];
  reviews?: Review[];
}

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userRole = useSelector((state: RootState) => state.auth.user?.role);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      if (courseId) {
        const response = await courseAPI.getById(courseId);
        setCourse(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!course) return;

    dispatch(
      cartActions.addToCart({
        courseId: course.courseId,
        title: course.title,
        price: course.price
      })
    );
    alert('Added to cart!');
  };

  const handleEnrol = async () => {
    try {
      if (!course) return;
      await enrollmentAPI.create({
        courseId: course.courseId,
        paymentMethodId: 'stripe'
      });
      alert('Enrolled successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Enrollment failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading course...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">{error || 'Course not found'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-secondary to-accent text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 items-center">
            {/* Course Image Placeholder */}
            <div className="col-span-1">
              <div className="bg-white bg-opacity-20 rounded-lg h-48 flex items-center justify-center text-6xl">
                📖
              </div>
            </div>

            {/* Course Info */}
            <div className="col-span-2">
              <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
              {course.category && (
                <p className="text-lg text-gray-100 mb-2">{course.category.name}</p>
              )}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">{course.avgRating.toFixed(1)}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>{i < Math.round(course.avgRating) ? '⭐' : '☆'}</span>
                    ))}
                  </div>
                </div>
              </div>
              {course.instructor && (
                <p className="text-lg mb-4">
                  Instructor: <span className="font-bold">{course.instructor.name}</span>
                </p>
              )}
              <p className="text-3xl font-bold mb-6">${course.price.toFixed(2)}</p>

              {/* Action Buttons */}
              <div className="flex gap-4">
                {isAuthenticated && userRole === 'student' ? (
                  <>
                    <button
                      onClick={handleAddToCart}
                      className="px-6 py-3 bg-white text-secondary font-bold rounded-lg hover:bg-gray-100 transition"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={handleEnrol}
                      className="px-6 py-3 bg-accent text-white font-bold rounded-lg hover:bg-green-700 transition"
                    >
                      Enrol Now
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    className="px-6 py-3 bg-white text-secondary font-bold rounded-lg hover:bg-gray-100 transition"
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="col-span-2">
            {/* Description */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-primary mb-4">About This Course</h2>
              <p className="text-gray-600 leading-relaxed">{course.description}</p>
            </section>

            {/* Modules */}
            {course.modules && course.modules.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-primary mb-4">Course Contents</h2>
                <div className="space-y-4">
                  {course.modules.map((module) => (
                    <div key={module.moduleId} className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-bold text-lg mb-3">{module.title}</h3>
                      <ul className="space-y-2">
                        {module.lessons?.map((lesson) => (
                          <li key={lesson.lessonId} className="flex items-center gap-3 text-gray-600">
                            <span>▶️</span>
                            <span>{lesson.title}</span>
                            <span className="ml-auto text-sm text-gray-500">
                              {Math.floor(lesson.durationSec / 60)}m
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            {course.reviews && course.reviews.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-primary mb-4">Student Reviews</h2>
                <div className="space-y-4">
                  {course.reviews.map((review) => (
                    <div key={review.reviewId} className="bg-white rounded-lg shadow p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold">{review.student.name}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span key={i}>{i < review.rating ? '⭐' : '☆'}</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column (Sidebar) */}
          <div>
            <div className="bg-white rounded-lg shadow p-6 sticky top-20">
              <div className="mb-6">
                <p className="text-gray-600 mb-2">Course Price</p>
                <p className="text-3xl font-bold text-secondary">${course.price.toFixed(2)}</p>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full px-6 py-3 bg-secondary text-white font-bold rounded-lg hover:bg-primary transition mb-3"
              >
                Add to Cart
              </button>

              {isAuthenticated && userRole === 'student' && (
                <button
                  onClick={handleEnrol}
                  className="w-full px-6 py-3 bg-accent text-white font-bold rounded-lg hover:bg-green-700 transition"
                >
                  Enrol Now
                </button>
              )}

              <div className="mt-6 pt-6 border-t">
                <h3 className="font-bold mb-3">This course includes:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✅ Lifetime access</li>
                  <li>✅ Certificate of completion</li>
                  <li>✅ Downloadable resources</li>
                  <li>✅ 30-day money-back guarantee</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
