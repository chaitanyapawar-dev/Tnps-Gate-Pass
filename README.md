# 🚪 Gate Pass Management System

A comprehensive Node.js/Express web application for managing hostel and college gate pass operations.

## 📋 Overview

This system provides complete gate pass management for educational institutions, handling student movement tracking, pass generation, and administrative reporting.

### Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **EJS** | Templating engine |
| **MySQL** | Database (mysql2 driver) |
| **JWT** | Authentication tokens |
| **bcrypt** | Password hashing |
| **Nodemailer** | Email notifications |
| **Multer** | File uploads (Excel import) |
| **node-cron** | Scheduled tasks |

---

## 👥 User Roles

| Role | Access Level |
|------|-------------|
| `SuperID` | Full admin access to all features |
| `BoysHostelAdmin` | Manages boys hostel students |
| `GirlsHostelAdmin` | Manages girls hostel students |
| `Hostelauthority` | Token generation for hostel passes |
| `Gateauthority` | Gate in/out scanning operations |

---

## ✨ Core Features

### 🔐 Authentication & Authorization
- Login/Signup system with bcrypt password hashing
- JWT-based session management with cookies
- Role-based access control (RBAC)

### 📱 Barcode/QR Scanning
- Scan student IDs for gate in/out tracking
- Manual UID entry option
- Real-time status checking

### 🎫 Pass Management
- **City Pass**: Short-term passes for city visits
- **Home Pass**: Longer passes for home visits
- Active pass tracking and deactivation
- Auto-restrict students who overstay (daily cron job at midnight)

### 👥 Student Management
- Student profiles with detailed info:
  - UID, Name, Email, Department
  - Year, Gender, DOB, Address
  - Mobile number, Parent details
- Category management: `Hostel` / `Day Scholar`
- Restrict/Unrestrict student status
- Excel import for bulk student data

### 📊 Reports & Analytics
- Dashboard with statistics:
  - Total students
  - Inside hostel count
  - Gate out count
  - Hostel out count
- Date range filtering for logs
- Department-wise distribution charts
- Status pie charts (Restrict/Unrestrict)
- Hourly pass generation timeline

### ⏰ Time Bound Management
- Configure allowed pass times per day
- Separate settings for Boys/Girls hostels
- Two time slots per day support

### 🏥 Sick Leave Module
- Scan ID → Record illness type
- Logs with date/time and admin who recorded
- Date range filtering for sick leave records

### 📧 Email Notifications
- Automatic email when gate pass is generated
- Uses EJS template for email content

### 👤 Admin User Management
- Add/Update/Delete admin users
- Assign roles and hostel affiliations

---

## 🗄️ Database Schema

### Tables

| Table | Purpose |
|-------|---------|
| `admin` | Admin/staff user accounts |
| `studentdetails` | Student master data |
| `log_details1` | Main gate pass & movement logs |
| `log_detail` | Simple entry logs (college late comers) |
| `timebound` | Pass time restrictions |
| `sick_leave_logs` | Sick leave records |

### Key Fields

#### `admin`
```sql
adminid, uid, name, password, category, Hostel
```

#### `studentdetails`
```sql
uid, sname, email, dept, address, year, category, gender, 
mobileno, dob, academicyear, path, status, parentname, parentnumber
```

#### `log_details1`
```sql
logid, uid, indatetime, outdatetime, approvaldt, status, 
hostelintime, passtype, hosteloutauth
```

#### `timebound`
```sql
tbid, days, start, end, start1, end1, dayno, hostel
```

---

## 🛣️ API Routes

### Authentication
| Route | Method | Description |
|-------|--------|-------------|
| `/loginpanel` | GET/POST | Login page |
| `/signup` | GET/POST | Admin registration |
| `/logout` | GET | Logout user |

### Gate Operations
| Route | Method | Description |
|-------|--------|-------------|
| `/homepage` | GET | Gate authority home (scan page) |
| `/Collegepage` | GET | College gate page |
| `/codescanner/:uid` | GET/POST | Process scanned ID |
| `/codescanner1/:uid` | GET/POST | College student entry |

### Hostel Operations
| Route | Method | Description |
|-------|--------|-------------|
| `/tokenhomepage` | GET | Hostel authority home |
| `/token/:uid` | GET/POST | Generate pass |
| `/takein/:uid` | GET/POST | Take in student |

