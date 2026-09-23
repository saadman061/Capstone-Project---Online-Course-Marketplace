import { Router, Request, Response } from 'express';
import NotificationService from '../services/NotificationService';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

// GET my notifications
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const notifications = await NotificationService.getUserNotifications(req.user.userId);
    res.json(notifications);
  } catch (error: any) {
    console.error('❌ Error fetching notifications:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// MARK a single notification as read
router.put('/:notificationId/read', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const notification = await NotificationService.markAsRead(req.params.notificationId, req.user.userId);
    res.json(notification);
  } catch (error: any) {
    console.error('❌ Error marking notification as read:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// MARK all notifications as read
router.post('/read-all', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    await NotificationService.markAllAsRead(req.user.userId);
    res.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    console.error('❌ Error marking notifications as read:', error.message);
    res.status(400).json({ error: error.message });
  }
});

export default router;
