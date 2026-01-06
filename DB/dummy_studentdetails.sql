-- Dummy dataset for local testing
-- Usage: run `mysql < DB/dummy_studentdetails.sql` after schema import

INSERT INTO `studentdetails`
  (`uid`, `sname`, `email`, `dept`, `address`, `year`, `category`, `gender`,
   `mobileno`, `dob`, `academicyear`, `path`, `status`,
   `parentname`, `parentnumber`, `other1`, `other2`, `other3`)
VALUES
  ('SVP2025001', 'Rahul Patil', 'rahul.patil@example.com', 'CSE', 'Nagpur, MH', 'TE', 'Hostel', 'MALE',
   '9001000100', '2004-02-14', '2024-25', '/images/students/SVP2025001.jpg', 'Unrestrict',
   'Suresh Patil', '9001000101', NULL, NULL, NULL),
  ('SVP2025002', 'Aditi Kulkarni', 'aditi.k@example.com', 'IT', 'Pune, MH', 'SE', 'Hostel', 'FEMALE',
   '9001000200', '2005-07-21', '2024-25', '/images/students/SVP2025002.jpg', 'Restrict',
   'Meera Kulkarni', '9001000201', NULL, NULL, NULL),
  ('SVP2025003', 'Mohit Sharma', 'mohit.sharma@example.com', 'ENTC', 'Akola, MH', 'BE', 'Hostel', 'MALE',
   '9001000300', '2003-11-03', '2023-24', '/images/students/SVP2025003.jpg', 'Unrestrict',
   'Anita Sharma', '9001000301', NULL, NULL, NULL),
  ('SVP2025004', 'Sneha Jain', 'sneha.jain@example.com', 'CSE', 'Indore, MP', 'TE', 'Hostel', 'FEMALE',
   '9001000400', '2004-05-30', '2024-25', '/images/students/SVP2025004.jpg', 'Unrestrict',
   'Rajesh Jain', '9001000401', NULL, NULL, NULL),
  ('SVP2025005', 'Akash Gupta', 'akash.g@example.com', 'MECH', 'Bhopal, MP', 'SE', 'Day Scholar', 'MALE',
   '9001000500', '2005-09-18', '2024-25', '/images/students/SVP2025005.jpg', 'Unrestrict',
   'Neeta Gupta', '9001000501', NULL, 'Bus Route 3', NULL),
  ('SVP2025006', 'Pooja Deshmukh', 'pooja.d@example.com', 'CIVIL', 'Nagpur, MH', 'BE', 'Hostel', 'FEMALE',
   '9001000600', '2003-12-11', '2023-24', '/images/students/SVP2025006.jpg', 'Restrict',
   'Sunil Deshmukh', '9001000601', NULL, NULL, NULL),
  ('SVP2025007', 'Nikhil Verma', 'nikhil.verma@example.com', 'CSE', 'Raipur, CG', 'FE', 'Hostel', 'MALE',
   '9001000700', '2006-08-09', '2024-25', '/images/students/SVP2025007.jpg', 'Unrestrict',
   'Kiran Verma', '9001000701', NULL, NULL, NULL),
  ('SVP2025008', 'Isha More', 'isha.more@example.com', 'IT', 'Thane, MH', 'TE', 'Hostel', 'FEMALE',
   '9001000800', '2004-01-27', '2024-25', '/images/students/SVP2025008.jpg', 'Unrestrict',
   'Anjali More', '9001000801', NULL, NULL, NULL),
  ('SVP2025009', 'Yashwant Kale', 'yashwant.k@example.com', 'ENTC', 'Wardha, MH', 'BE', 'Hostel', 'MALE',
   '9001000900', '2003-04-05', '2023-24', '/images/students/SVP2025009.jpg', 'Restrict',
   'Pankaj Kale', '9001000901', NULL, NULL, NULL),
  ('SVP2025010', 'Lavanya Iyer', 'lavanya.iyer@example.com', 'CSE', 'Chennai, TN', 'FE', 'Hostel', 'FEMALE',
   '9001001000', '2006-10-02', '2024-25', '/images/students/SVP2025010.jpg', 'Unrestrict',
   'Priya Iyer', '9001001001', NULL, NULL, NULL);

