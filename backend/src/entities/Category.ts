import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Course } from './Course';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid', { name: 'category_id' })
  categoryId: string;

  @Column('varchar', { length: 255, unique: true, name: 'name' })
  name: string;

  @OneToMany(() => Course, course => course.category)
  courses: Course[];
}