### Reports & Logs
| Route | Method | Description |
|-------|--------|-------------|
| `/reports` | GET | Dashboard statistics |
| `/hostelpanel` | GET | Today's hostel logs |
| `/daterange` | GET/POST | Filter logs by date |
| `/outstudents` | GET | Students currently out of hostel |
| `/Gateoutstudents` | GET | Students currently out of gate |
| `/activepass` | GET | Active passes list |
| `/gateouttoday` | GET | Today's gate out records |
| `/hostelouttoday` | GET | Today's hostel out records |

### Student Management
| Route | Method | Description |
|-------|--------|-------------|
| `/studentsupdate` | GET | All students list |
| `/studentsupdatehostel/:role` | GET | Hostel students list |
| `/studentprofile/:uid` | GET | Student details |
| `/updatestudent/:uid` | POST | Update student info |
| `/insertcategory/:uid` | GET | Add student to hostel |
| `/restrictstu/:uid` | GET | Restrict student |
| `/Unrestrictstu/:uid` | GET | Unrestrict student |

### Admin Management
| Route | Method | Description |
|-------|--------|-------------|
| `/adduser` | GET/POST | Add admin user |
| `/updateuser` | GET | List admin users |
| `/userprofile/:uid` | GET | Admin profile |
| `/saveuser/:id` | POST | Update admin |
| `/deleteuser/:uid` | GET | Delete admin |

### Sick Leave
| Route | Method | Description |
|-------|--------|-------------|
| `/sickleave` | GET | Sick leave scanner |
| `/sickleaveform/:uid` | GET | Sick leave form |
| `/savesickleave/:uid` | POST | Save sick leave |
| `/sickleavelogs` | GET | Sick leave records |
| `/sickleavelogsdaterange` | POST | Filter sick leave by date |

### Time Bound
| Route | Method | Description |
|-------|--------|-------------|
| `/bound` | GET | Time bound settings |
| `/updatetimebound` | POST | Update time bounds |

### Data Operations
| Route | Method | Description |
|-------|--------|-------------|
| `/import-excel` | POST | Import students from Excel |
| `/blankcsv` | GET | Download template Excel |

### API Endpoints (JSON)
| Route | Method | Description |
|-------|--------|-------------|
| `/deptdetails` | GET | Department distribution data |
| `/datastatus` | GET | Student status distribution |
| `/datatimelines` | GET | Hourly pass generation data |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MySQL Server
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AryanSeth009/Tnps-Gate-Pass.git
   cd Tnps-Gate-Pass/gatepass
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the `gatepass` folder:
   ```env
   DB_HOST=localhost
   DB_NAME=gatepass_db
   DB_USER=your_username
   DB_PASSWORD=your_password
   PORT=3000
   ```

4. **Set up the database**
   - Run the SQL script from `DB/combined_schema.sql` in MySQL Workbench
   - Or import individual SQL files from the `DB/` folder

5. **Start the server**
   ```bash
   npm start
   ```

6. **Access the application**
   Open `http://localhost:3000/loginpanel` in your browser

---

## 📁 Project Structure

```
gatepass/
├── app.js              # Main application file with all routes
├── server.js           # Database connection configuration
├── uploader.js         # Multer configuration for file uploads
├── bcrypt.js           # Bcrypt utility
├── package.json        # Dependencies
├── public/
│   ├── documents/      # Template files (Excel)
│   ├── hostelphotos/   # Student photos
│   ├── images/         # Static images
│   ├── javascripts/    # Client-side JS
│   ├── stylesheets/    # CSS files
│   └── uploads/        # Uploaded files
├── views/              # EJS templates
│   ├── loginpanel.ejs
│   ├── homepage.ejs
│   ├── tokenhomepage.ejs
│   ├── reports.ejs
│   ├── hostelpanel.ejs
│   ├── studentprofile.ejs
│   └── ... (other views)
└── scripts/            # Utility scripts
```

---

## 🔧 Configuration

### Email Configuration
Update email credentials in `app.js`:
```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});
```

### JWT Secret
Change the secret key in `app.js`:
```javascript
const secretkey = "your-secure-secret-key";
```

### Session Duration
JWT tokens expire in 10000 seconds (~2.7 hours). Modify in login route:
```javascript
jwt.sign(user, secretkey, { expiresIn: '10000s' }, ...)
```

---
