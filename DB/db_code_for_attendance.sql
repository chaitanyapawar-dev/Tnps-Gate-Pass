USE gatepass_db;
SET SQL_SAFE_UPDATES = 0; -- Allow deleting data for cleanup

-- ====================================================
-- 1. FIX MISSING TABLE (Prevents Server Crash)
-- ====================================================
CREATE TABLE IF NOT EXISTS daily_attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uid VARCHAR(50),
    date DATE,
    status VARCHAR(20),
    marked_by VARCHAR(50),
    UNIQUE KEY unique_daily_entry (uid, date)
);

-- ====================================================
-- 2. FIX MISSING COLUMNS (Prevents "No students found")
-- ====================================================
-- This block safely adds columns if they don't exist
DROP PROCEDURE IF EXISTS AddCols;
DELIMITER //
CREATE PROCEDURE AddCols()
BEGIN
    IF NOT EXISTS(SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='studentdetails' AND COLUMN_NAME='block') THEN
        ALTER TABLE studentdetails ADD COLUMN block VARCHAR(10) DEFAULT 'A';
    END IF;
    IF NOT EXISTS(SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='studentdetails' AND COLUMN_NAME='floor') THEN
        ALTER TABLE studentdetails ADD COLUMN floor VARCHAR(20) DEFAULT 'Ground';
    END IF;
    IF NOT EXISTS(SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='studentdetails' AND COLUMN_NAME='room_no') THEN
        ALTER TABLE studentdetails ADD COLUMN room_no VARCHAR(10) DEFAULT '101';
    END IF;
    IF NOT EXISTS(SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='studentdetails' AND COLUMN_NAME='bed_no') THEN
        ALTER TABLE studentdetails ADD COLUMN bed_no VARCHAR(5) DEFAULT '1';
    END IF;
END //
DELIMITER ;
CALL AddCols();
DROP PROCEDURE AddCols;

-- ====================================================
-- 3. WIPE OLD DATA (Start Fresh)
-- ====================================================
DELETE FROM studentdetails;

-- ====================================================
-- 4. INSERT REAL DATA (Block A - Second Floor)
-- ====================================================
-- Note: We map Bed A->1, B->2, C->3 so the website works.
INSERT INTO studentdetails 
(uid, sname, email, dept, year, category, gender, mobileno, parentnumber, block, floor, room_no, bed_no) 
VALUES 
-- Room AS-01
('2025AS01A', 'Sam Chaco Ruby', 'sam@test.com', 'CE', '3rd', 'Hostel', 'MALE', '9567416716', '0000000000', 'A', 'Second', 'AS-01', '1'),
('2025AS01B', 'Don Davis', 'don@test.com', 'ETC', '3rd', 'Hostel', 'MALE', '7306222606', '0000000000', 'A', 'Second', 'AS-01', '2'),
('2025AS01C', 'Shawan Thomas Bansode', 'shawan@test.com', 'CE', '2nd', 'Hostel', 'MALE', '0000000000', '0000000000', 'A', 'Second', 'AS-01', '3'),

-- Room AS-02
('2025AS02A', 'Rishab Suresh Chawhan', 'rishab@test.com', 'Unknown', '4th', 'Hostel', 'MALE', '7796542860', '0000000000', 'A', 'Second', 'AS-02', '1'),

-- Room AS-03
('2025AS03A', 'Neeraj Randhir Ruda', 'neeraj@test.com', 'Unknown', '4th', 'Hostel', 'MALE', '8879962654', '0000000000', 'A', 'Second', 'AS-03', '1'),

-- Room AS-04
('2025AS04A', 'Tanishq Dnyaneshwar', 'tanishq@test.com', 'Unknown', '4th', 'Hostel', 'MALE', '7888045720', '0000000000', 'A', 'Second', 'AS-04', '1'),

-- Room AS-05
('2025AS05A', 'Aditya Raj', 'aditya@test.com', 'Unknown', '4th', 'Hostel', 'MALE', '8340341863', '0000000000', 'A', 'Second', 'AS-05', '1'),

-- Room AS-06
('2025AS06A', 'Shahzab Ali Gatty', 'shahzab@test.com', 'CV', '4th', 'Hostel', 'MALE', '7889847053', '0000000000', 'A', 'Second', 'AS-06', '1'),

-- Room AS-07
('2025AS07A', 'Mathew Binoy', 'mathew@test.com', 'Unknown', '4th', 'Hostel', 'MALE', '8067387993', '0000000000', 'A', 'Second', 'AS-07', '1'),

-- Room AS-08
('2025AS08A', 'Denil Daby', 'denil@test.com', 'Unknown', '4th', 'Hostel', 'MALE', '9496963784', '0000000000', 'A', 'Second', 'AS-08', '1'),

-- Room AS-09
('2025AS09A', 'Shahid Sameer', 'shahid@test.com', 'IT', '4th', 'Hostel', 'MALE', '9103843551', '0000000000', 'A', 'Second', 'AS-09', '1'),

-- Room AS-10
('2025AS10A', 'Aleen Jess', 'aleen@test.com', 'Unknown', '4th', 'Hostel', 'MALE', '0000000000', '0000000000', 'A', 'Second', 'AS-10', '1'),
('2025AS10B', 'Ashwin Renjith', 'ashwin@test.com', 'CE', '3rd', 'Hostel', 'MALE', '7034839540', '0000000000', 'A', 'Second', 'AS-10', '2'),
('2025AS10C', 'Ayush Benny', 'ayush@test.com', 'Unknown', '4th', 'Hostel', 'MALE', '8606304705', '0000000000', 'A', 'Second', 'AS-10', '3');

-- ====================================================
-- 5. VERIFY DATA
-- ====================================================
SELECT * FROM studentdetails WHERE block='A' AND floor='Second';

-- UPDATED 0000000000000000000000000000000000000000000000000000000000000000000000000

USE gatepass_db;

-- Add new columns for the Expanded Profile
ALTER TABLE studentdetails
ADD COLUMN middle_name VARCHAR(50),
ADD COLUMN last_name VARCHAR(50),
ADD COLUMN religion VARCHAR(50),
ADD COLUMN mess_type VARCHAR(20) DEFAULT 'Veg', -- Veg/Non-Veg
ADD COLUMN medical_history TEXT,
ADD COLUMN hostel_fee_status VARCHAR(20) DEFAULT 'Pending', -- Paid/Pending
ADD COLUMN college_fee_status VARCHAR(20) DEFAULT 'Pending',
ADD COLUMN emergency_contact VARCHAR(15),
ADD COLUMN guardian_relation VARCHAR(50);

-- Update dummy data so fields aren't empty in the popup
UPDATE studentdetails SET mess_type='Non-Veg', hostel_fee_status='Paid', religion='Christian' WHERE uid LIKE '%AS01%';
UPDATE studentdetails SET mess_type='Veg', hostel_fee_status='Pending', religion='Hindu' WHERE uid LIKE '%AS02%';