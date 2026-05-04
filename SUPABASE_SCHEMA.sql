-- ============================================
-- UniManage Database Schema
-- Run this SQL in your Supabase project
-- ============================================

-- ============================================
-- 1. USERS TABLE (Authentication)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'doctor', 'ta', 'student')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- 2. STAFF TABLE (Directory Management)
-- ============================================
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('Professor', 'TA', 'Admin')),
  office_location VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_staff_email ON staff(email);
CREATE INDEX idx_staff_user_id ON staff(user_id);

-- ============================================
-- 3. STUDENTS TABLE (Student Records)
-- ============================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  major VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_user_id ON students(user_id);

-- ============================================
-- 4. SUBJECTS TABLE (Course Profile Creator)
-- ============================================
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  credits INT NOT NULL CHECK (credits >= 1 AND credits <= 6),
  description TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('Core', 'Elective')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subjects_code ON subjects(code);
CREATE INDEX idx_subjects_type ON subjects(type);
CREATE INDEX idx_subjects_created_by ON subjects(created_by);

-- ============================================
-- 5. ENROLLMENTS TABLE (Course Enrollment)
-- ============================================
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  enrolled_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, subject_id)
);

CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX idx_enrollments_subject_id ON enrollments(subject_id);

-- ============================================
-- 6. GRADES TABLE (Grade Dashboard)
-- ============================================
CREATE TABLE IF NOT EXISTS grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  score INT NOT NULL CHECK (score >= 0 AND score <= 100),
  feedback TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, subject_id)
);

CREATE INDEX idx_grades_student_id ON grades(student_id);
CREATE INDEX idx_grades_subject_id ON grades(subject_id);

-- ============================================
-- 7. ANNOUNCEMENTS TABLE (Post Announcements)
-- ============================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_announcements_created_by ON announcements(created_by);
CREATE INDEX idx_announcements_created_at ON announcements(created_at DESC);

-- ============================================
-- 8. ROOMS TABLE (Room Booking)
-- ============================================
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  capacity INT NOT NULL CHECK (capacity > 0),
  type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rooms_type ON rooms(type);

-- ============================================
-- 9. ROOM_BOOKINGS TABLE (Room Bookings)
-- ============================================
CREATE TABLE IF NOT EXISTS room_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  booked_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(room_id, booking_date, start_time)
);

CREATE INDEX idx_room_bookings_room_id ON room_bookings(room_id);
CREATE INDEX idx_room_bookings_booked_by ON room_bookings(booked_by);
CREATE INDEX idx_room_bookings_booking_date ON room_bookings(booking_date);

-- ============================================
-- Enable RLS (Row Level Security)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_bookings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies
-- ============================================

-- Users can only see their own profile
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Staff can be viewed by all (for directory)
CREATE POLICY "Staff is publicly viewable" ON staff
  FOR SELECT USING (true);

-- Students can be viewed by admins only
CREATE POLICY "Students visible to admins" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Subjects are publicly viewable
CREATE POLICY "Subjects are publicly viewable" ON subjects
  FOR SELECT USING (true);

-- Enrollments visible to student and admins
CREATE POLICY "Enrollments visible to student and admin" ON enrollments
  FOR SELECT USING (
    student_id = (SELECT id FROM students WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Grades visible only to student and faculty/admin
CREATE POLICY "Grades visible to student and admin" ON grades
  FOR SELECT USING (
    student_id = (SELECT id FROM students WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'ta'))
  );

-- Announcements are public
CREATE POLICY "Announcements are public" ON announcements
  FOR SELECT USING (true);

-- Rooms are public
CREATE POLICY "Rooms are public" ON rooms
  FOR SELECT USING (true);

-- Room bookings visible to booker and admins
CREATE POLICY "Room bookings visible to booker and admin" ON room_bookings
  FOR SELECT USING (
    booked_by = auth.uid()
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- Insert Demo Data (Optional)
-- ============================================

-- Demo Admin User
INSERT INTO users (email, password_hash, full_name, role) 
VALUES ('admin@university.edu', 'hashed_password_123', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Demo Doctor User
INSERT INTO users (email, password_hash, full_name, role) 
VALUES ('doctor@university.edu', 'hashed_password_123', 'Dr. John Smith', 'doctor')
ON CONFLICT (email) DO NOTHING;

-- Demo Student User
INSERT INTO users (email, password_hash, full_name, role) 
VALUES ('student@university.edu', 'hashed_password_123', 'Jane Doe', 'student')
ON CONFLICT (email) DO NOTHING;
