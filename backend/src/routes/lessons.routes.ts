import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import LessonProgressService from '../services/LessonProgressService';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

// MARK lesson as complete
router.post(
  '/:enrollmentId/lessons/:lessonId/complete',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { enrollmentId, lessonId } = req.params;

      console.log(`📚 Marking lesson as complete: enrollment=${enrollmentId}, lesson=${lessonId}`);

      // Mark lesson as complete
      const lessonProgress = await LessonProgressService.completeLessonForStudent(
        enrollmentId,
        lessonId,
        req.user.userId
      );

      res.json({
        message: 'Lesson marked as complete',
        lessonProgress
      });
    } catch (error: any) {
      console.error('❌ Error marking lesson complete:', error.message);
      res.status(400).json({ error: error.message });
    }
  }
);

// GET lesson progress for enrollment
router.get(
  '/:enrollmentId/progress',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { enrollmentId } = req.params;

      const progress = await LessonProgressService.getLessonProgress(enrollmentId);
      const totalLessons = 0; // Will calculate from course

      res.json({
        enrollmentId,
        completedLessons: progress.length,
        lessonProgress: progress
      });
    } catch (error: any) {
      console.error('❌ Error fetching lesson progress:', error.message);
      res.status(400).json({ error: error.message });
    }
  }
);

// CHECK if lesson is completed
router.get(
  '/:enrollmentId/lessons/:lessonId/status',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { enrollmentId, lessonId } = req.params;

      const isCompleted = await LessonProgressService.isLessonCompleted(enrollmentId, lessonId);

      res.json({
        enrollmentId,
        lessonId,
        completed: isCompleted
      });
    } catch (error: any) {
      console.error('❌ Error checking lesson status:', error.message);
      res.status(400).json({ error: error.message });
    }
  }
);

// GET all progress for student
router.get(
  '/student/me/all',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const progress = await LessonProgressService.getStudentLessonProgress(req.user.userId);

      res.json(progress);
    } catch (error: any) {
      console.error('❌ Error fetching student progress:', error.message);
      res.status(400).json({ error: error.message });
    }
  }
);

// RESET lesson progress (admin only)
router.post(
  '/:enrollmentId/reset',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can reset progress' });
      }

      const { enrollmentId } = req.params;

      const updatedEnrollment = await LessonProgressService.resetLessonProgress(enrollmentId);

      res.json({
        message: 'Lesson progress reset',
        enrollment: updatedEnrollment
      });
    } catch (error: any) {
      console.error('❌ Error resetting progress:', error.message);
      res.status(400).json({ error: error.message });
    }
  }
);

export default router;
