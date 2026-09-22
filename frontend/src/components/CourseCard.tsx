import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { cartActions } from '../redux/store';

interface Course {
  courseId: string;
  title: string;
  description: string;
  price: number;
  avgRating: number;
  instructor?: {
    name: string;
  };
  category?: {
    name: string;
  };
}

interface CourseCardProps {
  course: Course;
  onViewDetails?: (courseId: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onViewDetails }) => {
  const dispatch = useDispatch();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(
      cartActions.addToCart({
        courseId: course.courseId,
        title: course.title,
        price: course.price,
      })
    );
    // Show toast notification
    alert('Course added to cart!');
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(course.courseId);
    }
  };

  return (
    <Link to={`/courses/${course.courseId}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden h-full flex flex-col">
        {/* Course Image Placeholder */}
        <div className="w-full h-40 bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white text-4xl">
          📖
        </div>

        {/* Course Info */}
        <div className="p-4 flex-grow flex flex-col">
          {/* Category Badge */}
          {course.category && (
            <span className="inline-block text-xs font-semibold text-white bg-secondary px-2 py-1 rounded mb-2 w-fit">
              {course.category.name}
            </span>
          )}

          {/* Title */}
          <h3 className="font-bold text-lg mb-2 text-primary hover:text-secondary truncate">
            {course.title}
          </h3>

          {/* Instructor */}
          {course.instructor && (
            <p className="text-sm text-gray-600 mb-2">
              by <span className="font-medium">{course.instructor.name}</span>
            </p>
          )}

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3 flex-grow line-clamp-2">
            {course.description}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <span className="text-sm font-medium">{typeof course.avgRating === 'string' ? parseFloat(course.avgRating).toFixed(1) : course.avgRating.toFixed(1)}</span>
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.round(typeof course.avgRating === 'string' ? parseFloat(course.avgRating) : course.avgRating) ? '⭐' : '☆'}>
                  {i < Math.round(typeof course.avgRating === 'string' ? parseFloat(course.avgRating) : course.avgRating) ? '⭐' : '☆'}
                </span>
              ))}
            </div>
          </div>

          {/* Price and Button */}
          <div className="flex justify-between items-center pt-3 border-t">
            <span className="text-xl font-bold text-secondary">
              ${typeof course.price === 'string' ? parseFloat(course.price).toFixed(2) : course.price.toFixed(2)}
            </span>
            <button
              onClick={handleAddToCart}
              className="bg-accent text-white px-3 py-1 rounded hover:bg-primary text-sm font-medium transition"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;