import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, TableInheritance, ChildEntity } from 'typeorm';
import { Course } from './Course';
import { Enrollment } from './Enrollment';

@Entity('users')
@TableInheritance({ column: { type: 'varchar', name: 'role' } })
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  userId: string;

  @Column('varchar', { length: 255, name: 'name' })
  name: string;

  @Column('varchar', { length: 255, unique: true, name: 'email' })
  email: string;

  @Column('varchar', { length: 255, name: 'password_hash' })
  passwordHash: string;

  @Column('varchar', { length: 50, name: 'role' })
  role: string; // discriminator column

  @Column('varchar', { length: 20, default: 'active', name: 'status' })
  status: 'active' | 'suspended' | 'inactive';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Methods
  register(): void {
    // Registration logic
  }

  login(credentials: { email: string; password: string }): string {
    // Login logic, returns token
    return '';
  }

  updateProfile(data: Partial<User>): void {
    // Update profile logic
  }
}

@ChildEntity('student')
export class Student extends User {
  @OneToMany(() => Enrollment, enrollment => enrollment.student)
  enrolledCourses: Enrollment[];

  enrol(course: Course): Enrollment {
    // Enrolment logic
    return new Enrollment();
  }

  trackProgress(course: Course): number {
    // Progress tracking logic
    return 0;
  }
}

@ChildEntity('instructor')
export class Instructor extends User {
  @Column('text', { nullable: true, name: 'bio' })
  bio: string;

  @Column('varchar', { length: 255, nullable: true, name: 'payout_account' })
  payoutAccount: string;

  @OneToMany(() => Course, course => course.instructor)
  courses: Course[];

  createCourse(data: Partial<Course>): Course {
    // Course creation logic
    return new Course();
  }

  publishCourse(course: Course): void {
    // Publish logic
  }

  viewEarnings(): { totalEarnings: number; courseBreakdown: any[] } {
    // Earnings report logic
    return { totalEarnings: 0, courseBreakdown: [] };
  }
}

@ChildEntity('admin')
export class Admin extends User {
  @Column('simple-array', { default: '', name: 'permissions' })
  permissions: string[];

  approveCourse(course: Course): void {
    // Approval logic
  }

  suspendUser(user: User): void {
    // Suspension logic
  }

  viewPlatformAnalytics(): any {
    // Analytics logic
    return {};
  }
}

@ChildEntity('support_agent')
export class SupportAgent extends User {
}