import { getRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { LessonProgress } from '../entities/LessonProgress';
import { Enrollment } from '../entities/Enrollment';
import { Course } from '../entities/Course';
import EnrollmentService from './EnrollmentService';
import CertificateService from './CertificateService';

export class LessonProgressService {
  /**
   * Mark a lesson as complete
   * Also updates enrollment progress
   * Generates certificate if all lessons are done
   */
  async completeLessonForStudent(enrollmentId: string, lessonId: string, studentId: string) {
    const lessonProgressRepository = getRepository(LessonProgress);
    const enrollmentRepository = getRepository(Enrollment);

    console.log('📝 Marking lesson as complete:', { enrollmentId, lessonId, studentId });

    // Get enrollment
    const enrollment = await enrollmentRepository.findOne({
      where: { enrollmentId },
      relations: ['course']
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    // Check if already completed
    const existingProgress = await lessonProgressRepository.findOne({
      where: { enrollmentId, lessonId }
    });

    if (existingProgress && existingProgress.completed) {
      console.log('⚠️  Lesson already completed');
      return existingProgress;
    }

    // Create or update lesson progress
    let lessonProgress: LessonProgress;

    if (existingProgress) {
      lessonProgress = existingProgress;
      lessonProgress.completed = true;
      lessonProgress.completedAt = new Date();
    } else {
      lessonProgress = new LessonProgress();
      lessonProgress.lessonProgressId = uuidv4();
      lessonProgress.enrollmentId = enrollmentId;
      lessonProgress.lessonId = lessonId;
      lessonProgress.studentId = studentId;
      lessonProgress.completed = true;
      lessonProgress.completedAt = new Date();
    }

    await lessonProgressRepository.save(lessonProgress);
    console.log('✅ Lesson progress saved:', lessonProgress.lessonProgressId);

    // Calculate overall progress
    const totalLessons = await this.getTotalLessonsForCourse(enrollment.course.courseId);
    const completedLessons = await this.getCompletedLessonsCount(enrollmentId);

    const progressPercent = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

    console.log(`📊 Progress: ${completedLessons}/${totalLessons} lessons (${progressPercent}%)`);

    // Update enrollment progress
    const updatedEnrollment = await EnrollmentService.updateProgress(enrollmentId, progressPercent);
    console.log('🎯 Enrollment progress updated:', progressPercent + '%');

    // If all lessons done, automatically generate certificate
    if (progressPercent === 100 && !updatedEnrollment.completed) {
      console.log('🎓 All lessons completed! Generating certificate...');
      
      // Mark as completed
      updatedEnrollment.completed = true;
      await enrollmentRepository.save(updatedEnrollment);
      
      // Generate certificate
      try {
        const certificate = await CertificateService.generateCertificate(enrollmentId);
        console.log('📜 Certificate auto-generated:', certificate.certificateId);
      } catch (certError: any) {
        console.error('⚠️  Certificate generation failed:', certError.message);
        // Continue anyway - don't fail the lesson completion
      }
    }

    return lessonProgress;
  }

  /**
   * Get total lessons in a course
   */
  async getTotalLessonsForCourse(courseId: string): Promise<number> {
    const courseRepository = getRepository(Course);
    
    const course = await courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.modules', 'modules')
      .leftJoinAndSelect('modules.lessons', 'lessons')
      .where('course.courseId = :courseId', { courseId })
      .getOne();

    if (!course) {
      return 0;
    }

    let totalLessons = 0;
    if (course.modules) {
      course.modules.forEach(module => {
        if (module.lessons) {
          totalLessons += module.lessons.length;
        }
      });
    }

    return totalLessons;
  }

  /**
   * Get count of completed lessons for an enrollment
   */
  async getCompletedLessonsCount(enrollmentId: string): Promise<number> {
    const lessonProgressRepository = getRepository(LessonProgress);

    const count = await lessonProgressRepository.count({
      where: {
        enrollmentId,
        completed: true
      }
    });

    return count;
  }

  /**
   * Get lesson progress for an enrollment
   */
  async getLessonProgress(enrollmentId: string) {
    const lessonProgressRepository = getRepository(LessonProgress);

    const progressList = await lessonProgressRepository.find({
      where: { enrollmentId },
      relations: ['lesson']
    });

    return progressList;
  }

  /**
   * Check if a lesson is completed by student
   */
  async isLessonCompleted(enrollmentId: string, lessonId: string): Promise<boolean> {
    const lessonProgressRepository = getRepository(LessonProgress);

    const progress = await lessonProgressRepository.findOne({
      where: { enrollmentId, lessonId, completed: true }
    });

    return !!progress;
  }

  /**
   * Get all lesson progress for a student across all enrollments
   */
  async getStudentLessonProgress(studentId: string) {
    const lessonProgressRepository = getRepository(LessonProgress);

    return await lessonProgressRepository
      .createQueryBuilder('lp')
      .leftJoinAndSelect('lp.lesson', 'lesson')
      .leftJoinAndSelect('lp.enrollment', 'enrollment')
      .leftJoinAndSelect('enrollment.course', 'course')
      .where('lp.studentId = :studentId', { studentId })
      .getMany();
  }

  /**
   * Reset lesson progress (admin only)
   */
  async resetLessonProgress(enrollmentId: string) {
    const lessonProgressRepository = getRepository(LessonProgress);

    await lessonProgressRepository.delete({ enrollmentId });
    console.log('🔄 Lesson progress reset for enrollment:', enrollmentId);

    // Reset enrollment progress to 0
    const updatedEnrollment = await EnrollmentService.updateProgress(enrollmentId, 0);
    return updatedEnrollment;
  }
}

export default new LessonProgressService();
