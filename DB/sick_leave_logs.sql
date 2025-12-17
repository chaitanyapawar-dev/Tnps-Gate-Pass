-- MySQL script to create sick_leave_logs table
-- This table stores sick leave records for students

CREATE TABLE IF NOT EXISTS `sick_leave_logs` (
  `logid` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(50) NOT NULL,
  `illness` varchar(100) NOT NULL,
  `logdate` date NOT NULL,
  `logtime` varchar(20) DEFAULT NULL,
  `recorded_by` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`logid`),
  KEY `idx_uid` (`uid`),
  KEY `idx_logdate` (`logdate`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Add foreign key constraint if studentdetails table exists
-- ALTER TABLE `sick_leave_logs` 
-- ADD CONSTRAINT `fk_sick_leave_student` 
-- FOREIGN KEY (`uid`) REFERENCES `studentdetails` (`uid`) 
-- ON DELETE CASCADE ON UPDATE CASCADE;

