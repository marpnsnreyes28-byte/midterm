'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  setDoc,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { toast } from 'sonner';

export interface AppUser {
  id: string;
  email: string;
  role: 'admin' | 'teacher';
  name: string;
  department?: string;
  rfid_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Teacher extends AppUser {
  firstName: string;
  lastName: string;
}

export type NewTeacherInput = {
  firstName: string;
  lastName: string;
  email: string;
  department: 'CBA' | 'CTE' | 'CECE';
  rfidId: string;
  isActive: boolean;
  password?: string | null;
};

export interface Classroom {
  id: string;
  name: string;
  building?: string;
  floor?: string;
  capacity?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: string;
  teacher_id: string;
  classroom_id: string;
  day: string;
  start_time: string;
  end_time: string;
  subject?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  teacher_id: string;
  classroom_id: string;
  date: string;
  tap_in_time?: string;
  tap_out_time?: string;
  status: 'present' | 'absent' | 'late';
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: AppUser | null;
  session: FirebaseUser | null;
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
  const [session, setSession] = useState<FirebaseUser | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminExists, setAdminExists] = useState(false);
  const [hasSupabaseConnection] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing Firebase auth system...');

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          setSession(firebaseUser);

          if (firebaseUser) {
            await loadUserProfile(firebaseUser);
            await loadAppData();
          } else {
            setUser(null);
            clearData();
          }

          setIsLoading(false);
        });

        await checkAdminExists();

        return () => unsubscribe();
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const loadUserProfile = async (firebaseUser: FirebaseUser) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data() as AppUser;
        setUser({
          ...userData,
          id: firebaseUser.uid
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const checkAdminExists = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'admin'), where('is_active', '==', true));
      const snapshot = await getDocs(q);
      setAdminExists(!snapshot.empty);
    } catch (error) {
      console.error('Error checking admin existence:', error);
      setAdminExists(false);
    }
  };

  const loadAppData = async () => {
    try {
      console.log('Loading app data from Firebase...');

      const usersRef = collection(db, 'users');
      const teachersQuery = query(
        usersRef,
        where('role', '==', 'teacher'),
        where('is_active', '==', true)
      );
      const teachersSnapshot = await getDocs(teachersQuery);
      const teachersData = teachersSnapshot.docs.map(doc => {
        const data = doc.data() as AppUser;
        return {
          ...data,
          id: doc.id,
          firstName: data.name.split(' ')[0] || '',
          lastName: data.name.split(' ').slice(1).join(' ') || ''
        };
      });
      setTeachers(teachersData);

      const classroomsRef = collection(db, 'classrooms');
      const classroomsQuery = query(classroomsRef, where('is_active', '==', true));
      const classroomsSnapshot = await getDocs(classroomsQuery);
      const classroomsData = classroomsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Classroom));
      setClassrooms(classroomsData);

      const schedulesRef = collection(db, 'schedules');
      const schedulesQuery = query(schedulesRef, where('is_active', '==', true));
      const schedulesSnapshot = await getDocs(schedulesQuery);
      const schedulesData = schedulesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Schedule));
      setSchedules(schedulesData);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const attendanceRef = collection(db, 'attendance_records');
      const attendanceSnapshot = await getDocs(attendanceRef);
      const attendanceData = attendanceSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AttendanceRecord));
      setAttendanceRecords(attendanceData);

      const notificationsRef = collection(db, 'notifications');
      const notificationsSnapshot = await getDocs(notificationsRef);
      const notificationsData = notificationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification));
      setNotifications(notificationsData);

      console.log('App data loaded successfully');
    } catch (error: any) {
      console.error('Error loading app data:', error);
      toast.error('Failed to load data');
    }
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
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login successful');
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      clearData();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const registerAdmin = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('Please enter a valid email address.');
        return false;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        role: 'admin',
        name,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      await checkAdminExists();
      toast.success('Admin registered successfully');
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
      return false;
    }
  };

  const addTeacher = async (teacherData: NewTeacherInput): Promise<string> => {
    try {
      const generated = `ndkc${Math.random().toString(36).substring(2, 8)}`;
      const tempPassword = teacherData.password && teacherData.password.length > 0 ? teacherData.password : generated;
      const fullName = `${teacherData.firstName} ${teacherData.lastName}`.trim();

      const userCredential = await createUserWithEmailAndPassword(auth, teacherData.email, tempPassword);

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: teacherData.email,
        role: 'teacher',
        name: fullName,
        department: teacherData.department,
        rfid_id: teacherData.rfidId,
        is_active: teacherData.isActive,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

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
      const teacherRef = doc(db, 'users', id);
      await updateDoc(teacherRef, {
        name: teacherData.name,
        department: teacherData.department,
        rfid_id: teacherData.rfid_id,
        is_active: teacherData.is_active,
        updated_at: new Date().toISOString()
      });

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
      const teacherRef = doc(db, 'users', id);
      await updateDoc(teacherRef, {
        is_active: false,
        updated_at: new Date().toISOString()
      });

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
      await addDoc(collection(db, 'classrooms'), {
        ...classroomData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

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
      const classroomRef = doc(db, 'classrooms', id);
      await updateDoc(classroomRef, {
        ...classroomData,
        updated_at: new Date().toISOString()
      });

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
      const classroomRef = doc(db, 'classrooms', id);
      await updateDoc(classroomRef, {
        is_active: false,
        updated_at: new Date().toISOString()
      });

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
      await addDoc(collection(db, 'schedules'), {
        ...scheduleData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

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
      const scheduleRef = doc(db, 'schedules', id);
      await updateDoc(scheduleRef, {
        ...scheduleData,
        updated_at: new Date().toISOString()
      });

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
      const scheduleRef = doc(db, 'schedules', id);
      await updateDoc(scheduleRef, {
        is_active: false,
        updated_at: new Date().toISOString()
      });

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
      await addDoc(collection(db, 'notifications'), {
        ...notificationData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

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
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('rfid_id', '==', rfidId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        toast.error('RFID not found');
        return false;
      }

      const teacherDoc = snapshot.docs[0];
      const today = new Date().toISOString().split('T')[0];

      await addDoc(collection(db, 'attendance_records'), {
        teacher_id: teacherDoc.id,
        classroom_id: classroomId,
        date: today,
        tap_in_time: new Date().toISOString(),
        status: 'present',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      await loadAppData();
      toast.success('Tap-in successful');
      return true;
    } catch (error) {
      console.error('Error during tap in:', error);
      toast.error('RFID tap-in failed');
      return false;
    }
  };

  const tapOut = async (rfidId: string): Promise<boolean> => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('rfid_id', '==', rfidId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        toast.error('RFID not found');
        return false;
      }

      const teacherDoc = snapshot.docs[0];
      const today = new Date().toISOString().split('T')[0];

      const attendanceRef = collection(db, 'attendance_records');
      const attendanceQuery = query(
        attendanceRef,
        where('teacher_id', '==', teacherDoc.id),
        where('date', '==', today)
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);

      if (!attendanceSnapshot.empty) {
        const latestRecord = attendanceSnapshot.docs[0];
        await updateDoc(doc(db, 'attendance_records', latestRecord.id), {
          tap_out_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      await loadAppData();
      toast.success('Tap-out successful');
      return true;
    } catch (error) {
      console.error('Error during tap out:', error);
      toast.error('RFID tap-out failed');
      return false;
    }
  };

  const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        is_read: true,
        updated_at: new Date().toISOString()
      });

      await loadAppData();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const refreshData = async (): Promise<void> => {
    await loadAppData();
  };

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
