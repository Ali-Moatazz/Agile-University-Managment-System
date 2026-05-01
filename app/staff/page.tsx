'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import StaffCard from '@/components/StaffCard'

interface Staff {
  id: string
  user_id?: string
  name: string
  email: string
  role: 'Professor' | 'TA' | 'Admin'
  office_location: string
  phone?: string
  created_at?: string
}

interface StaffFormData extends Partial<Staff> {
  password?: string
}

export default function StaffPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<StaffFormData>({
    name: '',
    email: '',
    role: 'Professor',
    office_location: '',
    phone: '',
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
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setStaff(data || [])
    } catch (error) {
      console.error('Error fetching staff:', error)
      setMessage('❌ Failed to load staff records')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.office_location) {
      setMessage('Please fill in all required fields')
      return
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('staff')
          .update({
            name: formData.name,
            email: formData.email,
            role: formData.role,
            office_location: formData.office_location,
            phone: formData.phone
          })
          .eq('id', editingId)

        if (error) throw error
        setMessage('✓ Staff updated successfully!')
      } else {
        const { error } = await supabase
          .from('staff')
          .insert([{
            user_id: user?.id,
            name: formData.name,
            email: formData.email,
            role: formData.role,
            office_location: formData.office_location,
            phone: formData.phone
          }])

        if (error) throw error
        setMessage('✓ Staff added successfully!')
      }

      setFormData({ name: '', email: '', role: 'Professor', office_location: '', phone: '' })
      setEditingId(null)
      setShowForm(false)
      fetchStaff()
    } catch (error) {
      console.error('Error saving staff:', error)
      setMessage('❌ Failed to save staff record')
    }
  }

  const handleEdit = (item: Staff) => {
    setFormData(item)
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      try {
        const { error } = await supabase
          .from('staff')
          .delete()
          .eq('id', id)

        if (error) throw error
        setMessage('✓ Staff deleted successfully!')
        fetchStaff()
      } catch (error) {
        console.error('Error deleting staff:', error)
        setMessage('❌ Failed to delete staff record')
      }
    }
  }

  return (
    <main className="container">
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem', borderRadius: '1rem', marginBottom: '2rem', color: 'white' }}>
        <h1 className="text-3xl font-bold mb-2">👔 Staff Directory</h1>
        <p style={{ opacity: 0.9 }}>Manage and organize staff members across the university</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>Total Staff: <strong style={{ color: '#667eea', fontSize: '1.25rem' }}>{staff.length}</strong></p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ name: '', email: '', role: 'Professor', office_location: '', phone: '' })
          }}
          style={{
            background: showForm ? '#ef4444' : '#667eea',
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
          {showForm ? '✕ Cancel' : '+ Add Staff Member'}
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
            {editingId ? 'Edit Staff Member' : 'Add New Staff Member'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', color: '#1f2937' }}>Name *</label>
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
                  placeholder="Full name"
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', color: '#1f2937' }}>Email *</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit'
                  }}
                  placeholder="email@university.edu"
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', color: '#1f2937' }}>Role *</label>
                <select
                  value={formData.role || 'Professor'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Staff['role'] })}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit'
                  }}
                  required
                >
                  <option value="Professor">Professor</option>
                  <option value="TA">TA</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', color: '#1f2937' }}>Office Location *</label>
                <input
                  type="text"
                  value={formData.office_location || ''}
                  onChange={(e) => setFormData({ ...formData, office_location: e.target.value })}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit'
                  }}
                  placeholder="e.g., Building A, Room 201"
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', color: '#1f2937' }}>Phone</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit'
                  }}
                  placeholder="(123) 456-7890"
                />
              </div>
            </div>
            <button
              type="submit"
              style={{
                background: '#667eea',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {editingId ? 'Update Staff' : 'Add Staff Member'}
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
            borderTop: '2px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite'
          }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : staff.length === 0 ? (
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.75rem',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <p style={{ color: '#6b7280' }}>No staff members found. Create one to get started!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {staff.map((s) => (
            <StaffCard
              key={s.id}
              staff={s}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </main>
  )
}