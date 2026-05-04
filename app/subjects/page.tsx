'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
  created_by?: string
  created_at: string
}

export default function SubjectsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Subject>>({
    code: '',
    name: '',
    credits: 3,
    description: '',
    type: 'Core',
  })
  const [message, setMessage] = useState('')

  // Check authorization
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/')
    }
  }, [user, router])

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSubjects(data || [])
    } catch (error) {
      console.error('Error fetching subjects:', error)
      setMessage('❌ Failed to load subjects')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.code || !formData.name || !formData.description) {
      setMessage('Please fill in all required fields')
      return
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('subjects')
          .update({
            code: formData.code,
            name: formData.name,
            credits: formData.credits,
            description: formData.description,
            type: formData.type
          })
          .eq('id', editingId)

        if (error) throw error
        setMessage('✓ Subject updated successfully!')
      } else {
        // Check if code is unique
        const { data: existing } = await supabase
          .from('subjects')
          .select('id')
          .eq('code', formData.code)
          .single()

        if (existing) {
          setMessage('❌ Subject code already exists. Please use a unique code.')
          return
        }

        const { error } = await supabase
          .from('subjects')
          .insert([{
            code: formData.code,
            name: formData.name,
            credits: formData.credits,
            description: formData.description,
            type: formData.type,
            created_by: user?.id
          }])

        if (error) throw error
        setMessage('✓ Subject created successfully!')
      }

      setFormData({ code: '', name: '', credits: 3, description: '', type: 'Core' })
      setEditingId(null)
      setShowForm(false)
      fetchSubjects()
    } catch (error) {
      console.error('Error saving subject:', error)
      setMessage('❌ Failed to save subject')
    }
  }

  const handleEdit = (item: Subject) => {
    setFormData(item)
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this subject?')) {
      try {
        const { error } = await supabase
          .from('subjects')
          .delete()
          .eq('id', id)

        if (error) throw error
        setMessage('✓ Subject deleted successfully!')
        fetchSubjects()
      } catch (error) {
        console.error('Error deleting subject:', error)
        setMessage('❌ Failed to delete subject')
      }
    }
  }

  return (
    <main className="container">
      <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', padding: '2rem', borderRadius: '1rem', marginBottom: '2rem', color: 'white' }}>
        <h1 className="text-3xl font-bold mb-2">📚 Course Catalog Creator</h1>
        <p style={{ opacity: 0.9 }}>Create and manage course subjects for your university</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>Total Courses: <strong style={{ color: '#f5576c', fontSize: '1.25rem' }}>{subjects.length}</strong></p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ code: '', name: '', credits: 3, description: '', type: 'Core' })
          }}
          style={{
            background: showForm ? '#ef4444' : '#f5576c',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
        >
          {showForm ? '✕ Cancel' : '+ Create Subject'}
        </button>
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

      {showForm && (
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>
            {editingId ? 'Edit Subject' : 'Create New Subject'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', color: '#1f2937' }}>Subject Code *</label>
                <input
                  type="text"
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit'
                  }}
                  placeholder="e.g., CS101"
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', color: '#1f2937' }}>Subject Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit'
                  }}
                  placeholder="e.g., Introduction to Programming"
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', color: '#1f2937' }}>Credit Hours</label>
                <input
                  type="number"
                  value={formData.credits || 3}
                  onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit'
                  }}
                  placeholder="3"
                  min="1"
                  max="6"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', color: '#1f2937' }}>Type *</label>
                <select
                  value={formData.type || 'Core'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Subject['type'] })}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit'
                  }}
                  required
                >
                  <option value="Core">Core</option>
                  <option value="Elective">Elective</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: '600', color: '#1f2937' }}>Description *</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{
                  padding: '0.75rem 1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  minHeight: '120px',
                  resize: 'vertical'
                }}
                placeholder="Describe the subject..."
                required
              />
            </div>
            <button
              type="submit"
              style={{
                background: '#f5576c',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {editingId ? 'Update Subject' : 'Create Subject'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <div style={{
            width: '1rem',
            height: '1rem',
            border: '2px solid #e5e7eb',
            borderTop: '2px solid #f5576c',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite'
          }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : subjects.length === 0 ? (
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.75rem',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <p style={{ color: '#6b7280' }}>No subjects found. Create one to get started!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {subjects.map((s) => (
            <SubjectCard
              key={s.id}
              subject={s}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </main>
  )
}