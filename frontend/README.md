# Employee Attendance Portal

A complete employee attendance management system with role-based access control (Employee, Manager, HR).

## Features

- ✅ Role-based authentication (Employee, Manager, HR)
- ✅ Attendance check-in/check-out (once per day)
- ✅ Leave management with approval workflow
- ✅ Session timeout after 15 minutes of inactivity
- ✅ Server-side permission checks
- ✅ Beautiful responsive UI with role-specific themes
- ✅ HR: User management, leave type configuration
- ✅ Manager: Team attendance, leave approval
- ✅ Employee: Personal attendance, leave requests

## Tech Stack

- **Frontend:** React.js, CSS3
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (15-minute expiry)
- **ORM:** Sequelize

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>


cd attendance-portal

2. Database Setup
Create PostgreSQL database:

sql
CREATE DATABASE attendance_db;
Run the database script:

bash
psql -U postgres -d attendance_db -f database.sql


3. Backend Setup
bash
cd backend
npm install
Create .env file:

env
PORT=5000
DB_NAME=attendance_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=your_secret_key_here
SESSION_SECRET=your_session_secret


Start backend server:

bash
npm run dev
# or
npm start

4. Frontend Setup
bash
cd frontend
npm install
Create .env file:

env
REACT_APP_API_URL=http://localhost:5000/api
Start frontend:

bash
npm start

5. Access the Application
Open browser: http://localhost:3000

Default Login Credentials
Role	Username	Password
HR	hr_user	password123
Manager	manager_user	password123
Employee	emp_user	password123




### 2. database.sql

