import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { Student } from './User';
import { Course } from './Course';
import { Payment, PaymentStatus } from './Payment';

// Now Enrollment can safely reference Payment from separate file
@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn('uuid', { name: 'enrollment_id' })
  enrollmentId: string;

  @Column('uuid', { name: 'student_id' })
  studentId: string;

  @Column('uuid', { name: 'course_id' })
  courseId: string;

  @Column('uuid', { name: 'payment_id' })
  paymentId: string;

  @Column('int', { default: 0, name: 'progress_percent' })
  progressPercent: number;

  @Column('boolean', { default: false, name: 'completed' })
  completed: boolean;

  @CreateDateColumn({ name: 'enrolled_at' })
  enrolledAt: Date;

  @ManyToOne(() => Student, student => student.enrolledCourses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Course, course => course.enrollments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => Payment)
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  updateProgress(percentage: number): void {
    this.progressPercent = percentage;
    if (percentage === 100) {
      this.completed = true;
    }
  }
}

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid', { name: 'category_id' })
  categoryId: string;

  @Column('varchar', { length: 255, unique: true, name: 'name' })
  name: string;

  @OneToMany(() => Course, course => course.category)
  courses: Course[];
}