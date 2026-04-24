# 📋 Employee Attendance Portal

A complete employee attendance management system with role-based access control (Employee, Manager, HR).

## 🌐 Live Demo

| Service | Link |
|---------|------|
| **Frontend** | [https://attendance-portal.vercel.app](https://attendance-portal.vercel.app) |
| **Backend API** | [https://attendance-backend.onrender.com](https://attendance-backend.onrender.com) |
| **GitHub** | [https://github.com/nikstidke253/attendance-portal](https://github.com/nikstidke253/attendance-portal) |

---

## 📋 Login Credentials

| Role | Username | Password |
|------|----------|----------|
| 👑 **HR Administrator** | `hr_user` | `password123` |
| 📊 **Team Manager** | `manager_user` | `password123` |
| 👤 **Employee** | `emp_user` | `password123` |

---

## ✨ Features

### 👑 HR (Full Access)
- ✅ View own attendance
- ✅ View team attendance
- ✅ View all leave requests
- ✅ Create / Deactivate users
- ✅ Assign roles & managers
- ✅ Configure leave types

### 📊 Manager (Team Access)
- ✅ View own attendance
- ✅ Check in / Check out
- ✅ Apply for leave
- ✅ View own leave requests
- ✅ View team attendance
- ✅ Approve / Reject team leave requests

### 👤 Employee (Self Service)
- ✅ View own attendance
- ✅ Check in / Check out
- ✅ Apply for leave
- ✅ View own leave requests

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React.js, CSS3 |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **Authentication** | JWT (15 min expiry) |
| **ORM** | Sequelize |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## 🔒 Security Features

- ✅ JWT tokens expire after 15 minutes
- ✅ Session timeout after 15 minutes of inactivity
- ✅ Server-side permission checks (no frontend-only restrictions)
- ✅ Employees/Managers can check in only once per calendar day
- ✅ Managers cannot approve/reject their own leave requests
- ✅ Password hashing with bcrypt

---

## 📁 Project Structure
attendance-portal/
├── backend/
│ ├── config/
│ │ └── database.js
│ ├── controllers/
│ │ ├── authController.js
│ │ ├── attendanceController.js
│ │ ├── leaveController.js
│ │ ├── leaveTypeController.js
│ │ └── userController.js
│ ├── middleware/
│ │ ├── auth.js
│ │ └── inactivity.js
│ ├── models/
│ │ ├── index.js
│ │ ├── User.js
│ │ ├── Attendance.js
│ │ ├── LeaveRequest.js
│ │ └── LeaveType.js
│ ├── routes/
│ │ ├── authRoutes.js
│ │ ├── attendanceRoutes.js
│ │ ├── leaveRoutes.js
│ │ ├── leaveTypeRoutes.js
│ │ └── userRoutes.js
│ ├── .env
│ ├── package.json
│ └── server.js
├── frontend/
│ ├── public/
│ │ └── index.html
│ ├── src/
│ │ ├── components/
│ │ │ ├── Navbar.js
│ │ │ └── SessionWarning.js
│ │ ├── context/
│ │ │ └── AuthContext.js
│ │ ├── pages/
│ │ │ ├── Login.js
│ │ │ ├── Dashboard.js
│ │ │ ├── Attendance.js
│ │ │ ├── Timesheet.js
│ │ │ ├── ApplyLeave.js
│ │ │ ├── LeaveApproval.js
│ │ │ ├── UserManagement.js
│ │ │ └── LeaveConfiguration.js
│ │ ├── styles/
│ │ │ └── global.css
│ │ ├── App.js
│ │ ├── index.js
│ │ └── index.css
│ ├── .env
│ └── package.json
├── database.sql
└── README.md
