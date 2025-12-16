-- Student Portal Additional Tables
-- Run this SQL to add the required tables for student portal features

-- Add password field to studentdetails if not exists
ALTER TABLE studentdetails ADD COLUMN password VARCHAR(200) DEFAULT NULL;

-- Pass Requests Table (for student self-service pass requests)
CREATE TABLE IF NOT EXISTS `pass_requests` (
  `requestid` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(50) NOT NULL,
  `passtype` varchar(45) NOT NULL,
  `expected_out` datetime DEFAULT NULL,
  `expected_return` datetime DEFAULT NULL,
  `reason` text,
  `emergency_contact` varchar(20) DEFAULT NULL,
  `status` enum('pending','approved','rejected','cancelled') DEFAULT 'pending',
  `approved_by` varchar(45) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejection_reason` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`requestid`),
  KEY `idx_uid` (`uid`),
  KEY `idx_status` (`status`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Student Notifications Table
CREATE TABLE IF NOT EXISTS `student_notifications` (
  `notifid` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(50) NOT NULL,
  `type` varchar(50) DEFAULT 'info',
  `title` varchar(200) NOT NULL,
  `message` text,
  `read` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notifid`),
  KEY `idx_uid` (`uid`),
  KEY `idx_read` (`read`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Indexes for better performance on existing tables
-- (Run only if these indexes don't exist)
-- ALTER TABLE log_details1 ADD INDEX idx_uid (uid);
-- ALTER TABLE log_details1 ADD INDEX idx_status (status);
-- ALTER TABLE log_details1 ADD INDEX idx_approvaldt (approvaldt);
