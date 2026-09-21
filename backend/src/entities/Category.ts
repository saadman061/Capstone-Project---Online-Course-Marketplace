import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Course } from './Course';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  categoryId: string;

  @Column('varchar', { length: 255, unique: true })
  name: string;

  @OneToMany(() => Course, course => course.category)
  courses: Course[];
}
