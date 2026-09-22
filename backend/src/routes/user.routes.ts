import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { getRepository } from 'typeorm';
import { User, Student, Instructor } from '../entities/User';
import { WishlistItem } from '../entities/Supporting';
import authMiddleware from '../middleware/auth.middleware';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET user profile
router.get('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { userId: req.user.userId } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      bio: (user as any).bio,
      payoutAccount: (user as any).payoutAccount,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE user profile
router.put(
  '/profile',
  authMiddleware,
  [
    body('name').optional().notEmpty(),
    body('bio').optional().isString(),
    body('payoutAccount').optional().isString(),
  ],
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ where: { userId: req.user.userId } });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (req.body.name) user.name = req.body.name;
      if (req.body.bio) (user as any).bio = req.body.bio;
      if (req.body.payoutAccount) (user as any).payoutAccount = req.body.payoutAccount;

      await userRepository.save(user);

      res.json({
        message: 'Profile updated successfully',
        user,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET wishlist
router.get('/wishlist', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'student') {
      return res.status(403).json({ error: 'Only students have a wishlist' });
    }

    const wishlistRepository = getRepository(WishlistItem);
    const wishlist = await wishlistRepository.find({
      where: { studentId: req.user.userId },
      relations: ['course', 'course.instructor'],
    });

    res.json(wishlist);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ADD to wishlist
router.post(
  '/wishlist',
  authMiddleware,
  [
    body('courseId').notEmpty().withMessage('Course ID is required'),
  ],
  async (req: Request, res: Response) => {
    try {
      if (req.user?.role !== 'student') {
        return res.status(403).json({ error: 'Only students can add to wishlist' });
      }

      const wishlistRepository = getRepository(WishlistItem);

      // Check if already in wishlist
      const existing = await wishlistRepository.findOne({
        where: { studentId: req.user.userId, courseId: req.body.courseId },
      });

      if (existing) {
        return res.status(400).json({ error: 'Course already in wishlist' });
      }

      const item = new WishlistItem();
      item.wishlistItemId = uuidv4();
      item.studentId = req.user.userId;
      item.courseId = req.body.courseId;

      await wishlistRepository.save(item);

      res.status(201).json(item);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// REMOVE from wishlist
router.delete('/wishlist/:courseId', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'student') {
      return res.status(403).json({ error: 'Only students can remove from wishlist' });
    }

    const wishlistRepository = getRepository(WishlistItem);
    const item = await wishlistRepository.findOne({
      where: { studentId: req.user.userId, courseId: req.params.courseId },
    });

    if (!item) {
      return res.status(404).json({ error: 'Course not in wishlist' });
    }

    await wishlistRepository.remove(item);

    res.json({ message: 'Removed from wishlist' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;