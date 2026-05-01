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
}

interface RoomBooking {
  id: string
  room_id: string
  booked_by: string
  booking_date: string
  start_time: string
  end_time: string
}

export default function RoomsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [showBookForm, setShowBookForm] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [message, setMessage] = useState('')
  const [bookingData, setBookingData] = useState({
    booking_date: '',
    start_time: '',
    end_time: '',
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])

  useEffect(() => {
    if (user) {
      fetchRooms()
    }
  }, [user])

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setRooms(data || [])
    } catch (error) {
      console.error('Error fetching rooms:', error)
      setMessage('❌ Failed to load rooms')
    } finally {
      setLoading(false)
    }
  }

  const handleBookRoom = (room: Room) => {
    if (user?.role === 'student' || user?.role === 'doctor' || user?.role === 'ta') {
      setSelectedRoom(room)
      setShowBookForm(true)
    } else {
      setMessage('❌ Only students and faculty can book rooms')
    }
  }

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedRoom || !bookingData.booking_date || !bookingData.start_time || !bookingData.end_time) {
      setMessage('❌ Please fill in all required fields')
      return
    }

    try {
      // Check for double booking
      const { data: existingBooking } = await supabase
        .from('room_bookings')
        .select('id')
        .eq('room_id', selectedRoom.id)
        .eq('booking_date', bookingData.booking_date)
        .or(`and(start_time.lt.${bookingData.end_time},end_time.gt.${bookingData.start_time})`)
        .single()

      if (existingBooking) {
        setMessage('❌ Room is already booked for this time slot')
        return
      }

      const { error } = await supabase
        .from('room_bookings')
        .insert([
          {
            room_id: selectedRoom.id,
            booked_by: user?.id,
            booking_date: bookingData.booking_date,
            start_time: bookingData.start_time,
            end_time: bookingData.end_time,
          },
        ])

      if (error) throw error
      setMessage('✓ Room booked successfully!')
      setBookingData({ booking_date: '', start_time: '', end_time: '' })
      setShowBookForm(false)
      setSelectedRoom(null)
    } catch (error) {
      console.error('Error booking room:', error)
      setMessage('❌ Failed to book room. It might already be booked for that time.')
    }
  }

  if (!user) {
    return null
  }

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>Room Management</h1>
        <p style={{ color: '#6b7280' }}>View available rooms and make bookings</p>
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

      {showBookForm && selectedRoom && (
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>
            Book {selectedRoom.name}
          </h3>
          <form onSubmit={handleSubmitBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', color: '#1f2937' }}>Date *</label>
                <input
                  type="date"
                  value={bookingData.booking_date}
                  onChange={(e) => setBookingData({ ...bookingData, booking_date: e.target.value })}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit'
                  }}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', color: '#1f2937' }}>Start Time *</label>
                <input
                  type="time"
                  value={bookingData.start_time}
                  onChange={(e) => setBookingData({ ...bookingData, start_time: e.target.value })}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit'
                  }}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', color: '#1f2937' }}>End Time *</label>
                <input
                  type="time"
                  value={bookingData.end_time}
                  onChange={(e) => setBookingData({ ...bookingData, end_time: e.target.value })}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit'
                  }}
                  required
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
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
                Confirm Booking
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBookForm(false)
                  setSelectedRoom(null)
                }}
                style={{
                  background: '#e5e7eb',
                  color: '#1f2937',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
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
      ) : rooms.length === 0 ? (
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.75rem',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <p style={{ color: '#6b7280' }}>No rooms available.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {rooms.map((room) => (
            <div key={room.id} style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                padding: '1.5rem'
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>{room.name}</h3>
                <p style={{ margin: 0, opacity: 0.9 }}>{room.type}</p>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                  <strong>Capacity:</strong> {room.capacity} people
                </p>
                <button
                  onClick={() => handleBookRoom(room)}
                  style={{
                    background: '#667eea',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  Book Room
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setRooms(data || [])
    } catch (error) {
      console.error('Error fetching rooms:', error)
      setMessage('Failed to load rooms')
    } finally {
      setLoading(false)
    }
  }

  const handleBookRoom = (room: Room) => {
    setSelectedRoom(room)
    setShowBookForm(true)
  }

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedRoom || !bookingData.date || !bookingData.start_time || !bookingData.end_time || !bookingData.subject) {
      setMessage('Please fill in all required fields')
      return
    }

    try {
      const { error } = await supabase
        .from('room_bookings')
        .insert([
          {
            room_id: selectedRoom.id,
            booked_by: 'current-user-id',
            date: bookingData.date,
            start_time: bookingData.start_time,
            end_time: bookingData.end_time,
            subject: bookingData.subject,
          },
        ])

      if (error) throw error
      setMessage('✓ Room booked successfully!')
      setBookingData({ date: '', start_time: '', end_time: '', subject: '' })
      setShowBookForm(false)
      setSelectedRoom(null)
    } catch (error) {
      console.error('Error booking room:', error)
      setMessage('Failed to book room. It might already be booked for that time.')
    }
  }

  return (
    <main className="container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Room Management</h1>
        <p className="text-secondary">View available rooms and make bookings</p>
      </div>

      {message && (
        <div className={`alert mb-6 ${message.includes('✓') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}

      {showBookForm && selectedRoom && (
        <div className="card mb-6">
          <div className="card-header">
            <h3 className="card-title">Book {selectedRoom.name}</h3>
          </div>
          <form onSubmit={handleSubmitBooking} className="form">
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  value={bookingData.date}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Subject/Event *</label>
                <input
                  type="text"
                  value={bookingData.subject}
                  onChange={(e) => setBookingData({ ...bookingData, subject: e.target.value })}
                  className="form-input"
                  placeholder="e.g., CS101 Lecture"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Start Time *</label>
                <input
                  type="time"
                  value={bookingData.start_time}
                  onChange={(e) => setBookingData({ ...bookingData, start_time: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Time *</label>
                <input
                  type="time"
                  value={bookingData.end_time}
                  onChange={(e) => setBookingData({ ...bookingData, end_time: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn btn-primary">
                Confirm Booking
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBookForm(false)
                  setSelectedRoom(null)
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex-center p-8">
          <div className="spinner"></div>
        </div>
      ) : rooms.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-secondary">No rooms available.</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onBook={handleBookRoom}
              availabilityInfo="Available for booking"
            />
          ))}
        </div>
      )}
    </main>
  )
}