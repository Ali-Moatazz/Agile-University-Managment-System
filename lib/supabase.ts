import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// --- Database Types (Updated for New Schema) ---

export interface Profile {
  id: string // Links to auth.users.id
  full_name: string
  email: string
  role: 'admin' | 'doctor' | 'ta' | 'student'
  created_at: string
}

export interface Staff {
  id: string
  profile_id: string // Updated from user_id
  name: string
  email: string
  role: 'Professor' | 'TA' | 'Admin'
  office_location: string
  assigned_subject?: string;
  phone?: string
  created_at: string
}

export interface Student {
  id: string
  profile_id: string // Updated from user_id
  name: string
  email: string
  student_id: string
  major?: string
  created_at: string
}

export interface Subject {
  id: string
  code: string
  name: string
  credits: number
  description: string
  type: 'Core' | 'Elective'
  created_at: string
}

export interface Enrollment {
  id: string
  student_id: string
  subject_id: string
  enrolled_at: string
}

export interface Grade {
  id: string
  student_id: string
  subject_id: string
  score: number
  feedback: string
  created_at: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  created_by: string // Profile ID
  created_at: string
}

export interface Room {
  id: string
  name: string
  type: string
  capacity: number
  building: string
}

export interface RoomBooking {
  id: string
  room_id: string
  booked_by: string // Profile ID
  booking_date: string
  start_time: string
  end_time: string
  created_at: string
}