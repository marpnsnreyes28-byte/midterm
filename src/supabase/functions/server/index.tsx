import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-12535d4a/health", (c) => {
  return c.json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "NDKC RFID Attendance System"
  });
});

// Database initialization endpoint
app.post("/make-server-12535d4a/init-database", async (c) => {
  try {
    console.log('🔄 Initializing NDKC RFID database...');
    
    // Create all required tables
    const createTablesSQL = `
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
      CREATE INDEX IF NOT EXISTS idx_schedules_teacher_id ON schedules(teacher_id);
      CREATE INDEX IF NOT EXISTS idx_schedules_classroom_id ON schedules(classroom_id);
      CREATE INDEX IF NOT EXISTS idx_attendance_teacher_id ON attendance_records(teacher_id);
      CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);
      CREATE INDEX IF NOT EXISTS idx_notifications_target ON notifications(target_role, target_teacher_id);

      -- Create updated_at trigger function
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $ language 'plpgsql';

      -- Create triggers for updated_at
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
        FOR EACH ROW EXECUTE FUNCTION update_attendance_records_updated_at_column();

      DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
      CREATE TRIGGER update_notifications_updated_at 
        BEFORE UPDATE ON notifications 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;

    // Execute the SQL
    const { error: tablesError } = await supabase.rpc('exec_sql', { 
      sql: createTablesSQL 
    });

    if (tablesError) {
      // Try direct table creation if RPC fails
      console.log('RPC failed, trying direct table creation...');
      
      const tables = [
        {
          name: 'users',
          query: `
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
          `
        },
        {
          name: 'classrooms',
          query: `
            CREATE TABLE IF NOT EXISTS classrooms (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              name TEXT NOT NULL,
              location TEXT NOT NULL,
              capacity INTEGER,
              is_active BOOLEAN DEFAULT true,
              created_at TIMESTAMPTZ DEFAULT now(),
              updated_at TIMESTAMPTZ DEFAULT now()
            );
          `
        },
        {
          name: 'schedules',
          query: `
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
          `
        },
        {
          name: 'attendance_records',
          query: `
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
          `
        },
        {
          name: 'notifications',
          query: `
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
          `
        }
      ];

      for (const table of tables) {
        const { error } = await supabase.rpc('exec_sql', { sql: table.query });
        if (error) {
          console.error(`Error creating ${table.name} table:`, error);
        } else {
          console.log(`✅ Created ${table.name} table`);
        }
      }
    }

    // Enable Row Level Security
    const enableRLSSQL = `
      ALTER TABLE users ENABLE ROW LEVEL SECURITY;
      ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
      ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
      ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
      ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
    `;

    await supabase.rpc('exec_sql', { sql: enableRLSSQL });

    // Create RLS policies
    const createPoliciesSQL = `
      -- Users policies
      DROP POLICY IF EXISTS "Users can view their own profile" ON users;
      CREATE POLICY "Users can view their own profile" ON users
        FOR SELECT USING (auth.uid()::text = id::text OR EXISTS (
          SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
        ));

      DROP POLICY IF EXISTS "Admins can manage all users" ON users;
      CREATE POLICY "Admins can manage all users" ON users
        FOR ALL USING (EXISTS (
          SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
        ));

      -- Classrooms policies (admin only)
      DROP POLICY IF EXISTS "Only admins can manage classrooms" ON classrooms;
      CREATE POLICY "Only admins can manage classrooms" ON classrooms
        FOR ALL USING (EXISTS (
          SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
        ));

      -- Schedules policies
      DROP POLICY IF EXISTS "Teachers can view their schedules" ON schedules;
      CREATE POLICY "Teachers can view their schedules" ON schedules
        FOR SELECT USING (
          teacher_id::text = auth.uid()::text OR EXISTS (
            SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
          )
        );

      DROP POLICY IF EXISTS "Only admins can manage schedules" ON schedules;
      CREATE POLICY "Only admins can manage schedules" ON schedules
        FOR INSERT WITH CHECK (EXISTS (
          SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
        ));

      -- Attendance records policies
      DROP POLICY IF EXISTS "Teachers can view their attendance" ON attendance_records;
      CREATE POLICY "Teachers can view their attendance" ON attendance_records
        FOR SELECT USING (
          teacher_id::text = auth.uid()::text OR EXISTS (
            SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
          )
        );

      DROP POLICY IF EXISTS "System can insert attendance records" ON attendance_records;
      CREATE POLICY "System can insert attendance records" ON attendance_records
        FOR INSERT WITH CHECK (true);

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
        FOR ALL USING (EXISTS (
          SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
        ));
    `;

    await supabase.rpc('exec_sql', { sql: createPoliciesSQL });

    console.log('✅ Database initialization completed successfully');
    
    return c.json({
      success: true,
      message: "NDKC RFID database initialized successfully",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return c.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// RFID tap-in endpoint
app.post("/make-server-12535d4a/rfid/tap-in", async (c) => {
  try {
    const { rfidId, classroomId } = await c.req.json();
    
    if (!rfidId || !classroomId) {
      return c.json({ success: false, error: "RFID ID and classroom ID required" }, 400);
    }

    // Find teacher by RFID
    const { data: teacher, error: teacherError } = await supabase
      .from('users')
      .select('*')
      .eq('rfid_id', rfidId)
      .eq('role', 'teacher')
      .eq('is_active', true)
      .single();

    if (teacherError || !teacher) {
      return c.json({ success: false, error: "Invalid RFID or teacher not found" }, 404);
    }

    // Check if teacher has a schedule for this classroom today
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = new Date().toTimeString().slice(0, 5); // HH:MM format

    const { data: schedule, error: scheduleError } = await supabase
      .from('schedules')
      .select('*')
      .eq('teacher_id', teacher.id)
      .eq('classroom_id', classroomId)
      .eq('day', currentDay)
      .eq('is_active', true)
      .gte('end_time', currentTime)
      .single();

    if (scheduleError && scheduleError.code !== 'PGRST116') {
      console.error('Schedule lookup error:', scheduleError);
    }

    // Check for existing attendance record today
    const { data: existingRecord } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('teacher_id', teacher.id)
      .eq('date', today)
      .is('tap_out_time', null)
      .single();

    if (existingRecord) {
      return c.json({ success: false, error: "Already tapped in today" }, 400);
    }

    // Create attendance record
    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance_records')
      .insert({
        teacher_id: teacher.id,
        classroom_id: classroomId,
        date: today,
        tap_in_time: new Date().toISOString(),
        subject: schedule?.subject || 'Unknown'
      })
      .select()
      .single();

    if (attendanceError) {
      console.error('Attendance creation error:', attendanceError);
      return c.json({ success: false, error: "Failed to create attendance record" }, 500);
    }

    return c.json({
      success: true,
      message: `Welcome ${teacher.name}!`,
      teacher: teacher.name,
      time: new Date().toLocaleTimeString(),
      subject: schedule?.subject || 'Unknown',
      recordId: attendance.id
    });

  } catch (error) {
    console.error('Tap-in error:', error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// RFID tap-out endpoint
app.post("/make-server-12535d4a/rfid/tap-out", async (c) => {
  try {
    const { rfidId } = await c.req.json();
    
    if (!rfidId) {
      return c.json({ success: false, error: "RFID ID required" }, 400);
    }

    // Find teacher by RFID
    const { data: teacher, error: teacherError } = await supabase
      .from('users')
      .select('*')
      .eq('rfid_id', rfidId)
      .eq('role', 'teacher')
      .eq('is_active', true)
      .single();

    if (teacherError || !teacher) {
      return c.json({ success: false, error: "Invalid RFID or teacher not found" }, 404);
    }

    // Find today's attendance record without tap-out
    const today = new Date().toLocaleDateString('en-CA');
    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('teacher_id', teacher.id)
      .eq('date', today)
      .is('tap_out_time', null)
      .single();

    if (attendanceError || !attendance) {
      return c.json({ success: false, error: "No active session found for today" }, 404);
    }

    // Calculate duration
    const tapOutTime = new Date();
    const tapInTime = new Date(attendance.tap_in_time);
    const durationMinutes = Math.round((tapOutTime.getTime() - tapInTime.getTime()) / (1000 * 60));

    // Update attendance record
    const { error: updateError } = await supabase
      .from('attendance_records')
      .update({
        tap_out_time: tapOutTime.toISOString(),
        duration_minutes: durationMinutes
      })
      .eq('id', attendance.id);

    if (updateError) {
      console.error('Attendance update error:', updateError);
      return c.json({ success: false, error: "Failed to update attendance record" }, 500);
    }

    return c.json({
      success: true,
      message: `Goodbye ${teacher.name}!`,
      teacher: teacher.name,
      duration: `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`,
      time: tapOutTime.toLocaleTimeString()
    });

  } catch (error) {
    console.error('Tap-out error:', error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

Deno.serve(app.fetch);