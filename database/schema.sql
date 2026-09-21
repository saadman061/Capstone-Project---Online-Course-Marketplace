-- Online Course Marketplace Database Schema
-- MySQL 8.0+

DROP DATABASE IF EXISTS course_marketplace;
CREATE DATABASE course_marketplace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE course_marketplace;

-- ============================================================
-- ROLES Table (Lookup)
-- ============================================================
CREATE TABLE roles (
  role_id INT PRIMARY KEY AUTO_INCREMENT,
  role_name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO roles (role_name, description) VALUES
('student', 'Course learner who enrolls in courses'),
('instructor', 'Course creator and educator'),
('admin', 'Platform administrator and moderator'),
('support_agent', 'Customer support staff'),
('guest', 'Unauthenticated visitor');

-- ============================================================
-- USERS Table (Single-Table Inheritance with discriminator column)
-- ============================================================
CREATE TABLE users (
  user_id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  bio TEXT,
  payout_account VARCHAR(255),
  permissions JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_status (status),
  CONSTRAINT fk_user_role FOREIGN KEY (role) REFERENCES roles(role_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CATEGORIES Table
-- ============================================================
CREATE TABLE categories (
  category_id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- COURSES Table
-- ============================================================
CREATE TABLE courses (
  course_id CHAR(36) PRIMARY KEY,
  instructor_id CHAR(36) NOT NULL,
  category_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description LONGTEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'under_review', 'published', 'rejected', 'suspended', 'archived')),
  avg_rating FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_instructor (instructor_id),
  INDEX idx_category (category_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at),
  CONSTRAINT fk_course_instructor FOREIGN KEY (instructor_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_course_category FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- MODULES Table
-- ============================================================
CREATE TABLE modules (
  module_id CHAR(36) PRIMARY KEY,
  course_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL,
  INDEX idx_course (course_id),
  CONSTRAINT fk_module_course FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- LESSONS Table
-- ============================================================
CREATE TABLE lessons (
  lesson_id CHAR(36) PRIMARY KEY,
  module_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  video_url VARCHAR(2083) NOT NULL,
  duration_sec INT DEFAULT 0,
  INDEX idx_module (module_id),
  CONSTRAINT fk_lesson_module FOREIGN KEY (module_id) REFERENCES modules(module_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- ENROLLMENTS Table (Join table + metadata)
-- ============================================================
CREATE TABLE enrollments (
  enrollment_id CHAR(36) PRIMARY KEY,
  student_id CHAR(36) NOT NULL,
  course_id CHAR(36) NOT NULL,
  payment_id CHAR(36) NOT NULL,
  progress_percent INT DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  completed BOOLEAN DEFAULT FALSE,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_enrollment (student_id, course_id),
  INDEX idx_student (student_id),
  INDEX idx_course (course_id),
  INDEX idx_completed (completed),
  CONSTRAINT fk_enrollment_student FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_enrollment_course FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PAYMENTS Table
-- ============================================================
CREATE TABLE payments (
  payment_id CHAR(36) PRIMARY KEY,
  student_id CHAR(36) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  method VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_ref VARCHAR(255) UNIQUE,
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_student (student_id),
  INDEX idx_status (status),
  CONSTRAINT fk_payment_student FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key from enrollments to payments (after payments table exists)
ALTER TABLE enrollments
ADD CONSTRAINT fk_enrollment_payment FOREIGN KEY (payment_id) REFERENCES payments(payment_id) ON DELETE RESTRICT;

-- ============================================================
-- REVIEWS Table
-- ============================================================
CREATE TABLE reviews (
  review_id CHAR(36) PRIMARY KEY,
  student_id CHAR(36) NOT NULL,
  course_id CHAR(36) NOT NULL,
  rating INT DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  comment LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_student (student_id),
  INDEX idx_course (course_id),
  INDEX idx_created (created_at),
  CONSTRAINT fk_review_student FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_review_course FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CERTIFICATES Table (Optional; created on 100% completion)
-- ============================================================
CREATE TABLE certificates (
  certificate_id CHAR(36) PRIMARY KEY,
  enrollment_id CHAR(36) UNIQUE NOT NULL,
  file_url VARCHAR(2083) NOT NULL,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_enrollment (enrollment_id),
  CONSTRAINT fk_cert_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(enrollment_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TICKETS Table (Support)
-- ============================================================
CREATE TABLE tickets (
  ticket_id CHAR(36) PRIMARY KEY,
  raised_by_user_id CHAR(36) NOT NULL,
  assigned_agent_id CHAR(36),
  subject VARCHAR(255) NOT NULL,
  description LONGTEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_raised_by (raised_by_user_id),
  INDEX idx_assigned (assigned_agent_id),
  INDEX idx_status (status),
  CONSTRAINT fk_ticket_raised_by FOREIGN KEY (raised_by_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_ticket_assigned FOREIGN KEY (assigned_agent_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- NOTIFICATIONS Table
-- ============================================================
CREATE TABLE notifications (
  notification_id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  message LONGTEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_read (is_read),
  CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- WISHLIST_ITEMS Table (Saved courses)
-- ============================================================
CREATE TABLE wishlist_items (
  wishlist_item_id CHAR(36) PRIMARY KEY,
  student_id CHAR(36) NOT NULL,
  course_id CHAR(36) NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_wishlist (student_id, course_id),
  INDEX idx_student (student_id),
  CONSTRAINT fk_wishlist_student FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_course FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Indices for Full-Text Search
-- ============================================================
ALTER TABLE courses ADD FULLTEXT INDEX ft_title_desc (title, description);

-- ============================================================
-- Views for Reporting
-- ============================================================
CREATE VIEW course_enrollment_stats AS
SELECT 
  c.course_id,
  c.title,
  COUNT(DISTINCT e.student_id) AS total_enrollments,
  COUNT(DISTINCT CASE WHEN e.completed = 1 THEN e.student_id END) AS completed_count,
  AVG(e.progress_percent) AS avg_progress,
  c.avg_rating,
  c.created_at
FROM courses c
LEFT JOIN enrollments e ON c.course_id = e.course_id
GROUP BY c.course_id, c.title, c.avg_rating, c.created_at;

CREATE VIEW instructor_earnings AS
SELECT 
  u.user_id,
  u.name,
  COUNT(DISTINCT c.course_id) AS total_courses,
  COUNT(DISTINCT e.enrollment_id) AS total_enrollments,
  SUM(p.amount) AS total_revenue
FROM users u
LEFT JOIN courses c ON u.user_id = c.instructor_id
LEFT JOIN enrollments e ON c.course_id = e.course_id
LEFT JOIN payments p ON e.payment_id = p.payment_id AND p.status = 'completed'
WHERE u.role = 'instructor'
GROUP BY u.user_id, u.name;

-- ============================================================
-- Sample Data for Testing
-- ============================================================
INSERT INTO categories (category_id, name) VALUES
('cat-web-dev', 'Web Development'),
('cat-mobile', 'Mobile Development'),
('cat-data', 'Data Science'),
('cat-ai', 'Artificial Intelligence'),
('cat-cloud', 'Cloud Computing');

-- Create a test instructor
INSERT INTO users (user_id, name, email, password_hash, role, bio) VALUES
('instr-1', 'John Instructor', 'john@example.com', '$2a$10$...', 'instructor', 'Expert in web development');

-- Create a test course
INSERT INTO courses (course_id, instructor_id, category_id, title, description, price, status, avg_rating) VALUES
('course-1', 'instr-1', 'cat-web-dev', 'React for Beginners', 'Learn React.js from scratch', 49.99, 'published', 4.8);

-- Create a module for the course
INSERT INTO modules (module_id, course_id, title, sort_order) VALUES
('mod-1', 'course-1', 'Introduction to React', 1);

-- Create lessons
INSERT INTO lessons (lesson_id, module_id, title, video_url, duration_sec) VALUES
('les-1', 'mod-1', 'What is React?', 'https://example.com/video1', 600);