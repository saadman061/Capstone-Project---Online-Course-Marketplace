import { Router, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Student, Instructor } from '../entities/User';
import { Course, CourseStatus } from '../entities/Course';

const router = Router();

router.get('/public', async (req: Request, res: Response) => {
  try {
    const studentRepo = getRepository(Student);
    const instructorRepo = getRepository(Instructor);
    const courseRepo = getRepository(Course);
    const [totalStudents, totalInstructors, totalCourses] = await Promise.all([
      studentRepo.count(),
      instructorRepo.count(),
      courseRepo.count({ where: { status: CourseStatus.PUBLISHED } }),
    ]);
    res.json({ totalStudents, totalInstructors, totalCourses });
  } catch (error: any) {
    console.error('❌ Error fetching public stats:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
