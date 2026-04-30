import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Staff {
  id: string
  name: string
  email: string
  role: 'Professor' | 'TA' | 'Admin'
  office_location: string
  phone?: string
  created_at: string
}

export interface Student {
  id: string
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
  created_by: string
  created_at: string
  updated_at: string
}

export interface Room {
  id: string
  name: string
  type: 'Classroom' | 'Lab' | 'Seminar'
  capacity: number
  building: string
  created_at: string
}

export interface RoomBooking {
  id: string
  room_id: string
  booked_by: string
  date: string
  start_time: string
  end_time: string
  subject: string
  created_at: string
}
