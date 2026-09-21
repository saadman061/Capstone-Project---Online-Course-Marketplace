import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Instructor } from './User';
import { Category } from './Category';
import { Enrollment } from './Enrollment';

export enum CourseStatus {
  DRAFT = 'draft',
  UNDER_REVIEW = 'under_review',
  PUBLISHED = 'published',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
  ARCHIVED = 'archived'
}

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid', { name: 'course_id' })
  courseId: string;

  @Column('uuid', { name: 'instructor_id' })
  instructorId: string;

  @Column('uuid', { name: 'category_id' })
  categoryId: string;

  @Column('varchar', { length: 255, name: 'title' })
  title: string;

  @Column('text', { name: 'description' })
  description: string;

  @Column('decimal', { precision: 10, scale: 2, name: 'price' })
  price: number;

  @Column('enum', { enum: CourseStatus, default: CourseStatus.DRAFT, name: 'status' })
  status: CourseStatus;

  @Column('float', { default: 0, name: 'avg_rating' })
  avgRating: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Instructor, instructor => instructor.courses)
  @JoinColumn({ name: 'instructor_id' })
  instructor: Instructor;

  @ManyToOne(() => Category, category => category.courses)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => Module, module => module.course, { cascade: true })
  modules: Module[];

  @OneToMany(() => Enrollment, enrollment => enrollment.course)
  enrollments: Enrollment[];

  addModule(module: Partial<Module>): Module {
    return new Module();
  }

  calculateRating(): number {
    return this.avgRating;
  }

  getSyllabus(): Module[] {
    return this.modules || [];
  }
}

@Entity('modules')
export class Module {
  @PrimaryGeneratedColumn('uuid', { name: 'module_id' })
  moduleId: string;

  @Column('uuid', { name: 'course_id' })
  courseId: string;

  @Column('varchar', { length: 255, name: 'title' })
  title: string;

  @Column('int', { name: 'sort_order' })
  sortOrder: number;

  @ManyToOne(() => Course, course => course.modules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @OneToMany(() => Lesson, lesson => lesson.module, { cascade: true })
  lessons: Lesson[];
}

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid', { name: 'lesson_id' })
  lessonId: string;

  @Column('uuid', { name: 'module_id' })
  moduleId: string;

  @Column('varchar', { length: 255, name: 'title' })
  title: string;

  @Column('varchar', { length: 2083, name: 'video_url' })
  videoUrl: string;

  @Column('int', { name: 'duration_sec' })
  durationSec: number;

  @ManyToOne(() => Module, module => module.lessons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module: Module;
}