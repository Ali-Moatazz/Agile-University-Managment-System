'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

interface Subject {
  id: string
  code: string
  name: string
  credits: number // Ensure this is number
  description: string
  type: 'Core' | 'Elective'
  
}

export default function CoursesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [enrolledCourses, setEnrolledCourses] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  // Redirect if not student
  useEffect(() => {
    if (user && user.role !== 'student') {
      router.push('/student')
    }
  }, [user, router])

  useEffect(() => {
    if (user?.role === 'student') {
      fetchEnrolledCourses()
    }
  }, [user])

  const fetchEnrolledCourses = async () => {
    try {
      if (!user) return

      // Get the student record for this user
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (studentError || !studentData) {
        setMessage('❌ Student record not found')
        setLoading(false)
        return
      }

      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select('subject_id')
        .eq('student_id', studentData.id)

      if (enrollError) throw enrollError

      if (enrollments && enrollments.length > 0) {
        const subjectIds = enrollments.map((e) => e.subject_id)

        const { data: subjects, error: subjError } = await supabase
          .from('subjects')
          .select('*')
          .in('id', subjectIds)
          .order('name', { ascending: true })

        if (subjError) throw subjError
        setEnrolledCourses(subjects || [])
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error)
      setMessage('❌ Failed to load your courses')
    } finally {
      setLoading(false)
    }
  }

  const handleUnenroll = async (subjectId: string) => {
    if (confirm('Are you sure you want to unenroll from this course?')) {
      try {
        if (!user) return

        // Get the student record
        const { data: studentData } = await supabase
          .from('students')
          .select('id')
          .eq('profile_id', user.id)
          .single()

        if (!studentData) {
          setMessage('❌ Student record not found')
          return
        }

        const { error } = await supabase
          .from('enrollments')
          .delete()
          .eq('student_id', studentData.id)
          .eq('subject_id', subjectId)

        if (error) throw error
        setMessage('✓ Successfully unenrolled from course!')
        fetchEnrolledCourses()
      } catch (error) {
        console.error('Error unenrolling:', error)
        setMessage('❌ Failed to unenroll from course')
      }
    }
  }

  if (user?.role !== 'student') {
    return null
  }

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>My Courses</h1>
        <p style={{ color: '#6b7280' }}>Your enrolled courses for this semester</p>
      </div>

      {message && (
        <div style={{
          padding: '1rem 1.5rem',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          background: message.includes('✓') ? '#d1fae5' : '#fee2e2',
          color: message.includes('✓') ? '#065f46' : '#991b1b',
          borderLeft: `4px solid ${message.includes('✓') ? '#10b981' : '#ef4444'}`
        }}>
          {message}
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <a href="/catalog" style={{
          background: '#667eea',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          textDecoration: 'none',
          fontWeight: '600',
          display: 'inline-block'
        }}>
          Browse More Courses
        </a>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <div style={{
            width: '1rem',
            height: '1rem',
            border: '2px solid #e5e7eb',
            borderTop: '2px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite'
          }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : enrolledCourses.length === 0 ? (
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.75rem',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>You haven't enrolled in any courses yet.</p>
          <a href="/catalog" style={{
            background: '#667eea',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: '600',
            display: 'inline-block'
          }}>
            Browse Catalog
          </a>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ color: '#6b7280' }}>Enrolled in <strong style={{ color: '#667eea' }}>{enrolledCourses.length}</strong> course(s)</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {enrolledCourses.map((course) => (
              <div key={course.id} style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '1.5rem'
                }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>{course.name}</h3>
                  <p style={{ margin: 0, opacity: 0.9 }}>{course.code}</p>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <p style={{ fontSize: '0.875rem', marginBottom: '1rem', color: '#4b5563' }}>{course.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>{course.credits} Credits</span>
                    <span style={{
                      background: course.type === 'Core' ? '#dbeafe' : '#dcfce7',
                      color: course.type === 'Core' ? '#1e40af' : '#166534',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {course.type}
                    </span>
                  </div>
                </div>
                <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', borderTop: '1px solid #e5e7eb' }}>
                  <button
                    onClick={() => handleUnenroll(course.id)}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      width: '100%'
                    }}
                  >
                    Unenroll
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  )
}