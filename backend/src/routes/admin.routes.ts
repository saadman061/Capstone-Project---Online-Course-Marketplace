import { Router, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Course, CourseStatus } from '../entities/Course';
import { User } from '../entities/User';
import { Enrollment } from '../entities/Enrollment';
import { Review } from '../entities/Supporting';
import { authMiddleware, AuthRequest, roleMiddleware } from '../middleware/auth.middleware';
import { body, validationResult, param } from 'express-validator';

const router = Router();

// Get all courses for review (admin only)
router.get('/courses', authMiddleware, roleMiddleware(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const courseRepo = getRepository(Course);

    let query = courseRepo.createQueryBuilder('course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('course.category', 'category');

    if (status) {
      query = query.where('course.status = :status', { status });
    } else {
      // Show all non-archived
      query = query.where('course.status != :status', { status: CourseStatus.ARCHIVED });
    }

    const courses = await query.orderBy('course.createdAt', 'DESC').getMany();

    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Approve course (admin only)
router.post('/courses/:id/approve', authMiddleware, roleMiddleware(['admin']), [
  param('id').isUUID()
], async (req: AuthRequest, res: Response) => {
  try {
    const courseRepo = getRepository(Course);
    const course = await courseRepo.findOne({ where: { courseId: req.params.id } });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.status !== CourseStatus.UNDER_REVIEW) {
      return res.status(400).json({ error: 'Only courses under review can be approved' });
    }

    course.status = CourseStatus.PUBLISHED;
    await courseRepo.save(course);

    // TODO: Send notification to instructor
    // await notificationService.notifyInstructor(course.instructorId, 'Course Approved!');

    res.json({ message: 'Course approved and published', course });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reject course (admin only)
router.post('/courses/:id/reject', authMiddleware, roleMiddleware(['admin']), [
  param('id').isUUID(),
  body('reason').notEmpty().isLength({ min: 10 })
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reason } = req.body;
    const courseRepo = getRepository(Course);
    const course = await courseRepo.findOne({ where: { courseId: req.params.id } });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.status !== CourseStatus.UNDER_REVIEW) {
      return res.status(400).json({ error: 'Only courses under review can be rejected' });
    }

    course.status = CourseStatus.REJECTED;
    await courseRepo.save(course);

    // TODO: Send notification to instructor with reason
    // await notificationService.notifyInstructor(
    //   course.instructorId,
    //   `Course Rejected: ${reason}`
    // );

    res.json({ message: 'Course rejected', course, reason });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (admin only)
router.get('/users', authMiddleware, roleMiddleware(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { role, status } = req.query;
    const userRepo = getRepository(User);

    let query = userRepo.createQueryBuilder('user');

    if (role) {
      query = query.where('user.role = :role', { role });
    }
    if (status) {
      query = query.andWhere('user.status = :status', { status });
    }

    const users = await query.orderBy('user.createdAt', 'DESC').getMany();

    // Remove password hashes
    const usersWithoutPasswords = users.map(u => {
      const { passwordHash, ...userWithoutPassword } = u;
      return userWithoutPassword;
    });

    res.json(usersWithoutPasswords);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Suspend user (admin only)
router.post('/users/:id/suspend', authMiddleware, roleMiddleware(['admin']), [
  param('id').isUUID(),
  body('reason').notEmpty()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userRepo = getRepository(User);
    const user = await userRepo.findOne({ where: { userId: req.params.id } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.status = 'suspended';
    await userRepo.save(user);

    res.json({ message: 'User suspended', user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get platform analytics (admin only)
router.get('/analytics/summary', authMiddleware, roleMiddleware(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const userRepo = getRepository(User);
    const courseRepo = getRepository(Course);
    const enrollmentRepo = getRepository(Enrollment);
    const reviewRepo = getRepository(Review);

    const totalUsers = await userRepo.count();
    const totalCourses = await courseRepo.count();
    const totalEnrollments = await enrollmentRepo.count();
    const publishedCourses = await courseRepo.count({ where: { status: CourseStatus.PUBLISHED } });
    const averageRating = await reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .getRawOne();

    res.json({
      totalUsers,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      averageRating: parseFloat(averageRating?.avg || 0),
      timestamp: new Date()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
