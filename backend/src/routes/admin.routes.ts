import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import AdminService from '../services/AdminService';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

// Middleware to check admin role
const adminOnly = (req: Request, res: Response, next: Function) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// GET pending courses (admin only)
router.get('/courses/pending', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const courses = await AdminService.getPendingCourses();
    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET published courses (admin only)
router.get('/courses/published', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const courses = await AdminService.getPublishedCourses();
    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET suspended courses (admin only)
router.get('/courses/suspended', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const courses = await AdminService.getSuspendedCourses();
    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// SUSPEND course (admin only)
router.post('/courses/:courseId/suspend', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const course = await AdminService.suspendCourse(req.params.courseId);
    res.json(course);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// REINSTATE course (admin only)
router.post('/courses/:courseId/reinstate', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const course = await AdminService.reinstateCourse(req.params.courseId);
    res.json(course);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ARCHIVE course (admin only)
router.post('/courses/:courseId/archive', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const course = await AdminService.archiveCourse(req.params.courseId);
    res.json(course);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// APPROVE course (admin only)
router.post(
  '/courses/:courseId/approve',
  authMiddleware,
  adminOnly,
  async (req: Request, res: Response) => {
    try {
      const course = await AdminService.approveCourse(req.params.courseId);
      res.json(course);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// REJECT course (admin only)
router.post(
  '/courses/:courseId/reject',
  authMiddleware,
  adminOnly,
  [
    body('reason').notEmpty().withMessage('Rejection reason is required'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const course = await AdminService.rejectCourse(req.params.courseId, req.body.reason);
      res.json(course);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// CREATE a support agent user (admin only)
router.post(
  '/users/support-agent',
  authMiddleware,
  adminOnly,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('A valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const agent = await AdminService.createSupportAgent(req.body);
      res.status(201).json({
        userId: agent.userId,
        name: agent.name,
        email: agent.email,
        role: agent.role,
        status: agent.status
      });
    } catch (error: any) {
      console.error('❌ Error creating support agent:', error.message);
      res.status(400).json({ error: error.message });
    }
  }
);

// GET all users (admin only)
router.get('/users', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const users = await AdminService.getAllUsers();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// SUSPEND user (admin only)
router.post(
  '/users/:userId/suspend',
  authMiddleware,
  adminOnly,
  async (req: Request, res: Response) => {
    try {
      const user = await AdminService.suspendUser(req.params.userId);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// ACTIVATE user (admin only)
router.post(
  '/users/:userId/activate',
  authMiddleware,
  adminOnly,
  async (req: Request, res: Response) => {
    try {
      const user = await AdminService.activateUser(req.params.userId);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// GET platform analytics (admin only)
router.get('/analytics', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const analytics = await AdminService.getPlatformAnalytics();
    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
