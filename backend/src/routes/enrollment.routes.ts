import { Router, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Enrollment } from '../entities/Enrollment';
import { Course } from '../entities/Course';
import { Payment, PaymentStatus } from '../entities/Enrollment';
import { authMiddleware, AuthRequest, roleMiddleware } from '../middleware/auth.middleware';
import { body, validationResult, param } from 'express-validator';

const router = Router();

// Get user's enrollments
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const enrollmentRepo = getRepository(Enrollment);
    const enrollments = await enrollmentRepo.find({
      where: { studentId: req.user!.userId },
      relations: ['course', 'payment']
    });

    res.json(enrollments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single enrollment
router.get('/:id', [param('id').isUUID()], async (req: AuthRequest, res: Response) => {
  try {
    const enrollmentRepo = getRepository(Enrollment);
    const enrollment = await enrollmentRepo.findOne({
      where: { enrollmentId: req.params.id },
      relations: ['course', 'payment', 'certificate']
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    res.json(enrollment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create enrollment (enrol in course)
router.post('/', authMiddleware, roleMiddleware(['student']), [
  body('courseId').isUUID(),
  body('paymentMethodId').notEmpty()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { courseId, paymentMethodId } = req.body;
    const enrollmentRepo = getRepository(Enrollment);
    const courseRepo = getRepository(Course);
    const paymentRepo = getRepository(Payment);

    // Check if already enrolled
    const existing = await enrollmentRepo.findOne({
      where: { studentId: req.user!.userId, courseId }
    });

    if (existing) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    // Get course
    const course = await courseRepo.findOne({ where: { courseId } });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Create payment
    const payment = new Payment();
    payment.paymentId = require('uuid').v4();
    payment.studentId = req.user!.userId;
    payment.amount = course.price;
    payment.method = paymentMethodId;
    payment.status = PaymentStatus.PENDING;
    payment.transactionRef = `TXN-${Date.now()}`;

    // In production, integrate Stripe here
    // For now, mark as completed
    payment.status = PaymentStatus.COMPLETED;
    payment.paidAt = new Date();

    await paymentRepo.save(payment);

    // Create enrollment
    const enrollment = new Enrollment();
    enrollment.enrollmentId = require('uuid').v4();
    enrollment.studentId = req.user!.userId;
    enrollment.courseId = courseId;
    enrollment.paymentId = payment.paymentId;
    enrollment.progressPercent = 0;
    enrollment.completed = false;

    await enrollmentRepo.save(enrollment);

    res.status(201).json({
      message: 'Enrolled successfully',
      enrollment,
      payment
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update progress
router.patch('/:id/progress', authMiddleware, [
  param('id').isUUID(),
  body('progressPercent').isInt({ min: 0, max: 100 })
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { progressPercent } = req.body;
    const enrollmentRepo = getRepository(Enrollment);
    const enrollment = await enrollmentRepo.findOne({ where: { enrollmentId: req.params.id } });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    // Verify ownership
    if (enrollment.studentId !== req.user!.userId) {
      return res.status(403).json({ error: 'You can only update your own enrollments' });
    }

    enrollment.progressPercent = progressPercent;
    if (progressPercent === 100) {
      enrollment.completed = true;
    }

    await enrollmentRepo.save(enrollment);

    res.json({ message: 'Progress updated', enrollment });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Complete course and generate certificate
router.post('/:id/complete', authMiddleware, [
  param('id').isUUID()
], async (req: AuthRequest, res: Response) => {
  try {
    const enrollmentRepo = getRepository(Enrollment);
    const enrollment = await enrollmentRepo.findOne({ 
      where: { enrollmentId: req.params.id },
      relations: ['course']
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    if (enrollment.studentId !== req.user!.userId) {
      return res.status(403).json({ error: 'You can only complete your own enrollments' });
    }

    if (enrollment.progressPercent < 100) {
      return res.status(400).json({ error: 'Course not fully completed' });
    }

    enrollment.completed = true;
    await enrollmentRepo.save(enrollment);

    // TODO: Generate certificate
    // const certificate = new Certificate();
    // certificate.enrollmentId = enrollment.enrollmentId;
    // certificate.fileUrl = 'https://...'; // Generate PDF
    // await certificateRepo.save(certificate);

    res.json({ 
      message: 'Course completed successfully',
      enrollment,
      certificateUrl: 'https://example.com/certificates/...'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
