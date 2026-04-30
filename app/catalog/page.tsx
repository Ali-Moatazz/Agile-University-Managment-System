'use client'

import { useEffect, useState } from 'react'
import { supabase, Subject } from '@/lib/supabase'
import SubjectCard from '@/components/SubjectCard'

export default function CatalogPage() {
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
      setMessage('Failed to load catalog')
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
    try {
      const studentId = 'default-student-id'

      const { error } = await supabase
        .from('enrollments')
        .insert([
          {
            student_id: studentId,
            subject_id: subject.id,
          },
        ])

      if (error) throw error
      setMessage(`✓ Successfully enrolled in ${subject.name}!`)
    } catch (error) {
      console.error('Error enrolling:', error)
      setMessage('Failed to enroll in course')
    }
  }

  return (
    <main className="container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Course Catalog</h1>
        <p className="text-secondary">Browse and enroll in available courses</p>
      </div>

      {message && (
        <div className={`alert mb-6 ${message.includes('✓') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}

      <div className="card mb-6">
        <div className="card-body">
          <div className="grid grid-2 gap-4">
            <div className="form-group">
              <label className="form-label">Search Courses</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                placeholder="Search by name, code, or keywords..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Filter by Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as typeof selectedType)}
                className="form-select"
              >
                <option value="All">All Types</option>
                <option value="Core">Core Only</option>
                <option value="Elective">Elective Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-secondary">Found {filteredSubjects.length} course(s)</p>
      </div>

      {loading ? (
        <div className="flex-center p-8">
          <div className="spinner"></div>
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-secondary">No courses match your search. Try different keywords or filters!</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {filteredSubjects.map((s) => (
            <SubjectCard
              key={s.id}
              subject={s}
              onEnroll={handleEnroll}
            />
          ))}
        </div>
      )}
    </main>
  )
}