-- Combined schema for Tnps-Gate-Pass
-- Generated from SQL dumps in this repository's DB/ folder
-- Edit `CREATE DATABASE` name below as needed before running in MySQL Workbench

CREATE DATABASE IF NOT EXISTS `gatepass_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `gatepass_db`;

SET FOREIGN_KEY_CHECKS=0;

-- Table: admin
DROP TABLE IF EXISTS `admin`;
CREATE TABLE `admin` (
  `adminid` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(45) NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  `password` varchar(200) NOT NULL,
  `category` varchar(45) NOT NULL,
  `Hostel` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`adminid`),
  UNIQUE KEY `adminid_UNIQUE` (`adminid`),
  UNIQUE KEY `uid_UNIQUE` (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: studentdetails
DROP TABLE IF EXISTS `studentdetails`;
CREATE TABLE `studentdetails` (
  `uid` varchar(50) NOT NULL,
  `sname` varchar(50) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `dept` varchar(50) DEFAULT NULL,
  `address` varchar(200) DEFAULT NULL,
  `year` varchar(50) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `gender` varchar(50) DEFAULT NULL,
  `mobileno` varchar(50) DEFAULT NULL,
  `dob` varchar(50) DEFAULT NULL,
  `academicyear` varchar(50) DEFAULT NULL,
  `path` varchar(500) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `parentname` varchar(70) DEFAULT NULL,
  `parentnumber` varchar(45) DEFAULT NULL,
  `other1` varchar(45) DEFAULT NULL,
  `other2` varchar(50) DEFAULT NULL,
  `other3` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: studentdetails2 (duplicate/alternate student table)
DROP TABLE IF EXISTS `studentdetails2`;
CREATE TABLE `studentdetails2` (
  `uid` varchar(50) NOT NULL,
  `sname` varchar(50) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `dept` varchar(50) DEFAULT NULL,
  `address` varchar(200) DEFAULT NULL,
  `year` varchar(50) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `gender` varchar(50) DEFAULT NULL,
  `mobileno` varchar(50) DEFAULT NULL,
  `dob` varchar(50) DEFAULT NULL,
  `academicyear` varchar(50) DEFAULT NULL,
  `path` varchar(500) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `parentname` varchar(70) DEFAULT NULL,
  `parentnumber` varchar(45) DEFAULT NULL,
  `other1` varchar(45) DEFAULT NULL,
  `other2` varchar(50) DEFAULT NULL,
  `other3` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: log_detail (simple log table)
DROP TABLE IF EXISTS `log_detail`;
CREATE TABLE `log_detail` (
  `logid` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(45) DEFAULT NULL,
  `indatetime` varchar(45) DEFAULT NULL,
  `GuardName` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`logid`)
) ENGINE=InnoDB AUTO_INCREMENT=59653 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: log_details1 (detailed logs with outdatetime and status)
DROP TABLE IF EXISTS `log_details1`;
CREATE TABLE `log_details1` (
  `logid` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(45) DEFAULT NULL,
  `indatetime` varchar(45) DEFAULT NULL,
  `outdatetime` varchar(30) DEFAULT NULL,
  `approvaldt` varchar(45) DEFAULT NULL,
  `status` varchar(45) DEFAULT NULL,
  `hostelintime` varchar(45) DEFAULT NULL,
  `passtype` varchar(45) DEFAULT NULL,
  `hosteloutauth` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`logid`)
) ENGINE=InnoDB AUTO_INCREMENT=34933 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: timebound
DROP TABLE IF EXISTS `timebound`;
CREATE TABLE `timebound` (
  `tbid` int NOT NULL AUTO_INCREMENT,
  `days` varchar(60) DEFAULT NULL,
  `start` varchar(60) DEFAULT NULL,
  `end` varchar(60) DEFAULT NULL,
  `start1` varchar(60) DEFAULT NULL,
  `end1` varchar(60) DEFAULT NULL,
  `dayno` varchar(60) DEFAULT NULL,
  `hostel` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`tbid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS=1;

-- Notes:
-- - The original dumps used varchar columns for many date/time fields (e.g. `indatetime`).
--   For better behavior you may want to ALTER these to DATETIME or TIMESTAMP types after import.
-- - Two student tables exist: `studentdetails` and `studentdetails2` (kept as-is).
-- - No explicit foreign keys were present in the source dumps.
