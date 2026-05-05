'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import StudentCard from '@/components/StudentCard'

interface Student {
  id: string
  profile_id: string // Fixed: Changed from user_id to match your schema
  name: string
  email: string
  student_id: string
  major?: string
  created_at: string
}

interface StudentFormData extends Partial<Student> {
  password?: string
}

export default function StudentsPage() {
  const { user, createAccount } = useAuth(); // Declared once at the top
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    email: '',
    student_id: '',
    major: '',
    password: '',
  })
  const [message, setMessage] = useState('')

  // Check authorization
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/')
    }
  }, [user, router])

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setStudents(data || [])
    } catch (error) {
      console.error('Error fetching students:', error)
      setMessage('❌ Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.student_id || !formData.major) {
      setMessage('❌ Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      if (editingId) {
        // UPDATE EXISTING STUDENT
        const { error } = await supabase
          .from('students')
          .update({
            name: formData.name,
            email: formData.email,
            student_id: formData.student_id,
            major: formData.major
          })
          .eq('id', editingId);

        if (error) throw error;
        setMessage('✓ Student updated successfully!');
      } else {
        // CREATE NEW STUDENT
        if (!formData.password || formData.password.length < 6) {
          setMessage('❌ Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        // Step 1: Create Account
        const newUser = await createAccount(
          formData.email!, 
          formData.password!, 
          formData.name!, 
          'student'
        );

        if (newUser) {
          // Step 2: Create student record using profile_id to match your schema
          const { error: studentError } = await supabase
            .from('students')
            .insert([{
              profile_id: newUser.id, // Fixed: user_id -> profile_id
              name: formData.name,
              email: formData.email,
              student_id: formData.student_id,
              major: formData.major
            }]);
            
          if (studentError) throw studentError;
        }

        setMessage('✓ Student added successfully!');
      }

      setFormData({ name: '', email: '', student_id: '', major: '', password: '' });
      setEditingId(null);
      setShowForm(false);
      fetchStudents();
    } catch (error: any) {
      console.error('Error saving student:', error);
      setMessage(error.message || '❌ Failed to save student');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Student) => {
    setFormData(item)
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      try {
        const { error } = await supabase
          .from('students')
          .delete()
          .eq('id', id)

        if (error) throw error
        setMessage('✓ Student deleted successfully!')
        fetchStudents()
      } catch (error) {
        console.error('Error deleting student:', error)
        setMessage('❌ Failed to delete student')
      }
    }
  }

  return (
    <main className="container">
      <div className="flex-between mb-6">
        <h1 className="text-3xl font-bold">Student Records</h1>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ name: '', email: '', student_id: '', major: '' })
          }}
          className="btn btn-primary"
        >
          {showForm ? '✕ Cancel' : '+ Add Student'}
        </button>
      </div>

      {message && (
        <div className={`alert ${message.includes('✓') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}

      {showForm && (
        <div className="card mb-6">
          <div className="card-header">
            <h3 className="card-title">{editingId ? 'Edit Student' : 'Add New Student'}</h3>
          </div>
          <form onSubmit={handleSubmit} className="form">
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  placeholder="Full name"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Student ID *</label>
                <input
                  type="text"
                  value={formData.student_id || ''}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  className="form-input"
                  placeholder="e.g., STU001234"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                  placeholder="student@university.edu"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Major</label>
                <input
                  type="text"
                  value={formData.major || ''}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  className="form-input"
                  placeholder="e.g., Computer Science"
                />
              </div>
              {!editingId && (
                <div className="form-group">
                  <label className="form-label">Password * (New Students Only)</label>
                  <input
                    type="password"
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="form-input"
                    placeholder="Min 6 characters"
                    required={!editingId}
                  />
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update Student' : 'Add Student'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex-center p-8">
          <div className="spinner"></div>
        </div>
      ) : students.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-secondary">No students found. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {students.map((s) => (
            <StudentCard
              key={s.id}
              student={s}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </main>
  )
}