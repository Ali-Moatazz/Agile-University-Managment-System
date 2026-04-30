'use client'

import { useEffect, useState } from 'react'
import { supabase, Grade } from '@/lib/supabase'

export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchGrades()
  }, [])

  const fetchGrades = async () => {
    try {
      // In a real app, this would be filtered by the logged-in student's ID
      const studentId = 'default-student-id'

      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setGrades(data || [])
    } catch (error) {
      console.error('Error fetching grades:', error)
      setMessage('Failed to load grades')
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
    if (score >= 90) return { text: 'Excellent', color: 'badge-success' }
    if (score >= 80) return { text: 'Very Good', color: 'badge-primary' }
    if (score >= 70) return { text: 'Good', color: 'badge-warning' }
    return { text: 'Needs Improvement', color: 'badge-danger' }
  }

  return (
    <main className="container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Grade Dashboard</h1>
        <p className="text-secondary">Your grades and academic performance</p>
      </div>

      {message && (
        <div className="alert alert-danger mb-6">
          {message}
        </div>
      )}

      {loading ? (
        <div className="flex-center p-8">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          {grades.length > 0 && (
            <div className="card mb-6">
              <div className="card-body">
                <div className="grid grid-2">
                  <div>
                    <p className="text-secondary">Total Assessments</p>
                    <p className="text-2xl font-bold text-primary">{grades.length}</p>
                  </div>
                  <div>
                    <p className="text-secondary">Average Score</p>
                    <p className="text-2xl font-bold text-primary">{calculateAverage()}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {grades.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-secondary">No grades available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Assessment Results</h3>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Subject ID</th>
                      <th>Score</th>
                      <th>Status</th>
                      <th>Feedback</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((grade) => {
                      const status = getGradeStatus(grade.score)
                      return (
                        <tr key={grade.id}>
                          <td>
                            <span className="font-semibold">{grade.subject_id}</span>
                          </td>
                          <td>
                            <span className="font-bold text-lg">{grade.score}/100</span>
                          </td>
                          <td>
                            <span className={`badge ${status.color}`}>{status.text}</span>
                          </td>
                          <td>
                            <p className="text-sm text-secondary">{grade.feedback}</p>
                          </td>
                          <td>
                            <p className="text-sm text-secondary">
                              {new Date(grade.created_at).toLocaleDateString()}
                            </p>
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