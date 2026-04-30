'use client'

import { useEffect, useState } from 'react'
import { supabase, Subject, Enrollment } from '@/lib/supabase'
import SubjectCard from '@/components/SubjectCard'

export default function CoursesPage() {
  const [enrolledCourses, setEnrolledCourses] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchEnrolledCourses()
  }, [])

  const fetchEnrolledCourses = async () => {
    try {
      const studentId = 'default-student-id'

      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select('subject_id')
        .eq('student_id', studentId)

      if (enrollError) throw enrollError

      if (enrollments && enrollments.length > 0) {
        const subjectIds = enrollments.map((e: any) => e.subject_id)

        const { data: subjects, error: subjError } = await supabase
          .from('subjects')
          .select('*')
          .in('id', subjectIds)

        if (subjError) throw subjError
        setEnrolledCourses(subjects || [])
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error)
      setMessage('Failed to load your courses')
    } finally {
      setLoading(false)
    }
  }

  const handleUnenroll = async (subjectId: string) => {
    if (confirm('Are you sure you want to unenroll from this course?')) {
      try {
        const studentId = 'default-student-id'

        const { error } = await supabase
          .from('enrollments')
          .delete()
          .eq('student_id', studentId)
          .eq('subject_id', subjectId)

        if (error) throw error
        setMessage('✓ Successfully unenrolled from course!')
        fetchEnrolledCourses()
      } catch (error) {
        console.error('Error unenrolling:', error)
        setMessage('Failed to unenroll from course')
      }
    }
  }

  return (
    <main className="container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Courses</h1>
        <p className="text-secondary">Your enrolled courses for this semester</p>
      </div>

      {message && (
        <div className={`alert mb-6 ${message.includes('✓') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}

      <div className="mb-4">
        <a href="/catalog" className="btn btn-primary">
          Browse More Courses
        </a>
      </div>

      {loading ? (
        <div className="flex-center p-8">
          <div className="spinner"></div>
        </div>
      ) : enrolledCourses.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-secondary mb-4">You haven't enrolled in any courses yet.</p>
          <a href="/catalog" className="btn btn-primary">
            Browse Catalog
          </a>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-secondary">Enrolled in {enrolledCourses.length} course(s)</p>
          </div>
          <div className="grid grid-3">
            {enrolledCourses.map((course) => (
              <div key={course.id} className="card">
                <div className="card-header">
                  <h3 className="card-title">{course.name}</h3>
                  <p className="card-subtitle">{course.code}</p>
                </div>
                <div className="card-body">
                  <p className="text-sm mb-2">{course.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">{course.credits} Credits</span>
                    <span className={`badge ${course.type === 'Core' ? 'badge-primary' : 'badge-success'}`}>
                      {course.type}
                    </span>
                  </div>
                </div>
                <div className="card-footer">
                  <button
                    onClick={() => handleUnenroll(course.id)}
                    className="btn btn-danger btn-sm"
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