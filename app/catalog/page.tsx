'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import SubjectCard from '@/components/SubjectCard'

interface Subject {
  id: string
  code: string
  name: string
  credits: number
  description: string
  type: 'Core' | 'Elective'
  created_by: string
  created_at: string
}

export default function CatalogPage() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<'All' | 'Core' | 'Elective'>('All')
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchSubjects()
  }, [])

  useEffect(() => {
    filterSubjects()
  }, [subjects, searchTerm, selectedType])

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setSubjects(data || [])
    } catch (error) {
      console.error('Error fetching subjects:', error)
      setMessage('❌ Failed to load catalog')
    } finally {
      setLoading(false)
    }
  }

  const filterSubjects = () => {
    let filtered = subjects

    if (selectedType !== 'All') {
      filtered = filtered.filter((s) => s.type === selectedType)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.code.toLowerCase().includes(term) ||
          s.description.toLowerCase().includes(term)
      )
    }

    setFilteredSubjects(filtered)
  }

  const handleEnroll = async (subject: Subject) => {
    if (!user || user.role !== 'student') {
      setMessage('❌ Only students can enroll in courses')
      return
    }

    try {
      // Get the student record for this user
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (studentError || !studentData) {
        setMessage('❌ Student record not found')
        return
      }

      // Check if already enrolled
      const { data: existingEnrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', studentData.id)
        .eq('subject_id', subject.id)
        .single()

      if (existingEnrollment) {
        setMessage('❌ You are already enrolled in this course')
        return
      }

      const { error } = await supabase
        .from('enrollments')
        .insert([
          {
            student_id: studentData.id,
            subject_id: subject.id,
          },
        ])

      if (error) throw error
      setMessage(`✓ Successfully enrolled in ${subject.name}!`)
    } catch (error) {
      console.error('Error enrolling:', error)
      setMessage('❌ Failed to enroll in course')
    }
  }

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>Course Catalog</h1>
        <p style={{ color: '#6b7280' }}>Browse and {user?.role === 'student' ? 'enroll in available' : 'view'} courses</p>
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

      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: '600', color: '#1f2937' }}>Search Courses</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '0.95rem',
                fontFamily: 'inherit'
              }}
              placeholder="Search by name, code, or keywords..."
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: '600', color: '#1f2937' }}>Filter by Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as typeof selectedType)}
              style={{
                padding: '0.75rem 1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '0.95rem',
                fontFamily: 'inherit'
              }}
            >
              <option value="All">All Types</option>
              <option value="Core">Core Only</option>
              <option value="Elective">Elective Only</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <p style={{ color: '#6b7280' }}>Found <strong style={{ color: '#667eea' }}>{filteredSubjects.length}</strong> course(s)</p>
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
      ) : filteredSubjects.length === 0 ? (
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.75rem',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <p style={{ color: '#6b7280' }}>No courses match your search. Try different keywords or filters!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filteredSubjects.map((s) => (
            <SubjectCard
              key={s.id}
              subject={s}
              onEnroll={user?.role === 'student' ? () => handleEnroll(s) : undefined}
            />
          ))}
        </div>
      )}
    </main>
  )
}