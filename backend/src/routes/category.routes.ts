import { Router, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Category } from '../entities/Category';

const router = Router();

// GET all categories
router.get('/', async (req: Request, res: Response) => {
  try {
    const categoryRepo = getRepository(Category);
    const categories = await categoryRepo.createQueryBuilder('category').getMany();
    console.log('✅ Categories fetched:', categories);
    res.json(categories);
  } catch (error: any) {
    console.error('❌ Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;