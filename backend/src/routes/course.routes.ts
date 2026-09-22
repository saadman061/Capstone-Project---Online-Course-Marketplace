import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import CourseService from '../services/CourseService';
import ReviewService from '../services/ReviewService';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

// GET all courses (with filters)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, categoryId, instructorId } = req.query;
    const filters: any = {};

    // If instructorId is provided: show all statuses (instructor viewing their own courses)
    // If no instructorId: show only published (public browsing)
    if (instructorId) {
      // Instructor viewing their courses - show all statuses
      if (status) {
        filters.status = status as string;
      }
      // No default status filter for instructors
      filters.instructorId = instructorId;
    } else {
      // Public browsing - only show published courses
      filters.status = (status as string) || 'published';
    }

    if (categoryId) filters.categoryId = categoryId;

    console.log('📚 Fetching courses with filters:', filters);
    const courses = await CourseService.getCourses(filters);
    console.log('✅ Found', courses.length, 'courses');
    res.json(courses);
  } catch (error: any) {
    console.error('❌ Error fetching courses:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET course by ID
router.get('/:courseId', async (req: Request, res: Response) => {
  try {
    const course = await CourseService.getCourseById(req.params.courseId);
    res.json(course);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

// CREATE course (instructor only)
router.post(
  '/',
  authMiddleware,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('categoryId').notEmpty().withMessage('Category is required'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (req.user?.role !== 'instructor') {
        return res.status(403).json({ error: 'Only instructors can create courses' });
      }

      const course = await CourseService.createCourse(req.user.userId, req.body);
      res.status(201).json(course);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// UPDATE course (instructor only)
router.put(
  '/:courseId',
  authMiddleware,
  [
    body('title').optional().notEmpty(),
    body('description').optional().notEmpty(),
    body('price').optional().isFloat({ min: 0 }),
  ],
  async (req: Request, res: Response) => {
    try {
      if (req.user?.role !== 'instructor') {
        return res.status(403).json({ error: 'Only instructors can update courses' });
      }

      const course = await CourseService.updateCourse(
        req.params.courseId,
        req.user.userId,
        req.body
      );
      res.json(course);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// PUBLISH course (submit for review)
router.post('/:courseId/publish', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'instructor') {
      return res.status(403).json({ error: 'Only instructors can publish courses' });
    }

    const course = await CourseService.publishCourse(req.params.courseId, req.user.userId);
    res.json(course);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// APPROVE course (admin only)
router.post('/:courseId/approve', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can approve courses' });
    }

    const course = await CourseService.approveCourse(req.params.courseId);
    res.json(course);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// REJECT course (admin only)
router.post('/:courseId/reject', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can reject courses' });
    }

    const reason = req.body.reason || 'No reason provided';
    const course = await CourseService.rejectCourse(req.params.courseId, reason);
    res.json(course);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE course (instructor only)
router.delete('/:courseId', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'instructor') {
      return res.status(403).json({ error: 'Only instructors can delete courses' });
    }

    await CourseService.deleteCourse(req.params.courseId, req.user.userId);
    res.json({ message: 'Course deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// GET course reviews
router.get('/:courseId/reviews', async (req: Request, res: Response) => {
  try {
    const reviews = await ReviewService.getCourseReviews(req.params.courseId);
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// SUBMIT course review (student only)
router.post(
  '/:courseId/reviews',
  authMiddleware,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isString(),
  ],
  async (req: Request, res: Response) => {
    try {
      if (req.user?.role !== 'student') {
        return res.status(403).json({ error: 'Only students can submit reviews' });
      }

      const review = await ReviewService.submitReview(
        req.user.userId,
        req.params.courseId,
        req.body
      );
      res.status(201).json(review);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// ADD module to course (instructor only)
router.post('/:courseId/modules', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'instructor') {
      return res.status(403).json({ error: 'Only instructors can add modules' });
    }

    const module = await CourseService.addModule(
      req.params.courseId,
      req.user.userId,
      req.body
    );
    res.status(201).json(module);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ADD lesson to module (instructor only)
router.post('/:courseId/modules/:moduleId/lessons', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'instructor') {
      return res.status(403).json({ error: 'Only instructors can add lessons' });
    }

    const lesson = await CourseService.addLesson(
      req.params.moduleId,
      req.user.userId,
      req.body
    );
    res.status(201).json(lesson);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;