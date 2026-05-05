'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

interface Room {
  id: string
  name: string
  capacity: number
  type: string
  created_at?: string
}

interface RoomFormData extends Partial<Room> {}

export default function AdminRoomsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<RoomFormData>({
    name: '',
    capacity: 30,
    type: 'Classroom',
  })
  const [message, setMessage] = useState('')

  // Check authorization
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/')
    }
  }, [user, router])

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchRooms()
    }
  }, [user])

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        
      if (error) throw error
      setRooms(data || [])
    } catch (error) {
      console.error('Error fetching rooms:', error)
      setMessage('❌ Failed to load rooms')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.capacity || !formData.type) {
      setMessage('Please fill in all required fields')
      return
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('rooms')
          .update({
            name: formData.name,
            capacity: formData.capacity,
            type: formData.type,
          })
          .eq('id', editingId)

        if (error) throw error
        setMessage('✓ Room updated successfully!')
      } else {
        const { error } = await supabase
          .from('rooms')
          .insert([{
            name: formData.name,
            capacity: formData.capacity,
            type: formData.type,
          }])

        if (error) throw error
        setMessage('✓ Room added successfully!')
      }

      setFormData({ name: '', capacity: 30, type: 'Classroom' })
      setEditingId(null)
      setShowForm(false)
      fetchRooms()
    } catch (error) {
      console.error('Error saving room:', error)
      setMessage('❌ Failed to save room')
    }
  }

  const handleEdit = (item: Room) => {
    setFormData(item)
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this room?')) {
      try {
        const { error } = await supabase
          .from('rooms')
          .delete()
          .eq('id', id)

        if (error) throw error
        setMessage('✓ Room deleted successfully!')
        fetchRooms()
      } catch (error) {
        console.error('Error deleting room:', error)
        setMessage('❌ Failed to delete room')
      }
    }
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>Room Management</h1>
          <p style={{ color: '#6b7280' }}>Create and manage classrooms and labs</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setFormData({ name: '', capacity: 30, type: 'Classroom' })
          }}
          style={{
            background: showForm ? '#ef4444' : '#667eea',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          {showForm ? '✕ Cancel' : '+ Add Room'}
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
            {editingId ? 'Edit Room' : 'Add New Room'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', color: '#1f2937' }}>Room Name *</label>
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
                  placeholder="e.g., A101, Lab 1"
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', color: '#1f2937' }}>Capacity *</label>
                <input
                  type="number"
                  value={formData.capacity || 30}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit'
                  }}
                  placeholder="e.g., 30"
                  min="1"
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', color: '#1f2937' }}>Type *</label>
                <select
                  value={formData.type || 'Classroom'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit'
                  }}
                  required
                >
                  <option value="Classroom">Classroom</option>
                  <option value="Lab">Lab</option>
                  <option value="Lecture Hall">Lecture Hall</option>
                  <option value="Conference Room">Conference Room</option>
                  <option value="Study Room">Study Room</option>
                </select>
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
              {editingId ? 'Update Room' : 'Add Room'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: '#6b7280' }}>Loading rooms...</p>
        </div>
      ) : rooms.length === 0 ? (
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.75rem',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <p style={{ color: '#6b7280' }}>No rooms found. Create one to get started!</p>
        </div>
      ) : (
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.75rem',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>Name</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>Type</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>Capacity</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#1f2937' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem', color: '#1f2937' }}>{room.name}</td>
                  <td style={{ padding: '1rem', color: '#6b7280' }}>{room.type}</td>
                  <td style={{ padding: '1rem', color: '#6b7280' }}>{room.capacity}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button
                      onClick={() => handleEdit(room)}
                      style={{
                        background: 'transparent',
                        color: '#667eea',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600',
                        marginRight: '1rem'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(room.id)}
                      style={{
                        background: 'transparent',
                        color: '#ef4444',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
