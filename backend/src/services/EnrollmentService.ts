import { getRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Enrollment } from '../entities/Enrollment';
import { Payment } from '../entities/Payment';
import { Course } from '../entities/Course';
import { Student } from '../entities/User';

export class EnrollmentService {
  async enrollStudent(studentId: string, courseId: string, paymentId: string) {
    const enrollmentRepository = getRepository(Enrollment);
    const courseRepository = getRepository(Course);
    const studentRepository = getRepository(Student);

    console.log('🎓 Processing enrollment:', { studentId, courseId, paymentId });

    // Verify student exists
    const student = await studentRepository.findOne({ where: { userId: studentId } });
    if (!student) {
      throw new Error('Student not found');
    }
    console.log('✅ Student found:', student.name);

    // Verify course exists
    const course = await courseRepository.findOne({ where: { courseId } });
    if (!course) {
      throw new Error('Course not found');
    }
    console.log('✅ Course found:', course.title);

    // Check if already enrolled
    const existingEnrollment = await enrollmentRepository.findOne({
      where: { studentId, courseId },
    });

    if (existingEnrollment) {
      throw new Error('Already enrolled in this course');
    }

    const enrollment = new Enrollment();
    enrollment.enrollmentId = uuidv4();
    enrollment.studentId = studentId;
    enrollment.courseId = courseId;
    enrollment.paymentId = paymentId;
    enrollment.progressPercent = 0;
    enrollment.completed = false;

    await enrollmentRepository.save(enrollment);
    console.log('✅ Enrollment saved to DB:', {
      enrollmentId: enrollment.enrollmentId,
      studentId: enrollment.studentId,
      courseId: enrollment.courseId,
      paymentId: enrollment.paymentId
    });
    return enrollment;
  }

  async getStudentEnrollments(studentId: string) {
    const enrollmentRepository = getRepository(Enrollment);

    return await enrollmentRepository.find({
      where: { studentId },
      relations: ['course', 'course.instructor'],
    });
  }

  async getCourseEnrollments(courseId: string) {
    const enrollmentRepository = getRepository(Enrollment);

    return await enrollmentRepository.find({
      where: { courseId },
      relations: ['student'],
    });
  }

  async updateProgress(enrollmentId: string, progressPercent: number) {
    const enrollmentRepository = getRepository(Enrollment);

    const enrollment = await enrollmentRepository.findOne({ where: { enrollmentId } });
    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    if (progressPercent < 0 || progressPercent > 100) {
      throw new Error('Progress must be between 0 and 100');
    }

    enrollment.progressPercent = progressPercent;
    if (progressPercent === 100) {
      enrollment.completed = true;
    }

    await enrollmentRepository.save(enrollment);
    return enrollment;
  }

  async getEnrollmentById(enrollmentId: string) {
    const enrollmentRepository = getRepository(Enrollment);

    return await enrollmentRepository.findOne({
      where: { enrollmentId },
      relations: ['student', 'course', 'payment'],
    });
  }
}

export default new EnrollmentService();