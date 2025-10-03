'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, initializeDatabase, tapInRFID, tapOutRFID, createTeacherServer } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { 
  User as AppUser, 
  Classroom, 
  Schedule, 
  AttendanceRecord, 
  Notification,
  UserInsert,
  ClassroomInsert,
  ScheduleInsert,
  NotificationInsert
} from '../lib/database.types';
import { toast } from 'sonner';
import { isSupabaseConfigured } from '../lib/config';

// Interface for our app-specific user (extends Supabase User)
export interface Teacher extends AppUser {
  firstName: string;
  lastName: string;
}

// Input model for creating a new teacher from the Admin UI
export type NewTeacherInput = {
  firstName: string;
  lastName: string;
  email: string;
  department: 'CBA' | 'CTE' | 'CECE';
  rfidId: string;
  isActive: boolean;
  // Optional: admin can provide a password when creating a teacher. If omitted, a temporary password is generated.
  password?: string | null;
};

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  teachers: Teacher[];
  classrooms: Classroom[];
  schedules: Schedule[];
  attendanceRecords: AttendanceRecord[];
  notifications: Notification[];
  isLoading: boolean;
  adminExists: boolean;
  hasSupabaseConnection: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  registerAdmin: (email: string, password: string, name: string) => Promise<boolean>;
  addTeacher: (teacherData: NewTeacherInput) => Promise<string>;
  updateTeacher: (id: string, teacherData: Partial<Teacher>) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  addClassroom: (classroomData: Omit<Classroom, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateClassroom: (id: string, classroomData: Partial<Classroom>) => Promise<void>;
  deleteClassroom: (id: string) => Promise<void>;
  addSchedule: (scheduleData: Omit<Schedule, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSchedule: (id: string, scheduleData: Partial<Schedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  sendNotification: (notificationData: Omit<Notification, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  tapIn: (rfidId: string, classroomId: string) => Promise<boolean>;
  tapOut: (rfidId: string) => Promise<boolean>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start with true, but quickly resolve
  const [adminExists, setAdminExists] = useState(false);
  const [hasSupabaseConnection, setHasSupabaseConnection] = useState(false);

  // Temporary helper: cast Supabase client to any for complex PostgREST operations
  const sb: any = supabase;

  // Initialize Supabase connection and auth
  useEffect(() => {
    const initializeAuth = async () => {
      let loadingTimeout: ReturnType<typeof setTimeout> | undefined;
      try {
        console.log('🚀 Initializing auth system...');
        
        // Ensure app is not blocked by loading state
        loadingTimeout = setTimeout(() => {
          setIsLoading(false);
          console.log('⏰ Loading timeout - ensuring app continues...');
        }, 8000); // Increased to 8 seconds to allow for connection attempts
        
        // Check if credentials are configured
        if (!isSupabaseConfigured()) {
          console.log('⚠️ Supabase credentials not configured - running in demo mode');
          setHasSupabaseConnection(false);
          setAdminExists(false); // Allow setup to proceed
          if (loadingTimeout) clearTimeout(loadingTimeout);
          setIsLoading(false);
          return;
        }
        
        // Test Supabase connection with shorter timeout
        try {
          console.log('🔍 Testing Supabase connection...');
          
          // First, test basic connectivity
          const connectionPromise = sb.from('users').select('count', { count: 'exact', head: true });
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout after 5 seconds')), 5000)
          );
          
          const result = await Promise.race([connectionPromise, timeoutPromise]) as any;
          const { data, error } = result;
          
          // Handle different types of database errors
          if (error) {
            if (error.code === 'PGRST116') {
              console.log('📋 Tables not found - this is expected before initialization');
            } else if (error.code === '42P17') {
              console.warn('⚠️ Database RLS policy recursion detected - continuing with limited functionality');
              toast.error('Database policy issue detected. Please run the RLS fix script.', {
                duration: 6000,
              });
            } else {
              console.warn('⚠️ Database connection issue:', {
                code: error.code,
                message: error.message || 'Unknown database error',
                details: error.details,
                hint: error.hint
              });
            }
          }
          
          setHasSupabaseConnection(true);
          console.log('✅ Supabase connection established');

          // Try to initialize database tables (with error handling)
          try {
            console.log('🔄 Attempting database initialization...');
            await initializeDatabase();
            console.log('✅ Database initialization completed');
          } catch (initError: any) {
            console.warn('⚠️ Database initialization failed (Edge Functions may not be deployed):', initError?.message || initError);
            // Continue anyway - tables might exist already
          }

          // Get initial session (with error handling)
          try {
            const { data: { session: initialSession } } = await sb.auth.getSession();
            setSession(initialSession);

            if (initialSession?.user) {
              await loadUserProfile(initialSession.user);
            }
          } catch (sessionError: any) {
            console.warn('⚠️ Session loading failed:', sessionError?.message || sessionError);
          }

          // Check if admin exists (with error handling)
          try {
            await checkAdminExists();
          } catch (adminError: any) {
            console.warn('⚠️ Admin check failed (tables may not exist yet):', adminError.message);
            if (adminError.code === '42P17') {
              console.warn('RLS recursion in admin check - proceeding with setup allowed');
            }
            setAdminExists(false); // Default to allowing setup
          }

          // Load initial data (with error handling)
          try {
            await loadAppData();
          } catch (dataError: any) {
            console.warn('⚠️ Initial data loading failed:', dataError.message);
            if (dataError.code === '42P17') {
              console.warn('RLS recursion in data loading - continuing with empty data');
            }
            // Continue anyway - app can function with empty data
          }

          // Listen for auth state changes
          const { data: { subscription } } = sb.auth.onAuthStateChange(async (event: string, session: Session | null) => {
            console.log('Auth state changed:', event, session?.user?.email);
            setSession(session as Session | null);
            
            if (session?.user) {
              await loadUserProfile(session.user);
              await loadAppData();
            } else {
              setUser(null);
              clearData();
            }
          });

          // Set up real-time subscriptions
          setupRealtimeSubscriptions();

          // Clear loading state on successful connection
          if (loadingTimeout) clearTimeout(loadingTimeout);
          setIsLoading(false);

          return () => {
            subscription.unsubscribe();
          };
        } catch (connectionError) {
          console.error('Supabase connection failed:', connectionError);
          setHasSupabaseConnection(false);
          setAdminExists(false); // Allow setup to proceed in demo mode
          if (loadingTimeout) clearTimeout(loadingTimeout);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setHasSupabaseConnection(false);
        setAdminExists(false); // Allow setup to proceed
        if (loadingTimeout) clearTimeout(loadingTimeout);
        setIsLoading(false);
      } finally {
        // Ensure loading state is always cleared
        if (loadingTimeout) clearTimeout(loadingTimeout);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const loadUserProfile = async (supabaseUser: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        
        // Handle RLS policy infinite recursion
        if (error.code === '42P17') {
          console.warn('RLS policy infinite recursion detected - using fallback profile');
          // Create a fallback profile based on auth metadata
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            role: 'admin', // Assume admin for first user
            name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
            department: undefined,
            rfid_id: undefined,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          return;
        }
        return;
      }

      const profileData = profile as AppUser | null;
      if (profileData) {
        setUser({
          id: profileData.id,
          email: profileData.email,
          role: profileData.role,
          name: profileData.name,
          department: profileData.department ?? undefined,
          rfid_id: profileData.rfid_id ?? undefined,
          is_active: profileData.is_active,
          created_at: profileData.created_at,
          updated_at: profileData.updated_at
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const checkAdminExists = async () => {
    try {
      const { count, error } = await sb
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin')
        .eq('is_active', true);

      if (error) {
        console.warn('Error checking admin existence:', error.message);
        
        // Handle RLS policy infinite recursion
        if (error.code === '42P17') {
          console.warn('RLS policy infinite recursion in admin check - defaulting to false');
          setAdminExists(false);
          return;
        }
        
        // For other errors, assume no admin exists to allow setup
        setAdminExists(false);
        return;
      }

      setAdminExists((count || 0) > 0);
    } catch (error) {
      console.error('Error checking admin existence:', error);
      setAdminExists(false);
    }
  };

  const loadAppData = async () => {
    try {
      console.log('Loading app data from Supabase... (triggered at', new Date().toISOString(), ')');
      console.trace('loadAppData call stack');

      // Load teachers with better error handling for RLS issues
      const { data: teachersData, error: teachersError } = await sb
        .from('users')
        .select('*')
        .eq('role', 'teacher')
        .eq('is_active', true)
        .order('name');

      if (teachersError) {
        console.warn('Teachers loading error (possibly RLS):', teachersError.message);
        if (teachersError.code === '42P17') {
          // Infinite recursion in RLS policy - use fallback
          setTeachers([]);
        } else {
          throw teachersError;
        }
      } else {

        const teachersArray = (teachersData || []) as AppUser[];
        const teachersWithNames = teachersArray.map(teacher => ({
          ...teacher,
          firstName: teacher.name.split(' ')[0] || '',
          lastName: teacher.name.split(' ').slice(1).join(' ') || ''
        }));
        setTeachers(teachersWithNames);
      }

      // Load classrooms with error handling
      const { data: classroomsData, error: classroomsError } = await sb
        .from('classrooms')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (classroomsError) {
        console.warn('Classrooms loading error:', classroomsError.message);
        if (classroomsError.code === '42P17') {
          setClassrooms([]);
        } else {
          throw classroomsError;
        }
      } else {
        setClassrooms(classroomsData || []);
      }

      // Load schedules with error handling
      const { data: schedulesData, error: schedulesError } = await sb
        .from('schedules')
        .select('*')
        .eq('is_active', true)
        .order('day, start_time');

      if (schedulesError) {
        console.warn('Schedules loading error:', schedulesError.message);
        if (schedulesError.code === '42P17') {
          setSchedules([]);
        } else {
          throw schedulesError;
        }
      } else {
        setSchedules(schedulesData || []);
      }

      // Load attendance records (last 30 days) with error handling
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: attendanceData, error: attendanceError } = await sb
        .from('attendance_records')
        .select('*')
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('created_at', { ascending: false });

      if (attendanceError) {
        console.warn('Attendance loading error:', attendanceError.message);
        if (attendanceError.code === '42P17') {
          setAttendanceRecords([]);
        } else {
          throw attendanceError;
        }
      } else {
        setAttendanceRecords(attendanceData || []);
      }

      // Load notifications (last 30 days) with error handling
      const { data: notificationsData, error: notificationsError } = await sb
        .from('notifications')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (notificationsError) {
        console.warn('Notifications loading error:', notificationsError.message);
        if (notificationsError.code === '42P17') {
          setNotifications([]);
        } else {
          throw notificationsError;
        }
      } else {
        setNotifications(notificationsData || []);
      }

      console.log('App data loaded successfully at', new Date().toISOString());
    } catch (error: any) {
      console.error('Error loading app data:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      if (error.code === '42P17') {
        console.warn('RLS policy recursion detected - running with empty data sets');
        // Don't show error toast for RLS issues, just log and continue
        // This allows the app to function with empty data while RLS is being fixed
      } else if (error.code === 'PGRST116') {
        console.log('Tables not found - this is expected before database setup');
      } else {
        toast.error('Some data may not load properly. Check database connection.', {
          duration: 3000,
        });
      }
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Helper: avoid reloading app data while a modal/dialog is open (typing can be interrupted)
    // Instead of firing timers while the dialog is open (which can interrupt typing),
    // set a pendingReload flag and observe dialog open/close. When dialogs close,
    // perform the reload once.
    let pendingReload = false;
    const anyDialogOpen = () => {
      try {
        // Consider a dialog open if there is an open dialog-content or if focus is inside a dialog input
        const openDialog = !!document.querySelector('[data-slot="dialog-content"][data-state="open"]');
        const active = document.activeElement as HTMLElement | null;
        const focusInsideDialog = !!active && !!active.closest && !!active.closest('[data-slot="dialog-content"]');
        return openDialog || focusInsideDialog;
      } catch (e) {
        return false;
      }
    };

    // Observer watches body subtree for dialog open/close state changes
    // Temporarily disabled to fix dialog button disappearing issue
    /*
    const mo = new MutationObserver(() => {
      try {
        const open = anyDialogOpen();
        if (!open && pendingReload) {
          pendingReload = false;
          console.log('Realtime: dialog closed — executing pending loadAppData');
          loadAppData();
        }
      } catch (e) {
        // ignore
      }
    });
    try {
      mo.observe(document.body, { subtree: true, attributes: true, childList: true, attributeFilter: ['data-state'] });
    } catch (e) {
      // ignore (server rendering)
    }
    */

    const queueReload = () => {
      if (!anyDialogOpen()) {
        console.log('Realtime: invoking loadAppData immediately');
        loadAppData();
        return;
      }

      console.log('Realtime: dialog open — marking pendingReload and waiting for close');
      pendingReload = true;
    };

    // Temporarily disabled real-time subscriptions to fix dialog button disappearing issue
    /*
    // Subscribe to users table changes
    sb
      .channel('users_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users' },
        () => queueReload()
      )
      .subscribe();

    // Subscribe to other table changes
    ['classrooms', 'schedules', 'attendance_records', 'notifications'].forEach(table => {
      sb
        .channel(`${table}_changes`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table },
          () => queueReload()
        )
        .subscribe();
    });
    */

    // No return cleanup here; AuthProvider is mounted for app lifetime. If you need
    // to cleanup, consider returning an unsubscribe function from setupRealtimeSubscriptions
  };

  const clearData = () => {
    setTeachers([]);
    setClassrooms([]);
    setSchedules([]);
    setAttendanceRecords([]);
    setNotifications([]);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Convert NDKC emails to the format used in auth for demo purposes
      let processedEmail = email;
      if (email.includes('@ndkc.edu.ph')) {
        processedEmail = email.replace('@ndkc.edu.ph', '@example.com');
        console.log('Demo mode: Converting NDKC email for login');
      }
      
  const { data, error } = await sb.auth.signInWithPassword({
        email: processedEmail,
        password
      });

      if (error) {
        console.error('Login error:', error);
        toast.error(error.message);
        return false;
      }

      if (data.user) {
        toast.success('Login successful');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
  const { error } = await sb.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        toast.error('Logout failed');
      } else {
        setUser(null);
        clearData();
        toast.success('Logged out successfully');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const registerAdmin = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // Validate email format before sending to Supabase
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('Please enter a valid email address.');
        return false;
      }

      // For demo purposes, convert NDKC emails to a more standard format
      let processedEmail = email;
      if (email.includes('@ndkc.edu.ph')) {
        // Use a more standard domain for testing
        processedEmail = email.replace('@ndkc.edu.ph', '@example.com');
        console.log('Demo mode: Converting NDKC email to standard format for testing');
      }

      // First create the auth user with email confirmation bypassed for admin
  const { data: authData, error: authError } = await sb.auth.signUp({
        email: processedEmail,
        password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation
          data: {
            role: 'admin',
            name: name,
            original_email: email // Store original NDKC email
          }
        }
      });

      if (authError) {
        console.error('Auth registration error:', authError);
        // Handle specific email validation errors
        if (authError.message.includes('invalid') || authError.message.includes('Invalid email')) {
          toast.error('Email format issue. Please try a different email address for initial setup.');
        } else if (authError.message.includes('already registered')) {
          toast.error('An account with this email already exists.');
        } else {
          toast.error(authError.message || 'Registration failed');
        }
        return false;
      }

      if (!authData.user) {
        toast.error('Failed to create user');
        return false;
      }

      // Ensure we have an authenticated session before inserting the profile
      // Some projects require email confirmation which results in no session on signUp
      // Attempt to sign in immediately if session is missing
      if (!authData.session) {
  const { error: signInError } = await sb.auth.signInWithPassword({
          email: processedEmail,
          password
        });
        if (signInError) {
          console.error('Auto sign-in after signup failed:', signInError);
          if (signInError.message && signInError.message.toLowerCase().includes('email not confirmed')) {
            toast.error('Email confirmation is required by your Supabase settings. Either confirm the email sent to the user or disable "Confirm email" under Authentication > Providers (Email) for testing.');
          } else {
            toast.error(signInError.message || 'Auto sign-in failed after registration');
          }
          return false;
        }
      }

      // Then create the user profile (use original email for profile)
      const { error: profileError } = await sb
        .from('users')
        .insert([{ 
          id: authData.user.id,
          email: email, // Use original NDKC email for profile
          role: 'admin' as const,
          name,
          is_active: true
        }]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        toast.error(profileError.message || 'Failed to create admin profile');
        return false;
      }

      await checkAdminExists();
      toast.success('Admin registered successfully');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed');
      return false;
    }
  };

  const addTeacher = async (teacherData: NewTeacherInput): Promise<string> => {
    try {
      // Use provided password if set; otherwise generate a temporary one
      const generated = `ndkc${Math.random().toString(36).substring(2, 8)}`;
      const tempPassword = teacherData.password && teacherData.password.length > 0 ? teacherData.password : generated;
      const fullName = `${teacherData.firstName} ${teacherData.lastName}`.trim();
      
      // Create via server (service role)
      const serverResult = await createTeacherServer({
        email: teacherData.email,
        password: tempPassword,
        name: fullName,
        department: teacherData.department,
        rfidId: teacherData.rfidId,
        isActive: teacherData.isActive
      });
      if (!serverResult?.success) {
        throw new Error(serverResult?.error || 'Server failed to create teacher');
      }

      await loadAppData();
      toast.success(`Teacher added successfully. Temporary password: ${tempPassword}`);
      return tempPassword;
    } catch (error: any) {
      console.error('Error adding teacher:', error);
      toast.error(error.message || 'Failed to add teacher');
      throw error;
    }
  };

  const updateTeacher = async (id: string, teacherData: Partial<Teacher>): Promise<void> => {
    try {
      const { error } = await sb
        .from('users')
        .update({
          name: teacherData.name,
          department: teacherData.department,
          rfid_id: teacherData.rfid_id,
          is_active: teacherData.is_active
        })
        .eq('id', id);

      if (error) throw error;

      await loadAppData();
      toast.success('Teacher updated successfully');
    } catch (error: any) {
      console.error('Error updating teacher:', error);
      toast.error(error.message || 'Failed to update teacher');
      throw error;
    }
  };

  const deleteTeacher = async (id: string): Promise<void> => {
    try {
      const { error } = await sb
        .from('users')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      await loadAppData();
      toast.success('Teacher deactivated successfully');
    } catch (error: any) {
      console.error('Error deleting teacher:', error);
      toast.error(error.message || 'Failed to delete teacher');
      throw error;
    }
  };

  const addClassroom = async (classroomData: Omit<Classroom, 'id' | 'created_at' | 'updated_at'>): Promise<void> => {
    try {
      const { error } = await sb
        .from('classrooms')
        .insert([classroomData]);

      if (error) throw error;

      await loadAppData();
      toast.success('Classroom added successfully');
    } catch (error: any) {
      console.error('Error adding classroom:', error);
      toast.error(error.message || 'Failed to add classroom');
      throw error;
    }
  };

  const updateClassroom = async (id: string, classroomData: Partial<Classroom>): Promise<void> => {
    try {
      const { error } = await sb
        .from('classrooms')
        .update(classroomData)
        .eq('id', id);

      if (error) throw error;

      await loadAppData();
      toast.success('Classroom updated successfully');
    } catch (error: any) {
      console.error('Error updating classroom:', error);
      toast.error(error.message || 'Failed to update classroom');
      throw error;
    }
  };

  const deleteClassroom = async (id: string): Promise<void> => {
    try {
      const { error } = await sb
        .from('classrooms')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      await loadAppData();
      toast.success('Classroom deactivated successfully');
    } catch (error: any) {
      console.error('Error deleting classroom:', error);
      toast.error(error.message || 'Failed to delete classroom');
      throw error;
    }
  };

  const addSchedule = async (scheduleData: Omit<Schedule, 'id' | 'created_at' | 'updated_at'>): Promise<void> => {
    try {
      const { error } = await sb
        .from('schedules')
        .insert([scheduleData]);

      if (error) throw error;

      await loadAppData();
      toast.success('Schedule added successfully');
    } catch (error: any) {
      console.error('Error adding schedule:', error);
      toast.error(error.message || 'Failed to add schedule');
      throw error;
    }
  };

  const updateSchedule = async (id: string, scheduleData: Partial<Schedule>): Promise<void> => {
    try {
      const { error } = await sb
        .from('schedules')
        .update(scheduleData)
        .eq('id', id);

      if (error) throw error;

      await loadAppData();
      toast.success('Schedule updated successfully');
    } catch (error: any) {
      console.error('Error updating schedule:', error);
      toast.error(error.message || 'Failed to update schedule');
      throw error;
    }
  };

  const deleteSchedule = async (id: string): Promise<void> => {
    try {
      const { error } = await sb
        .from('schedules')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      await loadAppData();
      toast.success('Schedule deactivated successfully');
    } catch (error: any) {
      console.error('Error deleting schedule:', error);
      toast.error(error.message || 'Failed to delete schedule');
      throw error;
    }
  };

  const sendNotification = async (notificationData: Omit<Notification, 'id' | 'created_at' | 'updated_at'>): Promise<void> => {
    try {
      const { error } = await sb
        .from('notifications')
        .insert([notificationData]);

      if (error) throw error;

      await loadAppData();
      toast.success('Notification sent successfully');
    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast.error(error.message || 'Failed to send notification');
      throw error;
    }
  };

  const tapIn = async (rfidId: string, classroomId: string): Promise<boolean> => {
    try {
      if (!hasSupabaseConnection) {
        // Demo mode - simulate success
        console.log('🎭 Demo mode: RFID tap-in simulated');
        return true;
      }

      // Use server endpoint for real RFID processing
      const result = await tapInRFID(rfidId, classroomId);
      
      if (result.success) {
        await loadAppData(); // Refresh data
        toast.success(result.message || 'Tap-in successful');
        return true;
      } else {
        toast.error(result.error || 'Tap-in failed');
        return false;
      }
    } catch (error) {
      console.error('Error during tap in:', error);
      toast.error('RFID tap-in failed');
      return false;
    }
  };

  const tapOut = async (rfidId: string): Promise<boolean> => {
    try {
      if (!hasSupabaseConnection) {
        // Demo mode - simulate success
        console.log('🎭 Demo mode: RFID tap-out simulated');
        return true;
      }

      // Use server endpoint for real RFID processing
      const result = await tapOutRFID(rfidId);
      
      if (result.success) {
        await loadAppData(); // Refresh data
        toast.success(result.message || 'Tap-out successful');
        return true;
      } else {
        toast.error(result.error || 'Tap-out failed');
        return false;
      }
    } catch (error) {
      console.error('Error during tap out:', error);
      toast.error('RFID tap-out failed');
      return false;
    }
  };

  const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    try {
      const { error } = await sb
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      await loadAppData();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const refreshData = async (): Promise<void> => {
    await loadAppData();
  };

  // (Note) addTeacher now returns a Promise<string> with the temporary password
  const value: AuthContextType = {
    user,
    session,
    teachers,
    classrooms,
    schedules,
    attendanceRecords,
    notifications,
    isLoading,
    adminExists,
    hasSupabaseConnection,
    login,
    logout,
    registerAdmin,
  addTeacher,
    updateTeacher,
    deleteTeacher,
    addClassroom,
    updateClassroom,
    deleteClassroom,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    sendNotification,
    tapIn,
    tapOut,
    markNotificationAsRead,
    refreshData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}