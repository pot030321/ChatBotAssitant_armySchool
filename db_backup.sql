-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.4.3 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for student_support_chat
DROP DATABASE IF EXISTS `student_support_chat`;
CREATE DATABASE IF NOT EXISTS `student_support_chat` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `student_support_chat`;

-- Dumping structure for table student_support_chat.alembic_version
DROP TABLE IF EXISTS `alembic_version`;
CREATE TABLE IF NOT EXISTS `alembic_version` (
  `version_num` varchar(32) NOT NULL,
  PRIMARY KEY (`version_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table student_support_chat.alembic_version: ~1 rows (approximately)
INSERT INTO `alembic_version` (`version_num`) VALUES
	('2f2b42670647');

-- Dumping structure for table student_support_chat.departments
DROP TABLE IF EXISTS `departments`;
CREATE TABLE IF NOT EXISTS `departments` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_departments_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table student_support_chat.departments: ~6 rows (approximately)
INSERT INTO `departments` (`id`, `name`, `description`, `created_at`) VALUES
	('64694384-80a5-41fc-84d1-b132a5e2966a', 'CNTT', 'Công nghệ thông tin và hỗ trợ kỹ thuật', '2025-08-15 00:49:09'),
	('8422c771-71f7-4051-9437-ff83d358b425', 'Phòng Đào tạo', 'Quản lý đào tạo và kế hoạch học tập', '2025-08-15 00:49:09'),
	('b05b6517-5941-4b33-bfac-15dca987c83e', 'QLSV', 'Quản lý công tác sinh viên', '2025-08-15 00:49:09'),
	('c6f92689-b1ee-42a4-a2b0-9d5351fee97b', 'Thư viện', 'Quản lý thư viện và tài liệu', '2025-08-15 00:49:09'),
	('ee64010e-b797-4756-8c3a-13c1d41b10d8', 'Phòng Tài chính', 'Quản lý tài chính và học phí', '2025-08-15 00:49:09'),
	('fffb8875-169a-4916-bba6-3e995a05ce44', 'Phòng Tuyển sinh', 'Tư vấn và hỗ trợ tuyển sinh', '2025-08-15 00:49:09');

-- Dumping structure for table student_support_chat.messages
DROP TABLE IF EXISTS `messages`;
CREATE TABLE IF NOT EXISTS `messages` (
  `id` varchar(36) NOT NULL,
  `thread_id` varchar(36) NOT NULL,
  `user_id` int DEFAULT NULL,
  `sender` enum('student','manager','department','leadership','system','assistant') NOT NULL,
  `text` text NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `thread_id` (`thread_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`thread_id`) REFERENCES `threads` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table student_support_chat.messages: ~8 rows (approximately)
INSERT INTO `messages` (`id`, `thread_id`, `user_id`, `sender`, `text`, `created_at`) VALUES
	('1', 'f003130d-ff4f-4521-852b-65bd7eab1650', NULL, 'system', '[SYSTEM] Yêu cầu đã được chuyển đến phòng/khoa: CNTT', '2025-08-18 08:45:31'),
	('1755484803', 'f003130d-ff4f-4521-852b-65bd7eab1650', 9, 'department', 'a', '2025-08-18 09:10:17'),
	('1755488510', 'f003130d-ff4f-4521-852b-65bd7eab1650', 9, 'department', 'a', '2025-08-18 09:10:23'),
	('1755491678', 'f003130d-ff4f-4521-852b-65bd7eab1650', 9, 'department', 'a', '2025-08-18 09:10:35'),
	('5fd23c8d-4d8c-4630-8d64-23099a593548', '38722ebf-697a-44de-bc77-768617b21549', NULL, 'system', '[SYSTEM] Yêu cầu đã được chuyển đến phòng/khoa: CNTT', '2025-08-14 23:52:25'),
	('841cd0ff-f0cf-41d7-8461-d1495577b260', 'e2c2df2a-7331-45d2-bc03-2a50491acd94', NULL, 'system', '[SYSTEM] Yêu cầu đã được chuyển đến phòng/khoa: CNTT', '2025-08-14 21:32:18'),
	('ba975555-365b-4764-8a87-86c8073295af', '82bead0f-364e-495e-9c31-41f67b874c0c', NULL, 'system', '[SYSTEM] Yêu cầu đã được chuyển đến phòng/khoa: Phòng CNTT', '2025-08-14 21:25:34'),
	('c313c1bd-d81a-435f-9a34-01d2fe86bcb2', '435bf9e5-51b4-4232-8ac8-b06b4662df48', NULL, 'system', '[SYSTEM] Yêu cầu đã được chuyển đến phòng/khoa: CNTT', '2025-08-14 21:59:58');

-- Dumping structure for table student_support_chat.threads
DROP TABLE IF EXISTS `threads`;
CREATE TABLE IF NOT EXISTS `threads` (
  `id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `student_id` int DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `topic` varchar(100) DEFAULT NULL,
  `issue_type` varchar(100) DEFAULT NULL,
  `assigned_to` varchar(100) DEFAULT NULL,
  `status` enum('new','pending','assigned','in_progress','resolved','escalated') NOT NULL DEFAULT 'new',
  `priority` enum('low','normal','high','urgent') NOT NULL,
  `assignee_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `assignee_id` (`assignee_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `threads_ibfk_1` FOREIGN KEY (`assignee_id`) REFERENCES `users` (`id`),
  CONSTRAINT `threads_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table student_support_chat.threads: ~8 rows (approximately)
INSERT INTO `threads` (`id`, `title`, `student_id`, `department`, `topic`, `issue_type`, `assigned_to`, `status`, `priority`, `assignee_id`, `created_at`, `updated_at`) VALUES
	('049b5a24-09e3-404e-abc1-1699d30ebb60', 't ấ', 1, NULL, NULL, 'question', 'CNTT', 'resolved', 'normal', NULL, '2025-08-18 08:23:54', '2025-08-18 08:36:58'),
	('127b44f9-9ed8-4e0e-8950-f5f65b22882d', 'a', 1, NULL, NULL, 'question', 'CNTT', 'assigned', 'normal', NULL, '2025-08-18 08:39:08', '2025-08-18 08:39:21'),
	('38722ebf-697a-44de-bc77-768617b21549', 'chào bạn tôi cần lập phiếu', 1, NULL, NULL, 'question', 'CNTT', 'resolved', 'normal', NULL, '2025-08-14 23:52:00', '2025-08-16 20:06:36'),
	('435bf9e5-51b4-4232-8ac8-b06b4662df48', 't là ai ', 1, NULL, NULL, 'question', 'CNTT', 'in_progress', 'normal', NULL, '2025-08-14 21:59:44', '2025-08-14 21:59:58'),
	('82bead0f-364e-495e-9c31-41f67b874c0c', 'chào tôi tên phong', 1, NULL, NULL, 'question', 'Phòng CNTT', 'in_progress', 'normal', NULL, '2025-08-14 21:16:26', '2025-08-14 21:25:34'),
	('d0f13208-49b2-4c15-99df-4d5b1b7c537d', 't', 1, NULL, NULL, 'question', 'CNTT', 'resolved', 'normal', NULL, '2025-08-18 08:35:49', '2025-08-18 08:36:58'),
	('e2c2df2a-7331-45d2-bc03-2a50491acd94', 'topio là aii đó', 1, NULL, NULL, 'question', 'CNTT', 'in_progress', 'normal', NULL, '2025-08-14 21:32:05', '2025-08-14 21:32:18'),
	('f003130d-ff4f-4521-852b-65bd7eab1650', 'e', 1, NULL, NULL, 'question', 'CNTT', 'resolved', 'normal', NULL, '2025-08-18 08:45:17', '2025-08-18 09:10:39');

-- Dumping structure for table student_support_chat.users
DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `hashed_password` varchar(255) NOT NULL,
  `role` enum('student','manager','department','leadership','system','assistant') NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_users_email` (`email`),
  UNIQUE KEY `ix_users_username` (`username`),
  KEY `ix_users_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table student_support_chat.users: ~10 rows (approximately)
INSERT INTO `users` (`id`, `username`, `full_name`, `email`, `hashed_password`, `role`, `department`, `created_at`) VALUES
	(1, 'student1', 'Nguyen Van A', 'student1@example.com', 'password123', 'student', NULL, '2025-08-14 15:50:27'),
	(2, 'manager1', 'Tran Thi B', 'manager1@example.com', 'password123', 'manager', NULL, '2025-08-14 15:50:27'),
	(3, 'dept_it', 'Phong CNTT', 'it@example.com', 'password123', 'department', 'IT', '2025-08-14 15:50:27'),
	(4, 'dept_academic', 'Phong Dao Tao', 'academic@example.com', 'password123', 'department', 'Academic Affairs', '2025-08-14 15:50:27'),
	(5, 'leadership1', 'Le Van C', 'leadership1@example.com', 'password123', 'leadership', NULL, '2025-08-14 15:50:27'),
	(6, 'admin', 'Admin User', 'admin@example.com', 'password123', 'manager', NULL, '2025-08-15 09:16:19'),
	(7, 'daotao', 'Nhân viên Đào tạo', 'daotao@example.com', 'password123', 'department', 'Phòng Đào tạo', '2025-08-15 09:16:19'),
	(8, 'qlsv', 'Nhân viên QLSV', 'qlsv@example.com', 'password123', 'department', 'QLSV', '2025-08-15 09:16:19'),
	(9, 'cntt', 'Nhân viên CNTT', 'cntt@example.com', 'password123', 'department', 'CNTT', '2025-08-15 09:16:19'),
	(10, 'taichinhketoan', 'Nhân viên Tài chính', 'taichinhketoan@example.com', 'password123', 'department', 'Phòng Tài chính', '2025-08-15 09:16:19');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
