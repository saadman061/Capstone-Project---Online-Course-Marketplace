import { getRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Course, CourseStatus, Module, Lesson } from '../entities/Course';
import { Instructor } from '../entities/User';

export class CourseService {
  async createCourse(instructorId: string, data: {
    title: string;
    description: string;
    price: number;
    categoryId: string;
  }) {
    const courseRepository = getRepository(Course);
    const instructorRepository = getRepository(Instructor);

    // Verify instructor exists
    const instructor = await instructorRepository.findOne({ where: { userId: instructorId } });
    if (!instructor) {
      throw new Error('Instructor not found');
    }

    const course = new Course();
    course.courseId = uuidv4();
    course.title = data.title;
    course.description = data.description;
    course.price = parseFloat(data.price.toString());
    course.categoryId = data.categoryId;
    course.instructorId = instructorId;
    course.status = CourseStatus.DRAFT;
    course.avgRating = 0;

    await courseRepository.save(course);
    return course;
  }

  async getCourses(filters?: { status?: string; categoryId?: string; instructorId?: string }) {
    const courseRepository = getRepository(Course);
    let query = courseRepository.createQueryBuilder('course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('course.category', 'category');

    if (filters?.status) {
      query = query.where('course.status = :status', { status: filters.status });
    }

    if (filters?.categoryId) {
      query = query.andWhere('course.categoryId = :categoryId', { categoryId: filters.categoryId });
    }

    if (filters?.instructorId) {
      query = query.andWhere('course.instructorId = :instructorId', { instructorId: filters.instructorId });
    }

    const courses = await query.getMany();
    
    // Ensure all prices and ratings are numbers
    return courses.map(course => ({
      ...course,
      price: parseFloat(course.price.toString()),
      avgRating: parseFloat(course.avgRating.toString())
    }));
  }

  async getCourseById(courseId: string) {
    const courseRepository = getRepository(Course);
    
    // Use query builder to properly join relations
    const course = await courseRepository.createQueryBuilder('course')
      .where('course.courseId = :courseId', { courseId })
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.modules', 'modules')
      .leftJoinAndSelect('modules.lessons', 'lessons')
      .getOne();

    if (!course) {
      throw new Error('Course not found');
    }

    // Ensure price and rating are numbers
    course.price = parseFloat(course.price.toString());
    course.avgRating = parseFloat(course.avgRating.toString());

    return course;
  }

  async updateCourse(courseId: string, instructorId: string, data: Partial<Course>) {
    const courseRepository = getRepository(Course);

    // Verify course exists and belongs to instructor
    const course = await courseRepository.findOne({ where: { courseId } });
    if (!course) {
      throw new Error('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new Error('Unauthorized: You can only edit your own courses');
    }

    if (course.status !== CourseStatus.DRAFT) {
      throw new Error('Can only edit draft courses');
    }

    Object.assign(course, data);
    await courseRepository.save(course);
    return course;
  }

  async publishCourse(courseId: string, instructorId: string) {
    const courseRepository = getRepository(Course);
    const course = await courseRepository.findOne({ where: { courseId } });

    if (!course) {
      throw new Error('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new Error('Unauthorized');
    }

    if (course.status !== CourseStatus.DRAFT) {
      throw new Error('Only draft courses can be published');
    }

    course.status = CourseStatus.UNDER_REVIEW;
    await courseRepository.save(course);
    return course;
  }

  async approveCourse(courseId: string) {
    const courseRepository = getRepository(Course);
    const course = await courseRepository.findOne({ where: { courseId } });

    if (!course) {
      throw new Error('Course not found');
    }

    course.status = CourseStatus.PUBLISHED;
    await courseRepository.save(course);
    return course;
  }

  async rejectCourse(courseId: string, reason: string) {
    const courseRepository = getRepository(Course);
    const course = await courseRepository.findOne({ where: { courseId } });

    if (!course) {
      throw new Error('Course not found');
    }

    course.status = CourseStatus.REJECTED;
    await courseRepository.save(course);
    return course;
  }

  async deleteCourse(courseId: string, instructorId: string) {
    const courseRepository = getRepository(Course);
    const course = await courseRepository.findOne({ where: { courseId } });

    if (!course) {
      throw new Error('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new Error('Unauthorized');
    }

    await courseRepository.remove(course);
  }

  async addModule(courseId: string, instructorId: string, data: { title: string; sortOrder: number }) {
    const courseRepository = getRepository(Course);
    const moduleRepository = getRepository(Module);

    const course = await courseRepository.findOne({ where: { courseId } });
    if (!course) {
      throw new Error('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new Error('Unauthorized');
    }

    const module = new Module();
    module.moduleId = uuidv4();
    module.courseId = courseId;
    module.title = data.title;
    module.sortOrder = data.sortOrder;

    await moduleRepository.save(module);
    return module;
  }

  async addLesson(moduleId: string, instructorId: string, data: {
    title: string;
    videoUrl: string;
    durationSec: number;
  }) {
    const moduleRepository = getRepository(Module);
    const lessonRepository = getRepository(Lesson);

    const module = await moduleRepository.createQueryBuilder('module')
      .where('module.moduleId = :moduleId', { moduleId })
      .leftJoinAndSelect('module.course', 'course')
      .getOne();

    if (!module) {
      throw new Error('Module not found');
    }

    if (module.course.instructorId !== instructorId) {
      throw new Error('Unauthorized');
    }

    const lesson = new Lesson();
    lesson.lessonId = uuidv4();
    lesson.moduleId = moduleId;
    lesson.title = data.title;
    lesson.videoUrl = data.videoUrl;
    lesson.durationSec = data.durationSec;

    await lessonRepository.save(lesson);
    return lesson;
  }
}

export default new CourseService();