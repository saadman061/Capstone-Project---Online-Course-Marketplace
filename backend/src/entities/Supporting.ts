import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Student } from './User';
import { Course } from './Course';
import { Enrollment } from './Enrollment';
import { SupportAgent, User } from './User';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid', { name: 'review_id' })
  reviewId: string;

  @Column('uuid', { name: 'student_id' })
  studentId: string;

  @Column('uuid', { name: 'course_id' })
  courseId: string;

  @Column('int', { default: 5, name: 'rating' })
  rating: number; // 1-5

  @Column('text', { nullable: true, name: 'comment' })
  comment: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;
}

@Entity('certificates')
export class Certificate {
  @PrimaryGeneratedColumn('uuid', { name: 'certificate_id' })
  certificateId: string;

  @Column('uuid', { name: 'enrollment_id' })
  enrollmentId: string;

  @Column('varchar', { length: 2083, name: 'file_url' })
  fileUrl: string;

  @CreateDateColumn({ name: 'issued_at' })
  issuedAt: Date;

  @OneToOne(() => Enrollment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: Enrollment;
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid', { name: 'notification_id' })
  notificationId: string;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column('text', { name: 'message' })
  message: string;

  @Column('boolean', { default: false, name: 'is_read' })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid', { name: 'ticket_id' })
  ticketId: string;

  @Column('uuid', { name: 'raised_by_user_id' })
  raisedByUserId: string;

  @Column('uuid', { nullable: true, name: 'assigned_agent_id' })
  assignedAgentId: string;

  @Column('varchar', { length: 255, name: 'subject' })
  subject: string;

  @Column('text', { name: 'description' })
  description: string;

  @Column('enum', { enum: TicketStatus, default: TicketStatus.OPEN, name: 'status' })
  status: TicketStatus;

  @Column('enum', { enum: TicketPriority, default: TicketPriority.MEDIUM, name: 'priority' })
  priority: TicketPriority;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'raised_by_user_id' })
  raisedByUser: User;

  @ManyToOne(() => SupportAgent, { nullable: true })
  @JoinColumn({ name: 'assigned_agent_id' })
  assignedAgent: SupportAgent;
}

@Entity('wishlist_items')
export class WishlistItem {
  @PrimaryGeneratedColumn('uuid', { name: 'wishlist_item_id' })
  wishlistItemId: string;

  @Column('uuid', { name: 'student_id' })
  studentId: string;

  @Column('uuid', { name: 'course_id' })
  courseId: string;

  @CreateDateColumn({ name: 'added_at' })
  addedAt: Date;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;
}