'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export default function ManageGradesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [mySubjects, setMySubjects] = useState<any[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [message, setMessage] = useState('')
  
  // Grade form state
  const [form, setForm] = useState({
    final: 0,
    mid: 0,
    project: 0,
    quiz: 0,
    feedback: ''
  })

  // 1. Protection & Initial Fetch
  useEffect(() => {
    if (!user || (user.role !== 'doctor' && user.role !== 'ta')) {
      router.push('/')
      return
    }
    fetchMySubjects()
  }, [user])

  const fetchMySubjects = async () => {
    // We find subjects via the doctor_subjects join table
    const { data, error } = await supabase
      .from('doctor_subjects')
      .select('subjects(*)')
      .eq('profile_id', user?.id)

    if (data) setMySubjects(data.map(d => d.subjects))
  }

  // 2. Fetch students when a subject is selected
  const handleSubjectChange = async (id: string) => {
    setSelectedSubjectId(id)
    setSelectedStudent(null)
    setMessage('')
    
    const { data, error } = await supabase
      .from('enrollments')
      .select('students(*)')
      .eq('subject_id', id)

    if (data) setEnrolledStudents(data.map(d => d.students))
  }

  // 3. Save Grades with specific breakdown
  const saveGrades = async () => {
    const totalScore = form.final + form.mid + form.project + form.quiz

    const { error } = await supabase
      .from('grades')
      .upsert({
        student_id: selectedStudent.id,
        subject_id: selectedSubjectId,
        final_exam: form.final,
        mid_term: form.mid,
        project: form.project,
        quizzes: form.quiz,
        score: totalScore, // Calculated total / 100
        feedback: form.feedback
      }, { onConflict: 'student_id, subject_id' })

    if (error) {
      setMessage('❌ Error: ' + error.message)
    } else {
      setMessage(`✅ Grades for ${selectedStudent.name} saved! (Total: ${totalScore}/100)`)
      setSelectedStudent(null)
    }
  }

  return (
    <main className="container">
      <h1 className="text-2xl font-bold mb-6">👨‍🏫 Manage Student Grades</h1>

      {/* Subject Selection */}
      <div className="card mb-6">
        <label className="form-label">Choose Course:</label>
        <select 
          className="form-input" 
          value={selectedSubjectId} 
          onChange={(e) => handleSubjectChange(e.target.value)}
        >
          <option value="">-- Select your Subject --</option>
          {mySubjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
        </select>
      </div>

      {selectedSubjectId && (
        <div className="grid grid-2 gap-6">
          {/* Student List */}
          <div className="card">
            <h3 className="mb-4">Enrolled Students</h3>
            <div className="flex flex-col gap-2">
              {enrolledStudents.length === 0 ? <p>No students enrolled yet.</p> : 
                enrolledStudents.map(st => (
                  <button 
                    key={st.id} 
                    onClick={() => setSelectedStudent(st)}
                    className={`btn btn-sm ${selectedStudent?.id === st.id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{justifyContent: 'space-between'}}
                  >
                    {st.name} <span>→</span>
                  </button>
                ))
              }
            </div>
          </div>

          {/* Grade Entry Form */}
          {selectedStudent ? (
            <div className="card" style={{borderLeft: '4px solid var(--primary)'}}>
              <h3 className="mb-4">Grading: {selectedStudent.name}</h3>
              <div className="form">
                <div className="grid grid-2">
                   <div className="form-group">
                      <label className="text-sm font-bold">Final Exam (/40)</label>
                      <input type="number" max="40" className="form-input" onChange={e => setForm({...form, final: +e.target.value})} />
                   </div>
                   <div className="form-group">
                      <label className="text-sm font-bold">Mid-Term (/25)</label>
                      <input type="number" max="25" className="form-input" onChange={e => setForm({...form, mid: +e.target.value})} />
                   </div>
                   <div className="form-group">
                      <label className="text-sm font-bold">Project (/30)</label>
                      <input type="number" max="30" className="form-input" onChange={e => setForm({...form, project: +e.target.value})} />
                   </div>
                   <div className="form-group">
                      <label className="text-sm font-bold">Quizzes (/5)</label>
                      <input type="number" max="5" className="form-input" onChange={e => setForm({...form, quiz: +e.target.value})} />
                   </div>
                </div>
                <div className="form-group">
                  <label className="text-sm font-bold">Professor Feedback</label>
                  <textarea className="form-textarea" onChange={e => setForm({...form, feedback: e.target.value})} placeholder="Add comments here..." />
                </div>
                <button className="btn btn-primary w-full" onClick={saveGrades}>Save Grade Record</button>
              </div>
            </div>
          ) : (
            <div className="flex-center text-secondary">Click a student to start grading</div>
          )}
        </div>
      )}

      {message && (
        <div className={`alert mt-6 ${message.includes('❌') ? 'alert-danger' : 'alert-success'}`}>
          {message}
        </div>
      )}
    </main>
  )
}