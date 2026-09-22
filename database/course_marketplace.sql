-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 22, 2026 at 12:30 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 7.4.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `course_marketplace`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `category_id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`category_id`, `name`) VALUES
('839c1d2c-b674-11f1-9dfe-bc03580ec9a9', 'Cloud Computing'),
('839c1c55-b674-11f1-9dfe-bc03580ec9a9', 'Data Science'),
('839c18d8-b674-11f1-9dfe-bc03580ec9a9', 'Mobile Development'),
('839c1b52-b674-11f1-9dfe-bc03580ec9a9', 'Programming'),
('839bf569-b674-11f1-9dfe-bc03580ec9a9', 'Web Development');

-- --------------------------------------------------------

--
-- Table structure for table `certificates`
--

CREATE TABLE `certificates` (
  `certificate_id` char(36) NOT NULL,
  `enrollment_id` char(36) NOT NULL,
  `file_url` varchar(2083) NOT NULL,
  `issued_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `certificates`
--

INSERT INTO `certificates` (`certificate_id`, `enrollment_id`, `file_url`, `issued_at`) VALUES
('8ad9bcef-232c-4832-bbf9-48847bf00a51', '63e59c46-9d38-4437-8465-cc85c807bf5f', 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTAwMCIgaGVpZ2h0PSI3MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDEwMDAgNzAwIj4KICA8IS0tIEJhY2tncm91bmQgLS0+CiAgPHJlY3Qgd2lkdGg9IjEwMDAiIGhlaWdodD0iNzAwIiBmaWxsPSIjZjhmNGU2Ii8+CiAgCiAgPCEtLSBCb3JkZXIgLS0+CiAgPHJlY3QgeD0iNDAiIHk9IjQwIiB3aWR0aD0iOTIwIiBoZWlnaHQ9IjYyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOGI2ZjQ3IiBzdHJva2Utd2lkdGg9IjMiLz4KICA8cmVjdCB4PSI1MCIgeT0iNTAiIHdpZHRoPSI5MDAiIGhlaWdodD0iNjAwIiBmaWxsPSJub25lIiBzdHJva2U9IiNjOWE5NjEiIHN0cm9rZS13aWR0aD0iMSIvPgogIAogIDwhLS0gRGVjb3JhdGl2ZSBjb3JuZXJzIC0tPgogIDxnIHN0cm9rZT0iIzhiNmY0NyIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIj4KICAgIDxwYXRoIGQ9Ik0gNzAgNzAgTCAxMjAgNzAgTCAxMjAgMTIwIi8+CiAgICA8cGF0aCBkPSJNIDkzMCA3MCBMIDg4MCA3MCBMIDg4MCAxMjAiLz4KICAgIDxwYXRoIGQ9Ik0gNzAgNjMwIEwgNzAgNTgwIEwgMTIwIDU4MCIvPgogICAgPHBhdGggZD0iTSA5MzAgNjMwIEwgOTMwIDU4MCBMIDg4MCA1ODAiLz4KICA8L2c+CiAgCiAgPCEtLSBUaXRsZSAtLT4KICA8dGV4dCB4PSI1MDAiIHk9IjEyMCIgZm9udC1zaXplPSI0OCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM4YjZmNDciIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiI+CiAgICBDZXJ0aWZpY2F0ZSBvZiBDb21wbGV0aW9uCiAgPC90ZXh0PgogIAogIDwhLS0gRGVjb3JhdGl2ZSBsaW5lIC0tPgogIDxsaW5lIHgxPSIzMDAiIHkxPSIxNTAiIHgyPSI3MDAiIHkyPSIxNTAiIHN0cm9rZT0iI2M5YTk2MSIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgCiAgPCEtLSAiVGhpcyBpcyB0byBjZXJ0aWZ5IHRoYXQiIHRleHQgLS0+CiAgPHRleHQgeD0iNTAwIiB5PSIyMjAiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMzMzMiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiI+CiAgICBUaGlzIGlzIHRvIGNlcnRpZnkgdGhhdAogIDwvdGV4dD4KICAKICA8IS0tIFN0dWRlbnQgbmFtZSAtLT4KICA8dGV4dCB4PSI1MDAiIHk9IjI4MCIgZm9udC1zaXplPSIzMiIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMwMDAiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgbGV0dGVyLXNwYWNpbmc9IjIiPgogICAgc2FhZG1hbiBLaG9uZGFrZXIKICA8L3RleHQ+CiAgPGxpbmUgeDE9IjI1MCIgeTE9IjI5NSIgeDI9Ijc1MCIgeTI9IjI5NSIgc3Ryb2tlPSIjOGI2ZjQ3IiBzdHJva2Utd2lkdGg9IjIiLz4KICAKICA8IS0tIEFjaGlldmVtZW50IHRleHQgLS0+CiAgPHRleHQgeD0iNTAwIiB5PSIzNjAiIGZvbnQtc2l6ZT0iMTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMzMzMiI', '2026-09-22 12:13:11');

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `course_id` char(36) NOT NULL,
  `instructor_id` char(36) NOT NULL,
  `category_id` char(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` longtext NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `status` varchar(20) DEFAULT 'draft' CHECK (`status` in ('draft','under_review','published','rejected','suspended','archived')),
  `avg_rating` float DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`course_id`, `instructor_id`, `category_id`, `title`, `description`, `price`, `status`, `avg_rating`, `created_at`) VALUES
('1f1d28dd-c48f-4947-bda4-01ae1b7b9cfa', 'instr-1', '839bf569-b674-11f1-9dfe-bc03580ec9a9', 'New Web Development Course 101', 'Web Design Course', 50.00, 'published', 0, '2026-09-22 11:02:57'),
('course-1', 'instr-1', '839c1b52-b674-11f1-9dfe-bc03580ec9a9', 'React for Beginners', 'Learn React.js from scratch', 49.99, 'published', 4.8, '2026-09-21 15:33:29');

-- --------------------------------------------------------

--
-- Stand-in structure for view `course_enrollment_stats`
-- (See below for the actual view)
--
CREATE TABLE `course_enrollment_stats` (
`course_id` char(36)
,`title` varchar(255)
,`total_enrollments` bigint(21)
,`completed_count` bigint(21)
,`avg_progress` decimal(14,4)
,`avg_rating` float
,`created_at` timestamp
);

-- --------------------------------------------------------

--
-- Table structure for table `enrollments`
--

CREATE TABLE `enrollments` (
  `enrollment_id` char(36) NOT NULL,
  `student_id` char(36) NOT NULL,
  `course_id` char(36) NOT NULL,
  `payment_id` char(36) NOT NULL,
  `progress_percent` int(11) DEFAULT 0 CHECK (`progress_percent` between 0 and 100),
  `completed` tinyint(1) DEFAULT 0,
  `enrolled_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `enrollments`
--

INSERT INTO `enrollments` (`enrollment_id`, `student_id`, `course_id`, `payment_id`, `progress_percent`, `completed`, `enrolled_at`) VALUES
('3d6dfb96-29d4-470d-9401-09f3bb8ad8e0', '5502cac4-346b-4677-8943-4d5393958226', 'course-1', 'add1e5f7-fed4-4c5c-ac01-abfa352d22b6', 0, 0, '2026-09-22 11:53:38'),
('63e59c46-9d38-4437-8465-cc85c807bf5f', '5502cac4-346b-4677-8943-4d5393958226', '1f1d28dd-c48f-4947-bda4-01ae1b7b9cfa', '7fc175f2-bd5c-4730-a016-59da0ceaaab9', 100, 1, '2026-09-22 11:52:34');

-- --------------------------------------------------------

--
-- Stand-in structure for view `instructor_earnings`
-- (See below for the actual view)
--
CREATE TABLE `instructor_earnings` (
`user_id` char(36)
,`name` varchar(255)
,`total_courses` bigint(21)
,`total_enrollments` bigint(21)
,`total_revenue` decimal(32,2)
);

-- --------------------------------------------------------

--
-- Table structure for table `lessons`
--

CREATE TABLE `lessons` (
  `lesson_id` char(36) NOT NULL,
  `module_id` char(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `video_url` varchar(2083) NOT NULL,
  `duration_sec` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lessons`
--

INSERT INTO `lessons` (`lesson_id`, `module_id`, `title`, `video_url`, `duration_sec`) VALUES
('ace4ffbe-b67e-11f1-9dfe-bc03580ec9a9', '926a1dcd-b67e-11f1-9dfe-bc03580ec9a9', 'Lesson 1.1: Introduction', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 300),
('ace557e7-b67e-11f1-9dfe-bc03580ec9a9', '926a1dcd-b67e-11f1-9dfe-bc03580ec9a9', 'Lesson 1.2: Setup', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 600),
('ace55896-b67e-11f1-9dfe-bc03580ec9a9', '926b848c-b67e-11f1-9dfe-bc03580ec9a9', 'Lesson 2.1: Advanced Concepts', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 900),
('ace558ca-b67e-11f1-9dfe-bc03580ec9a9', '926b848c-b67e-11f1-9dfe-bc03580ec9a9', 'Lesson 2.2: Best Practices', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 450),
('les-1', 'mod-1', 'What is React?', 'https://example.com/video1', 600);

-- --------------------------------------------------------

--
-- Table structure for table `lesson_progress`
--

CREATE TABLE `lesson_progress` (
  `lesson_progress_id` char(36) NOT NULL,
  `enrollment_id` char(36) NOT NULL,
  `lesson_id` char(36) NOT NULL,
  `student_id` char(36) NOT NULL,
  `completed` tinyint(1) DEFAULT 0,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lesson_progress`
--

INSERT INTO `lesson_progress` (`lesson_progress_id`, `enrollment_id`, `lesson_id`, `student_id`, `completed`, `completed_at`, `created_at`) VALUES
('0044d461-7d49-4117-a61c-7b7e3e8e6cd9', '63e59c46-9d38-4437-8465-cc85c807bf5f', 'ace55896-b67e-11f1-9dfe-bc03580ec9a9', '5502cac4-346b-4677-8943-4d5393958226', 1, '2026-09-22 12:12:58', '2026-09-22 12:12:58'),
('0398d214-8c97-4800-bd89-6b0febf3e798', '63e59c46-9d38-4437-8465-cc85c807bf5f', 'ace557e7-b67e-11f1-9dfe-bc03580ec9a9', '5502cac4-346b-4677-8943-4d5393958226', 1, '2026-09-22 12:12:50', '2026-09-22 12:12:50'),
('6369f848-16b0-428f-a862-beaf67a0283a', '63e59c46-9d38-4437-8465-cc85c807bf5f', 'ace4ffbe-b67e-11f1-9dfe-bc03580ec9a9', '5502cac4-346b-4677-8943-4d5393958226', 1, '2026-09-22 12:12:45', '2026-09-22 12:12:45'),
('fe898057-7752-44ae-84db-bacd55c02a36', '63e59c46-9d38-4437-8465-cc85c807bf5f', 'ace558ca-b67e-11f1-9dfe-bc03580ec9a9', '5502cac4-346b-4677-8943-4d5393958226', 1, '2026-09-22 12:13:01', '2026-09-22 12:13:01');

-- --------------------------------------------------------

--
-- Table structure for table `modules`
--

CREATE TABLE `modules` (
  `module_id` char(36) NOT NULL,
  `course_id` char(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `sort_order` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `modules`
--

INSERT INTO `modules` (`module_id`, `course_id`, `title`, `sort_order`) VALUES
('926a1dcd-b67e-11f1-9dfe-bc03580ec9a9', '1f1d28dd-c48f-4947-bda4-01ae1b7b9cfa', 'Module 1: Getting Started', 1),
('926b848c-b67e-11f1-9dfe-bc03580ec9a9', '1f1d28dd-c48f-4947-bda4-01ae1b7b9cfa', 'Module 2: Advanced Topics', 2),
('mod-1', 'course-1', 'Introduction to React', 1);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `message` longtext NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `payment_id` char(36) NOT NULL,
  `student_id` char(36) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `method` varchar(50) NOT NULL,
  `status` varchar(20) DEFAULT 'pending' CHECK (`status` in ('pending','completed','failed','refunded')),
  `transaction_ref` varchar(255) DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`payment_id`, `student_id`, `amount`, `method`, `status`, `transaction_ref`, `paid_at`, `created_at`) VALUES
('7fc175f2-bd5c-4730-a016-59da0ceaaab9', '5502cac4-346b-4677-8943-4d5393958226', 50.00, 'card', 'completed', 'TXN-1790077954593-92xw2ityz', '2026-09-22 11:52:34', '2026-09-22 11:52:34'),
('add1e5f7-fed4-4c5c-ac01-abfa352d22b6', '5502cac4-346b-4677-8943-4d5393958226', 49.99, 'card', 'completed', 'TXN-1790078018426-xho1tesuo', '2026-09-22 11:53:38', '2026-09-22 11:53:38');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `review_id` char(36) NOT NULL,
  `student_id` char(36) NOT NULL,
  `course_id` char(36) NOT NULL,
  `rating` int(11) DEFAULT 5 CHECK (`rating` between 1 and 5),
  `comment` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`, `description`) VALUES
(1, 'student', 'Course learner who enrolls in courses'),
(2, 'instructor', 'Course creator and educator'),
(3, 'admin', 'Platform administrator and moderator'),
(4, 'support_agent', 'Customer support staff'),
(5, 'guest', 'Unauthenticated visitor');

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `ticket_id` char(36) NOT NULL,
  `raised_by_user_id` char(36) NOT NULL,
  `assigned_agent_id` char(36) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `description` longtext NOT NULL,
  `status` varchar(20) DEFAULT 'open' CHECK (`status` in ('open','in_progress','resolved','closed')),
  `priority` varchar(20) DEFAULT 'medium' CHECK (`priority` in ('low','medium','high','urgent')),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL,
  `status` varchar(20) DEFAULT 'active' CHECK (`status` in ('active','suspended','inactive')),
  `bio` text DEFAULT NULL,
  `payout_account` varchar(255) DEFAULT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `password_hash`, `role`, `status`, `bio`, `payout_account`, `permissions`, `created_at`) VALUES
('5502cac4-346b-4677-8943-4d5393958226', 'saadman Khondaker', 'saadmankr@gmail.com', '$2a$10$53FEX2wAW7VUYOz2fnuCcu4LDl2kgymRPbNHl6jyyOJ40Lf9kht1O', 'student', 'active', NULL, NULL, NULL, '2026-09-21 15:47:37'),
('842d0802-70d3-4f98-bcd9-c793dd9a828f', 'test account', 'test@test.com', '$2a$10$ZShKpUy1pjXD/AaaPpAvwunsJn6Dsv8bY3KUU7n08cNPR8dYA.gWK', 'student', 'active', NULL, NULL, NULL, '2026-09-21 23:47:29'),
('a3f78c12-591c-4758-8af0-979681ca50c4', 'Test Dev', 'admin@test.com', '$2a$10$obpaMaqO6Totq1mtP1NPJ.wDYQY4vjjLCfCTTI9lEuhxBNpLEPjHi', 'admin', 'active', NULL, NULL, NULL, '2026-09-22 10:12:23'),
('instr-1', 'John Instructor', 'john@example.com', '$2a$10$ZCgegx1oi4i8pyA9TdHQFuImx/qh3CXQR0hib32hmShjSkIpFGjum', 'instructor', 'active', 'Expert in web development', NULL, NULL, '2026-09-21 15:33:29');

-- --------------------------------------------------------

--
-- Table structure for table `wishlist_items`
--

CREATE TABLE `wishlist_items` (
  `wishlist_item_id` char(36) NOT NULL,
  `student_id` char(36) NOT NULL,
  `course_id` char(36) NOT NULL,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure for view `course_enrollment_stats`
--
DROP TABLE IF EXISTS `course_enrollment_stats`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `course_enrollment_stats`  AS SELECT `c`.`course_id` AS `course_id`, `c`.`title` AS `title`, count(distinct `e`.`student_id`) AS `total_enrollments`, count(distinct case when `e`.`completed` = 1 then `e`.`student_id` end) AS `completed_count`, avg(`e`.`progress_percent`) AS `avg_progress`, `c`.`avg_rating` AS `avg_rating`, `c`.`created_at` AS `created_at` FROM (`courses` `c` left join `enrollments` `e` on(`c`.`course_id` = `e`.`course_id`)) GROUP BY `c`.`course_id`, `c`.`title`, `c`.`avg_rating`, `c`.`created_at` ;

-- --------------------------------------------------------

--
-- Structure for view `instructor_earnings`
--
DROP TABLE IF EXISTS `instructor_earnings`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `instructor_earnings`  AS SELECT `u`.`user_id` AS `user_id`, `u`.`name` AS `name`, count(distinct `c`.`course_id`) AS `total_courses`, count(distinct `e`.`enrollment_id`) AS `total_enrollments`, sum(`p`.`amount`) AS `total_revenue` FROM (((`users` `u` left join `courses` `c` on(`u`.`user_id` = `c`.`instructor_id`)) left join `enrollments` `e` on(`c`.`course_id` = `e`.`course_id`)) left join `payments` `p` on(`e`.`payment_id` = `p`.`payment_id` and `p`.`status` = 'completed')) WHERE `u`.`role` = 'instructor' GROUP BY `u`.`user_id`, `u`.`name` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`category_id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_name` (`name`);

--
-- Indexes for table `certificates`
--
ALTER TABLE `certificates`
  ADD PRIMARY KEY (`certificate_id`),
  ADD UNIQUE KEY `enrollment_id` (`enrollment_id`),
  ADD KEY `idx_enrollment` (`enrollment_id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`course_id`),
  ADD KEY `idx_instructor` (`instructor_id`),
  ADD KEY `idx_category` (`category_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created` (`created_at`);
ALTER TABLE `courses` ADD FULLTEXT KEY `ft_title_desc` (`title`,`description`);

--
-- Indexes for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`enrollment_id`),
  ADD UNIQUE KEY `unique_enrollment` (`student_id`,`course_id`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_course` (`course_id`),
  ADD KEY `idx_completed` (`completed`),
  ADD KEY `fk_enrollment_payment` (`payment_id`);

--
-- Indexes for table `lessons`
--
ALTER TABLE `lessons`
  ADD PRIMARY KEY (`lesson_id`),
  ADD KEY `idx_module` (`module_id`);

--
-- Indexes for table `lesson_progress`
--
ALTER TABLE `lesson_progress`
  ADD PRIMARY KEY (`lesson_progress_id`),
  ADD UNIQUE KEY `unique_lesson_progress` (`enrollment_id`,`lesson_id`),
  ADD KEY `idx_enrollment` (`enrollment_id`),
  ADD KEY `idx_lesson` (`lesson_id`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_completed` (`completed`);

--
-- Indexes for table `modules`
--
ALTER TABLE `modules`
  ADD PRIMARY KEY (`module_id`),
  ADD KEY `idx_course` (`course_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_read` (`is_read`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD UNIQUE KEY `transaction_ref` (`transaction_ref`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_course` (`course_id`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`ticket_id`),
  ADD KEY `idx_raised_by` (`raised_by_user_id`),
  ADD KEY `idx_assigned` (`assigned_agent_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `wishlist_items`
--
ALTER TABLE `wishlist_items`
  ADD PRIMARY KEY (`wishlist_item_id`),
  ADD UNIQUE KEY `unique_wishlist` (`student_id`,`course_id`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `fk_wishlist_course` (`course_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `certificates`
--
ALTER TABLE `certificates`
  ADD CONSTRAINT `fk_cert_enrollment` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`enrollment_id`) ON DELETE CASCADE;

--
-- Constraints for table `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `fk_course_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`),
  ADD CONSTRAINT `fk_course_instructor` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `fk_enrollment_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_enrollment_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`payment_id`),
  ADD CONSTRAINT `fk_enrollment_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `lessons`
--
ALTER TABLE `lessons`
  ADD CONSTRAINT `fk_lesson_module` FOREIGN KEY (`module_id`) REFERENCES `modules` (`module_id`) ON DELETE CASCADE;

--
-- Constraints for table `lesson_progress`
--
ALTER TABLE `lesson_progress`
  ADD CONSTRAINT `fk_lp_enrollment` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`enrollment_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_lp_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`lesson_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_lp_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `modules`
--
ALTER TABLE `modules`
  ADD CONSTRAINT `fk_module_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payment_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `fk_review_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_review_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `fk_ticket_assigned` FOREIGN KEY (`assigned_agent_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ticket_raised_by` FOREIGN KEY (`raised_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_user_role` FOREIGN KEY (`role`) REFERENCES `roles` (`role_name`);

--
-- Constraints for table `wishlist_items`
--
ALTER TABLE `wishlist_items`
  ADD CONSTRAINT `fk_wishlist_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_wishlist_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
