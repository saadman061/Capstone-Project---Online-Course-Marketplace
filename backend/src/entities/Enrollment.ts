import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { Student } from './User';
import { Course } from './Course';

// PaymentStatus enum must come first (before Payment class)
export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

// Payment class must come before Enrollment (since Enrollment references it)
@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  paymentId: string;

  @Column('uuid')
  studentId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('varchar', { length: 50 })
  method: string; // 'credit_card', 'paypal', etc.

  @Column('enum', { enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column('varchar', { length: 255 })
  transactionRef: string;

  @Column('datetime', { nullable: true })
  paidAt: Date;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  processPayment(): boolean {
    // Payment processing logic
    return true;
  }

  refund(): boolean {
    // Refund logic
    this.status = PaymentStatus.REFUNDED;
    return true;
  }
}

// Now Enrollment can safely reference Payment
@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  enrollmentId: string;

  @Column('uuid')
  studentId: string;

  @Column('uuid')
  courseId: string;

  @Column('uuid')
  paymentId: string;

  @Column('int', { default: 0 })
  progressPercent: number;

  @Column('boolean', { default: false })
  completed: boolean;

  @CreateDateColumn()
  enrolledAt: Date;

  @ManyToOne(() => Student, student => student.enrolledCourses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @ManyToOne(() => Course, course => course.enrollments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @ManyToOne(() => Payment)
  @JoinColumn({ name: 'paymentId' })
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
  @PrimaryGeneratedColumn('uuid')
  categoryId: string;

  @Column('varchar', { length: 255, unique: true })
  name: string;

  @OneToMany(() => Course, course => course.category)
  courses: Course[];
}