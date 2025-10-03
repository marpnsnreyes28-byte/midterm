export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'teacher'
          name: string
          department?: 'CBA' | 'CTE' | 'CECE'
          rfid_id?: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role: 'admin' | 'teacher'
          name: string
          department?: 'CBA' | 'CTE' | 'CECE'
          rfid_id?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'teacher'
          name?: string
          department?: 'CBA' | 'CTE' | 'CECE'
          rfid_id?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      classrooms: {
        Row: {
          id: string
          name: string
          location: string
          capacity?: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          location: string
          capacity?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string
          capacity?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      schedules: {
        Row: {
          id: string
          teacher_id: string
          classroom_id: string
          subject: string
          day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'
          start_time: string
          end_time: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          classroom_id: string
          subject: string
          day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'
          start_time: string
          end_time: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          classroom_id?: string
          subject?: string
          day?: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'
          start_time?: string
          end_time?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      attendance_records: {
        Row: {
          id: string
          teacher_id: string
          classroom_id: string
          date: string
          tap_in_time: string
          tap_out_time?: string
          duration_minutes?: number
          subject?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          classroom_id: string
          date: string
          tap_in_time: string
          tap_out_time?: string
          duration_minutes?: number
          subject?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          classroom_id?: string
          date?: string
          tap_in_time?: string
          tap_out_time?: string
          duration_minutes?: number
          subject?: string
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          title: string
          message: string
          type: 'info' | 'warning' | 'success' | 'error'
          target_role?: 'admin' | 'teacher'
          target_teacher_id?: string
          is_read: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          message: string
          type: 'info' | 'warning' | 'success' | 'error'
          target_role?: 'admin' | 'teacher'
          target_teacher_id?: string
          is_read?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          message?: string
          type?: 'info' | 'warning' | 'success' | 'error'
          target_role?: 'admin' | 'teacher'
          target_teacher_id?: string
          is_read?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_tables_if_not_exists: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      setup_rls_policies: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type helpers for easier usage
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Classroom = Database['public']['Tables']['classrooms']['Row']
export type ClassroomInsert = Database['public']['Tables']['classrooms']['Insert']
export type ClassroomUpdate = Database['public']['Tables']['classrooms']['Update']

export type Schedule = Database['public']['Tables']['schedules']['Row']
export type ScheduleInsert = Database['public']['Tables']['schedules']['Insert']
export type ScheduleUpdate = Database['public']['Tables']['schedules']['Update']

export type AttendanceRecord = Database['public']['Tables']['attendance_records']['Row']
export type AttendanceRecordInsert = Database['public']['Tables']['attendance_records']['Insert']
export type AttendanceRecordUpdate = Database['public']['Tables']['attendance_records']['Update']

export type Notification = Database['public']['Tables']['notifications']['Row']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update']