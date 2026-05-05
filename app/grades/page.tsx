'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

interface Grade {
  id: string
  student_id: string
  subject_id: string
  score: number
  feedback?: string
  created_by?: string
  created_at?: string
}

export default function GradesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])

  useEffect(() => {
    if (user) {
      fetchGrades()
    }
  }, [user])

  const fetchGrades = async () => {
    try {
      if (!user) return

      let query = supabase.from('grades').select('*')

      if (user.role === 'student') {
        // Get student ID for this user
        const { data: studentData } = await supabase
          .from('students')
          .select('id')
          .eq('profile_id', user.id)
          .single()

        if (studentData) {
          query = query.eq('student_id', studentData.id)
        }
      } else if (user.role === 'doctor' || user.role === 'ta') {
        // Faculty/TA can see grades for their courses (simplified: show all)
        query = query
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      setGrades(data || [])
    } catch (error) {
      console.error('Error fetching grades:', error)
      setMessage('❌ Failed to load grades')
    } finally {
      setLoading(false)
    }
  }

  const calculateAverage = () => {
    if (grades.length === 0) return 0
    const sum = grades.reduce((acc, grade) => acc + grade.score, 0)
    return (sum / grades.length).toFixed(2)
  }

  const getGradeStatus = (score: number) => {
    if (score >= 90) return { text: 'Excellent', color: '#10b981' }
    if (score >= 80) return { text: 'Very Good', color: '#667eea' }
    if (score >= 70) return { text: 'Good', color: '#f59e0b' }
    return { text: 'Needs Improvement', color: '#ef4444' }
  }

  if (!user) {
    return null
  }

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>Grade Dashboard</h1>
        <p style={{ color: '#6b7280' }}>Your grades and academic performance</p>
      </div>

      {message && (
        <div style={{
          padding: '1rem 1.5rem',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          background: '#fee2e2',
          color: '#991b1b',
          borderLeft: `4px solid #ef4444`
        }}>
          {message}
        </div>
      )}

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
      ) : (
        <>
          {grades.length > 0 && (
            <div style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem'
            }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '600' }}>Total Assessments</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea', margin: '0.5rem 0 0 0' }}>{grades.length}</p>
              </div>
              <div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '600' }}>Average Score</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea', margin: '0.5rem 0 0 0' }}>{calculateAverage()}%</p>
              </div>
            </div>
          )}

          {grades.length === 0 ? (
            <div style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <p style={{ color: '#6b7280' }}>No grades available yet. Check back soon!</p>
            </div>
          ) : (
            <div style={{
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
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>Assessment Results</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse'
                }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>Subject ID</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>Score</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>Status</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>Feedback</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((grade) => {
                      const status = getGradeStatus(grade.score)
                      return (
                        <tr key={grade.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '1rem', color: '#1f2937', fontWeight: '500' }}>
                            {grade.subject_id}
                          </td>
                          <td style={{ padding: '1rem', fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937' }}>
                            {grade.score}/100
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              background: status.color + '22',
                              color: status.color,
                              padding: '0.25rem 0.75rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              {status.text}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                            {grade.feedback || '-'}
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                            {grade.created_at ? new Date(grade.created_at).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  )
}