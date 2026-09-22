import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import EnrollmentService from '../services/EnrollmentService';
import PaymentService from '../services/PaymentService';
import CertificateService from '../services/CertificateService';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

// GET all enrollments for CURRENT student (me)
router.get('/student/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const enrollments = await EnrollmentService.getStudentEnrollments(req.user.userId);
    console.log('📚 Fetching enrollments for student:', req.user.userId, '| Found:', enrollments.length);
    res.json(enrollments);
  } catch (error: any) {
    console.error('❌ Error fetching enrollments:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET all enrollments for a student
router.get('/student/:studentId', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (req.user?.userId !== req.params.studentId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const enrollments = await EnrollmentService.getStudentEnrollments(req.params.studentId);
    res.json(enrollments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET all enrollments for a course (instructor only)
router.get('/course/:courseId', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'instructor' && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Only instructors can view course enrollments' });
    }

    const enrollments = await EnrollmentService.getCourseEnrollments(req.params.courseId);
    res.json(enrollments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ENROLL student in course (student only)
router.post(
  '/enroll',
  authMiddleware,
  [
    body('courseId').notEmpty().withMessage('Course ID is required'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (req.user?.role !== 'student') {
        return res.status(403).json({ error: 'Only students can enroll in courses' });
      }

      console.log('📝 Enrollment request:', {
        studentId: req.user.userId,
        courseId: req.body.courseId,
        price: req.body.coursePrice,
        method: req.body.paymentMethod || 'card'
      });

      // Create payment first
      const coursePrice = req.body.coursePrice || 0;
      const payment = await PaymentService.initiatePayment(
        req.user.userId,
        coursePrice,
        req.body.paymentMethod || 'card'
      );
      console.log('💳 Payment initiated:', payment.paymentId, '- Status:', payment.status);

      // Process payment (in real app, this would be Stripe/PayPal)
      const processedPayment = await PaymentService.processPayment(payment.paymentId);
      console.log('✅ Payment processed:', processedPayment.paymentId, '- Status:', processedPayment.status);

      // Create enrollment
      const enrollment = await EnrollmentService.enrollStudent(
        req.user.userId,
        req.body.courseId,
        processedPayment.paymentId
      );
      console.log('🎓 Enrollment created:', enrollment.enrollmentId);

      res.status(201).json({
        enrollment,
        payment: processedPayment,
      });
    } catch (error: any) {
      console.error('❌ Enrollment error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }
);

// UPDATE enrollment progress (student only)
router.put(
  '/:enrollmentId/progress',
  authMiddleware,
  [
    body('progressPercent').isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const enrollment = await EnrollmentService.getEnrollmentById(req.params.enrollmentId);
      
      if (!enrollment) {
        return res.status(404).json({ error: 'Enrollment not found' });
      }

      if (req.user?.userId !== enrollment.studentId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const updated = await EnrollmentService.updateProgress(
        req.params.enrollmentId,
        req.body.progressPercent
      );

      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// GET enrollment by ID
router.get('/:enrollmentId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const enrollment = await EnrollmentService.getEnrollmentById(req.params.enrollmentId);
    
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    if (req.user?.userId !== enrollment.studentId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(enrollment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// MARK enrollment as complete
router.post('/:enrollmentId/complete', authMiddleware, async (req: Request, res: Response) => {
  try {
    const enrollment = await EnrollmentService.getEnrollmentById(req.params.enrollmentId);
    
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    if (req.user?.userId !== enrollment.studentId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Mark as 100% complete
    const updated = await EnrollmentService.updateProgress(req.params.enrollmentId, 100);
    
    console.log('✅ Enrollment marked as complete:', req.params.enrollmentId);
    res.json({
      message: 'Course marked as completed',
      enrollment: updated,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// GENERATE certificate for completed course
router.post('/:enrollmentId/certificate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const enrollment = await EnrollmentService.getEnrollmentById(req.params.enrollmentId);
    
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    if (req.user?.userId !== enrollment.studentId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!enrollment.completed) {
      return res.status(400).json({ error: 'Course must be completed before generating certificate' });
    }

    const certificate = await CertificateService.generateCertificate(req.params.enrollmentId);
    
    console.log('📜 Certificate generated:', certificate.certificateId);
    res.status(201).json({
      message: 'Certificate generated successfully',
      certificate,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// GET certificate for enrollment
router.get('/:enrollmentId/certificate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const enrollment = await EnrollmentService.getEnrollmentById(req.params.enrollmentId);
    
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    if (req.user?.userId !== enrollment.studentId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const certificate = await CertificateService.getCertificate(req.params.enrollmentId);
    res.json(certificate);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

// GET all certificates for student
router.get('/student/:studentId/certificates', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (req.user?.userId !== req.params.studentId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const certificates = await CertificateService.getStudentCertificates(req.params.studentId);
    res.json(certificates);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;