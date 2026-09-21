import { Router, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Course, CourseStatus } from '../entities/Course';
import { authMiddleware, AuthRequest, roleMiddleware } from '../middleware/auth.middleware';
import { body, validationResult, param } from 'express-validator';

const router = Router();

// Get all courses (public, with filtering)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, minPrice, maxPrice, search, limit = 10, offset = 0 } = req.query;
    const courseRepo = getRepository(Course);

    let query = courseRepo.createQueryBuilder('course')
      .where('course.status = :status', { status: CourseStatus.PUBLISHED })
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('course.category', 'category');

    // Filters
    if (category) {
      query = query.andWhere('course.categoryId = :categoryId', { categoryId: category });
    }
    if (minPrice) {
      query = query.andWhere('course.price >= :minPrice', { minPrice: parseFloat(minPrice as string) });
    }
    if (maxPrice) {
      query = query.andWhere('course.price <= :maxPrice', { maxPrice: parseFloat(maxPrice as string) });
    }
    if (search) {
      query = query.andWhere('MATCH(course.title, course.description) AGAINST(:search IN BOOLEAN MODE)', { search });
    }

    const total = await query.getCount();
    const courses = await query
      .orderBy('course.createdAt', 'DESC')
      .take(parseInt(limit as string))
      .skip(parseInt(offset as string))
      .getMany();

    res.json({ total, courses, limit: parseInt(limit as string), offset: parseInt(offset as string) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get course by ID
router.get('/:id', [param('id').isUUID()], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const courseRepo = getRepository(Course);
    const course = await courseRepo.findOne({
      where: { courseId: req.params.id },
      relations: ['instructor', 'category', 'modules', 'reviews']
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new course (instructor only)
router.post('/', authMiddleware, roleMiddleware(['instructor']), [
  body('title').notEmpty().isLength({ min: 5 }),
  body('description').notEmpty().isLength({ min: 20 }),
  body('categoryId').isUUID(),
  body('price').isFloat({ min: 0 })
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const courseRepo = getRepository(Course);
    const { title, description, categoryId, price } = req.body;

    const course = new Course();
    course.courseId = require('uuid').v4();
    course.title = title;
    course.description = description;
    course.categoryId = categoryId;
    course.price = parseFloat(price);
    course.instructorId = req.user!.userId;
    course.status = CourseStatus.DRAFT;

    await courseRepo.save(course);

    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update course (instructor only)
router.put('/:id', authMiddleware, roleMiddleware(['instructor']), [
  param('id').isUUID(),
  body('title').optional().isLength({ min: 5 }),
  body('description').optional().isLength({ min: 20 }),
  body('price').optional().isFloat({ min: 0 })
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const courseRepo = getRepository(Course);
    const course = await courseRepo.findOne({ where: { courseId: req.params.id } });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Only instructor can edit their course
    if (course.instructorId !== req.user!.userId) {
      return res.status(403).json({ error: 'You can only edit your own courses' });
    }

    // Can only edit if not published
    if (course.status === CourseStatus.PUBLISHED) {
      return res.status(400).json({ error: 'Cannot edit published courses' });
    }

    Object.assign(course, req.body);
    await courseRepo.save(course);

    res.json({ message: 'Course updated successfully', course });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete course (instructor only)
router.delete('/:id', authMiddleware, roleMiddleware(['instructor']), [
  param('id').isUUID()
], async (req: AuthRequest, res: Response) => {
  try {
    const courseRepo = getRepository(Course);
    const course = await courseRepo.findOne({ where: { courseId: req.params.id } });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.instructorId !== req.user!.userId) {
      return res.status(403).json({ error: 'You can only delete your own courses' });
    }

    await courseRepo.remove(course);
    res.json({ message: 'Course deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Submit course for review
router.patch('/:id/submit-review', authMiddleware, roleMiddleware(['instructor']), [
  param('id').isUUID()
], async (req: AuthRequest, res: Response) => {
  try {
    const courseRepo = getRepository(Course);
    const course = await courseRepo.findOne({ where: { courseId: req.params.id } });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.instructorId !== req.user!.userId) {
      return res.status(403).json({ error: 'You can only submit your own courses' });
    }

    if (course.status !== CourseStatus.DRAFT) {
      return res.status(400).json({ error: 'Only draft courses can be submitted' });
    }

    course.status = CourseStatus.UNDER_REVIEW;
    await courseRepo.save(course);

    res.json({ message: 'Course submitted for review', course });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
