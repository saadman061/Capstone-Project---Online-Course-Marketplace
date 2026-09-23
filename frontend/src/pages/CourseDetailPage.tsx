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
}

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userRole = useSelector((state: RootState) => state.auth.user?.role);

  // Review form state
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchCourse();
    fetchReviews();
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

  const fetchReviews = async () => {
    try {
      if (courseId) {
        const response = await courseAPI.getReviews(courseId);
        setReviews(response.data);
      }
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
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
      await enrollmentAPI.enroll({
        courseId: course.courseId,
        coursePrice: course.price,
        paymentMethod: 'card'
      });
      alert('Enrolled successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Enrollment failed');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    if (reviewRating < 1) {
      setReviewError('Please select a star rating');
      return;
    }

    if (!courseId) return;

    try {
      setSubmittingReview(true);
      await courseAPI.submitReview(courseId, {
        rating: reviewRating,
        comment: reviewComment.trim() || undefined
      });
      setReviewRating(0);
      setReviewComment('');
      setReviewSuccess('Review submitted!');
      setTimeout(() => setReviewSuccess(''), 3000);
      await Promise.all([fetchReviews(), fetchCourse()]);
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setReviewError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
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
                  <span className="text-xl font-bold">{typeof course.avgRating === 'string' ? parseFloat(course.avgRating).toFixed(1) : course.avgRating.toFixed(1)}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>{i < Math.round(typeof course.avgRating === 'string' ? parseFloat(course.avgRating) : course.avgRating) ? '⭐' : '☆'}</span>
                    ))}
                  </div>
                </div>
              </div>
              {course.instructor && (
                <p className="text-lg mb-4">
                  Instructor: <span className="font-bold">{course.instructor.name}</span>
                </p>
              )}
              <p className="text-3xl font-bold mb-6">${typeof course.price === 'string' ? parseFloat(course.price).toFixed(2) : course.price.toFixed(2)}</p>

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
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">Student Reviews</h2>

              {isAuthenticated && userRole === 'student' && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h3 className="font-bold text-lg mb-3">Write a Review</h3>

                  {reviewError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                      {reviewError}
                    </div>
                  )}

                  {reviewSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
                      {reviewSuccess}
                    </div>
                  )}

                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Rating</label>
                      <div className="flex text-2xl">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="focus:outline-none"
                            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                          >
                            {star <= (hoverRating || reviewRating) ? '⭐' : '☆'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Comment (optional)</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={3}
                        placeholder="Share your thoughts on this course"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-6 py-2 bg-secondary text-white font-bold rounded-lg hover:bg-primary transition disabled:opacity-50"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                    <p className="text-xs text-gray-500">
                      You must be enrolled in this course to leave a review.
                    </p>
                  </form>
                </div>
              )}

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
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
              ) : (
                <p className="text-gray-600">No reviews yet. Be the first to review this course!</p>
              )}
            </section>
          </div>

          {/* Right Column (Sidebar) */}
          <div>
            <div className="bg-white rounded-lg shadow p-6 sticky top-20">
              <div className="mb-6">
                <p className="text-gray-600 mb-2">Course Price</p>
                <p className="text-3xl font-bold text-secondary">${typeof course.price === 'string' ? parseFloat(course.price).toFixed(2) : course.price.toFixed(2)}</p>
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
