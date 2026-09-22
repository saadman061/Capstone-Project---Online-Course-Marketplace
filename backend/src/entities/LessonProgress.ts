import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from './User';
import { Lesson } from './Course';
import { Enrollment } from './Enrollment';

@Entity('lesson_progress')
export class LessonProgress {
  @PrimaryGeneratedColumn('uuid', { name: 'lesson_progress_id' })
  lessonProgressId: string;

  @Column('char', { length: 36, name: 'enrollment_id' })
  enrollmentId: string;

  @Column('char', { length: 36, name: 'lesson_id' })
  lessonId: string;

  @Column('char', { length: 36, name: 'student_id' })
  studentId: string;

  @Column('boolean', { name: 'completed', default: false })
  completed: boolean;

  @CreateDateColumn({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @ManyToOne(() => Enrollment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: Enrollment;

  @ManyToOne(() => Lesson, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;
}
