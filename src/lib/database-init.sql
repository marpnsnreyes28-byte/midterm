-- Notre Dame of Kidapawan College RFID Attendance System
-- Database Initialization Script

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'teacher')) NOT NULL,
  name TEXT NOT NULL,
  department TEXT CHECK (department IN ('CBA', 'CTE', 'CECE')),
  rfid_id TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create classrooms table
CREATE TABLE IF NOT EXISTS classrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  capacity INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  day TEXT CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  tap_in_time TIMESTAMPTZ NOT NULL,
  tap_out_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  subject TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'warning', 'success', 'error')) NOT NULL,
  target_role TEXT CHECK (target_role IN ('admin', 'teacher')),
  target_teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_rfid_id ON users(rfid_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_schedules_teacher_id ON schedules(teacher_id);
CREATE INDEX IF NOT EXISTS idx_schedules_classroom_id ON schedules(classroom_id);
CREATE INDEX IF NOT EXISTS idx_schedules_day ON schedules(day);
CREATE INDEX IF NOT EXISTS idx_attendance_teacher_id ON attendance_records(teacher_id);
CREATE INDEX IF NOT EXISTS idx_attendance_classroom_id ON attendance_records(classroom_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_notifications_target ON notifications(target_role, target_teacher_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_classrooms_updated_at ON classrooms;
CREATE TRIGGER update_classrooms_updated_at 
  BEFORE UPDATE ON classrooms 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_schedules_updated_at ON schedules;
CREATE TRIGGER update_schedules_updated_at 
  BEFORE UPDATE ON schedules 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_attendance_records_updated_at ON attendance_records;
CREATE TRIGGER update_attendance_records_updated_at 
  BEFORE UPDATE ON attendance_records 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at 
  BEFORE UPDATE ON notifications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create Row Level Security Policies

-- Users policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (
    auth.uid()::text = id::text OR 
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can manage all users" ON users;
CREATE POLICY "Admins can manage all users" ON users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (
    auth.uid()::text = id::text OR 
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

-- Classrooms policies (admin only)
DROP POLICY IF EXISTS "Admins can view all classrooms" ON classrooms;
CREATE POLICY "Admins can view all classrooms" ON classrooms
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can manage classrooms" ON classrooms;
CREATE POLICY "Admins can manage classrooms" ON classrooms
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

-- Schedules policies
DROP POLICY IF EXISTS "Teachers can view their schedules" ON schedules;
CREATE POLICY "Teachers can view their schedules" ON schedules
  FOR SELECT USING (
    teacher_id::text = auth.uid()::text OR 
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can manage schedules" ON schedules;
CREATE POLICY "Admins can manage schedules" ON schedules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

-- Attendance records policies
DROP POLICY IF EXISTS "Teachers can view their attendance" ON attendance_records;
CREATE POLICY "Teachers can view their attendance" ON attendance_records
  FOR SELECT USING (
    teacher_id::text = auth.uid()::text OR 
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

DROP POLICY IF EXISTS "System can insert attendance records" ON attendance_records;
CREATE POLICY "System can insert attendance records" ON attendance_records
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage attendance records" ON attendance_records;
CREATE POLICY "Admins can manage attendance records" ON attendance_records
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

-- Notifications policies
DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (
    (target_role = 'admin' AND EXISTS (
      SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
    )) OR
    (target_role = 'teacher' AND target_teacher_id::text = auth.uid()::text) OR
    target_role IS NULL
  );

DROP POLICY IF EXISTS "Admins can manage notifications" ON notifications;
CREATE POLICY "Admins can manage notifications" ON notifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

DROP POLICY IF EXISTS "Teachers can update their notifications" ON notifications;
CREATE POLICY "Teachers can update their notifications" ON notifications
  FOR UPDATE USING (
    target_teacher_id::text = auth.uid()::text
  );

-- Sample data for testing (optional)
-- This will only insert if the tables are empty

DO $$
BEGIN
  -- Insert sample classrooms if none exist
  IF NOT EXISTS (SELECT 1 FROM classrooms LIMIT 1) THEN
    INSERT INTO classrooms (name, location, capacity) VALUES
      ('CBA-101', 'College of Business Administration Building, Ground Floor', 40),
      ('CBA-102', 'College of Business Administration Building, Ground Floor', 35),
      ('CTE-201', 'College of Teacher Education Building, Second Floor', 45),
      ('CTE-202', 'College of Teacher Education Building, Second Floor', 40),
      ('CECE-301', 'College of Engineering and Computer Education Building, Third Floor', 50),
      ('CECE-302', 'College of Engineering and Computer Education Building, Third Floor', 45),
      ('LAB-001', 'Computer Laboratory 1', 30),
      ('LAB-002', 'Computer Laboratory 2', 30);
    
    RAISE NOTICE 'Sample classrooms inserted';
  END IF;
END
$$;

-- Functions for database management

-- Function to check database health
CREATE OR REPLACE FUNCTION check_database_health()
RETURNS JSON AS $$
DECLARE
  result JSON;
  user_count INTEGER;
  classroom_count INTEGER;
  schedule_count INTEGER;
  attendance_count INTEGER;
  notification_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM users;
  SELECT COUNT(*) INTO classroom_count FROM classrooms;
  SELECT COUNT(*) INTO schedule_count FROM schedules;
  SELECT COUNT(*) INTO attendance_count FROM attendance_records;
  SELECT COUNT(*) INTO notification_count FROM notifications;
  
  result := json_build_object(
    'status', 'healthy',
    'timestamp', now(),
    'tables', json_build_object(
      'users', user_count,
      'classrooms', classroom_count,
      'schedules', schedule_count,
      'attendance_records', attendance_count,
      'notifications', notification_count
    )
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean old notifications (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notifications 
  WHERE created_at < (now() - INTERVAL '30 days')
    AND is_read = true;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;