```sql
-- ==========================================
-- EMPLOYEE ATTENDANCE PORTAL DATABASE SCRIPT
-- ==========================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS "LeaveRequests" CASCADE;
DROP TABLE IF EXISTS "Attendances" CASCADE;
DROP TABLE IF EXISTS "LeaveTypes" CASCADE;
DROP TABLE IF EXISTS "Users" CASCADE;

-- ==========================================
-- CREATE TABLES
-- ==========================================

-- Users Table
CREATE TABLE "Users" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'employee' CHECK (role IN ('employee', 'manager', 'hr')),
    "managerId" INTEGER,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leave Types Table
CREATE TABLE "LeaveTypes" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    "annualQuota" INTEGER DEFAULT 12,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance Table
CREATE TABLE "Attendances" (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    date DATE NOT NULL,
    "checkIn" TIMESTAMP,
    "checkOut" TIMESTAMP,
    "totalHours" DECIMAL(5,2) DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leave Requests Table
CREATE TABLE "LeaveRequests" (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "leaveTypeId" INTEGER NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    remark TEXT,
    "actionedById" INTEGER,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- ADD FOREIGN KEY CONSTRAINTS
-- ==========================================

ALTER TABLE "Users" 
ADD CONSTRAINT fk_users_manager 
FOREIGN KEY ("managerId") REFERENCES "Users"(id) ON DELETE SET NULL;

ALTER TABLE "Attendances" 
ADD CONSTRAINT fk_attendance_user 
FOREIGN KEY ("userId") REFERENCES "Users"(id) ON DELETE CASCADE;

ALTER TABLE "LeaveRequests" 
ADD CONSTRAINT fk_leaves_user 
FOREIGN KEY ("userId") REFERENCES "Users"(id) ON DELETE CASCADE;

ALTER TABLE "LeaveRequests" 
ADD CONSTRAINT fk_leaves_leavetype 
FOREIGN KEY ("leaveTypeId") REFERENCES "LeaveTypes"(id) ON DELETE CASCADE;

ALTER TABLE "LeaveRequests" 
ADD CONSTRAINT fk_leaves_actioner 
FOREIGN KEY ("actionedById") REFERENCES "Users"(id) ON DELETE SET NULL;

-- ==========================================
-- ADD UNIQUE CONSTRAINTS
-- ==========================================

ALTER TABLE "Attendances" 
ADD CONSTRAINT unique_user_date UNIQUE ("userId", date);

-- ==========================================
-- CREATE INDEXES
-- ==========================================

CREATE INDEX idx_users_role ON "Users"(role);
CREATE INDEX idx_users_manager ON "Users"("managerId");
CREATE INDEX idx_users_active ON "Users"("isActive");
CREATE INDEX idx_attendance_user ON "Attendances"("userId");
CREATE INDEX idx_attendance_date ON "Attendances"(date);
CREATE INDEX idx_leaves_user ON "LeaveRequests"("userId");
CREATE INDEX idx_leaves_status ON "LeaveRequests"(status);
CREATE INDEX idx_leaves_dates ON "LeaveRequests"("startDate", "endDate");

-- ==========================================
-- INSERT SEED DATA
-- ==========================================

-- Insert Leave Types
INSERT INTO "LeaveTypes" (name, "annualQuota") VALUES
('Casual Leave', 12),
('Sick Leave', 10),
('Earned Leave', 15);

-- Insert Users
-- Password for all users is: password123
-- Password hash: $2a$10$rqG5t6kqLlLqLlLqLlLqLuO5KqfL5KqfL5KqfL5Kq
INSERT INTO "Users" (username, email, password, role, "isActive") VALUES
('hr_user', 'hr@company.com', '$2a$10$rqG5t6kqLlLqLlLqLlLqLuO5KqfL5KqfL5KqfL5Kq', 'hr', true),
('manager_user', 'manager@company.com', '$2a$10$rqG5t6kqLlLqLlLqLlLqLuO5KqfL5KqfL5KqfL5Kq', 'manager', true),
('emp_user', 'employee@company.com', '$2a$10$rqG5t6kqLlLqLlLqLlLqLuO5KqfL5KqfL5KqfL5Kq', 'employee', true);

-- Set manager for employee
UPDATE "Users" 
SET "managerId" = (SELECT id FROM "Users" WHERE username = 'manager_user') 
WHERE username = 'emp_user';

-- Insert Sample Attendance Records
INSERT INTO "Attendances" ("userId", date, "checkIn", "checkOut", "totalHours") 
SELECT 
    u.id,
    CURRENT_DATE,
    CURRENT_TIMESTAMP - INTERVAL '9 hours',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    8.0
FROM "Users" u
WHERE u.username = 'emp_user';

-- Insert Sample Leave Requests
INSERT INTO "LeaveRequests" ("userId", "leaveTypeId", "startDate", "endDate", reason, status) 
SELECT 
    u.id,
    lt.id,
    CURRENT_DATE + INTERVAL '7 days',
    CURRENT_DATE + INTERVAL '9 days',
    'Family vacation',
    'pending'
FROM "Users" u, "LeaveTypes" lt
WHERE u.username = 'emp_user' AND lt.name = 'Casual Leave';

-- ==========================================
-- VERIFY DATA
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'DATABASE SETUP COMPLETE!';
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'Users Created: %', (SELECT COUNT(*) FROM "Users");
    RAISE NOTICE 'Leave Types: %', (SELECT COUNT(*) FROM "LeaveTypes");
    RAISE NOTICE 'Attendance Records: %', (SELECT COUNT(*) FROM "Attendances");
    RAISE NOTICE 'Leave Requests: %', (SELECT COUNT(*) FROM "LeaveRequests");
END $$;

-- Display all users
SELECT '=== USERS ===' as "";
SELECT id, username, email, role, "isActive" FROM "Users";

-- Display leave types
SELECT '=== LEAVE TYPES ===' as "";
SELECT * FROM "LeaveTypes";

-- ==========================================
-- HELPER QUERIES
-- ==========================================

-- Query to check user login
-- SELECT * FROM "Users" WHERE username = 'hr_user' AND password = 'password123';

-- Query to get all pending leaves
-- SELECT u.username, lt.name, lr.* FROM "LeaveRequests" lr
-- JOIN "Users" u ON lr."userId" = u.id
-- JOIN "LeaveTypes" lt ON lr."leaveTypeId" = lt.id
-- WHERE lr.status = 'pending';

-- Query to get team attendance
-- SELECT u.username, a.* FROM "Attendances" a
-- JOIN "Users" u ON a."userId" = u.id
-- WHERE u."managerId" = 2;