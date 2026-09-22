import { getRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Review } from '../entities/Supporting';
import { Course } from '../entities/Course';
import { Student } from '../entities/User';
import { Enrollment } from '../entities/Enrollment';

export class ReviewService {
  async submitReview(studentId: string, courseId: string, data: { rating: number; comment?: string }) {
    const reviewRepository = getRepository(Review);
    const courseRepository = getRepository(Course);
    const enrollmentRepository = getRepository(Enrollment);

    // Verify student is enrolled in the course
    const enrollment = await enrollmentRepository.findOne({
      where: { studentId, courseId },
    });

    if (!enrollment) {
      throw new Error('Must be enrolled in the course to leave a review');
    }

    // Check if review already exists
    const existingReview = await reviewRepository.findOne({
      where: { studentId, courseId },
    });

    if (existingReview) {
      throw new Error('You have already reviewed this course');
    }

    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const review = new Review();
    review.reviewId = uuidv4();
    review.studentId = studentId;
    review.courseId = courseId;
    review.rating = data.rating;
    review.comment = data.comment || '';

    await reviewRepository.save(review);

    // Update course average rating
    await this.updateCourseRating(courseId);

    return review;
  }

  async getCourseReviews(courseId: string) {
    const reviewRepository = getRepository(Review);

    return await reviewRepository.find({
      where: { courseId },
      relations: ['student'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateCourseRating(courseId: string) {
    const reviewRepository = getRepository(Review);
    const courseRepository = getRepository(Course);

    const reviews = await reviewRepository.find({ where: { courseId } });

    if (reviews.length === 0) {
      return;
    }

    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    const course = await courseRepository.findOne({ where: { courseId } });
    if (course) {
      course.avgRating = parseFloat(averageRating.toFixed(1));
      await courseRepository.save(course);
    }
  }

  async deleteReview(reviewId: string, studentId: string) {
    const reviewRepository = getRepository(Review);

    const review = await reviewRepository.findOne({ where: { reviewId } });
    if (!review) {
      throw new Error('Review not found');
    }

    if (review.studentId !== studentId) {
      throw new Error('Unauthorized: You can only delete your own reviews');
    }

    await reviewRepository.remove(review);

    // Update course rating
    await this.updateCourseRating(review.courseId);
  }
}

export default new ReviewService();