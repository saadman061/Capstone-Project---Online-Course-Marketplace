import { Router, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../entities/User';
import { WishlistItem } from '../entities/Supporting';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { body, validationResult } from 'express-validator';

const router = Router();

// Get user profile
router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userRepo = getRepository(User);
    const user = await userRepo.findOne({ where: { userId: req.user!.userId } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't return password hash
    const { passwordHash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/profile', authMiddleware, [
  body('name').optional().isLength({ min: 2 }),
  body('bio').optional().isLength({ min: 5 })
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userRepo = getRepository(User);
    const user = await userRepo.findOne({ where: { userId: req.user!.userId } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.bio && 'bio' in user) {
      (user as any).bio = req.body.bio;
    }

    await userRepo.save(user);

    const { passwordHash, ...userWithoutPassword } = user;
    res.json({ message: 'Profile updated', user: userWithoutPassword });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get wishlist
router.get('/wishlist', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const wishlistRepo = getRepository(WishlistItem);
    const items = await wishlistRepo.find({
      where: { studentId: req.user!.userId },
      relations: ['course']
    });

    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add to wishlist
router.post('/wishlist', authMiddleware, [
  body('courseId').isUUID()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { courseId } = req.body;
    const wishlistRepo = getRepository(WishlistItem);

    // Check if already in wishlist
    const existing = await wishlistRepo.findOne({
      where: { studentId: req.user!.userId, courseId }
    });

    if (existing) {
      return res.status(400).json({ error: 'Already in wishlist' });
    }

    const item = new WishlistItem();
    item.wishlistItemId = require('uuid').v4();
    item.studentId = req.user!.userId;
    item.courseId = courseId;

    await wishlistRepo.save(item);

    res.status(201).json({ message: 'Added to wishlist', item });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Remove from wishlist
router.delete('/wishlist/:courseId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const wishlistRepo = getRepository(WishlistItem);
    const item = await wishlistRepo.findOne({
      where: { studentId: req.user!.userId, courseId: req.params.courseId }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not in wishlist' });
    }

    await wishlistRepo.remove(item);
    res.json({ message: 'Removed from wishlist' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
