import { getRepository } from 'typeorm';
import { Course, CourseStatus } from '../entities/Course';
import { User } from '../entities/User';
import { Enrollment } from '../entities/Enrollment';
import { Review } from '../entities/Supporting';

export class AdminService {
  async getPendingCourses() {
    const courseRepository = getRepository(Course);

    return await courseRepository.find({
      where: { status: CourseStatus.UNDER_REVIEW },
      relations: ['instructor', 'category'],
    });
  }

  async getPublishedCourses() {
    const courseRepository = getRepository(Course);

    return await courseRepository.find({
      where: { status: CourseStatus.PUBLISHED },
      relations: ['instructor', 'category'],
    });
  }

  async approveCourse(courseId: string) {
    const courseRepository = getRepository(Course);

    const course = await courseRepository.findOne({ where: { courseId } });
    if (!course) {
      throw new Error('Course not found');
    }

    course.status = CourseStatus.PUBLISHED;
    await courseRepository.save(course);
    return course;
  }

  async rejectCourse(courseId: string, reason: string) {
    const courseRepository = getRepository(Course);

    const course = await courseRepository.findOne({ where: { courseId } });
    if (!course) {
      throw new Error('Course not found');
    }

    course.status = CourseStatus.REJECTED;
    await courseRepository.save(course);
    return course;
  }

  async getAllUsers() {
    const userRepository = getRepository(User);

    return await userRepository.find();
  }

  async suspendUser(userId: string) {
    const userRepository = getRepository(User);

    const user = await userRepository.findOne({ where: { userId } });
    if (!user) {
      throw new Error('User not found');
    }

    user.status = 'suspended';
    await userRepository.save(user);
    return user;
  }

  async activateUser(userId: string) {
    const userRepository = getRepository(User);

    const user = await userRepository.findOne({ where: { userId } });
    if (!user) {
      throw new Error('User not found');
    }

    user.status = 'active';
    await userRepository.save(user);
    return user;
  }

  async getPlatformAnalytics() {
    const userRepository = getRepository(User);
    const courseRepository = getRepository(Course);
    const enrollmentRepository = getRepository(Enrollment);
    const reviewRepository = getRepository(Review);

    const totalUsers = await userRepository.count();
    const totalCourses = await courseRepository.count();
    const publishedCourses = await courseRepository.count({ where: { status: CourseStatus.PUBLISHED } });
    const totalEnrollments = await enrollmentRepository.count();
    const totalReviews = await reviewRepository.count();

    const reviews = await reviewRepository.find();
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return {
      totalUsers,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      totalReviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
    };
  }
}

export default new AdminService();