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
  const [availableRooms, setAvailableRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [showBookForm, setShowBookForm] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [message, setMessage] = useState('')
  
  // Filter states
  const [filterDate, setFilterDate] = useState('')
  const [filterStartTime, setFilterStartTime] = useState('')
  const [filterEndTime, setFilterEndTime] = useState('')
  const [roomType, setRoomType] = useState('All')
  
  // Booking states
  const [bookingData, setBookingData] = useState({
    booking_date: '',
    start_time: '',
    end_time: '',
  })

  // Check authorization - only professor/TA
  useEffect(() => {
    if (!user) {
      router.push('/')
    } else if (user.role === 'student' || user.role === 'admin') {
      router.push('/')
    }
  }, [user, router])

  // Fetch rooms
  useEffect(() => {
    if (user && (user.role === 'doctor' || user.role === 'ta')) {
      fetchRooms()
    }
  }, [user])

  // Filter rooms when date/time changes
  useEffect(() => {
    filterAvailableRooms()
  }, [rooms, filterDate, filterStartTime, filterEndTime, roomType])

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

  const filterAvailableRooms = async () => {
    try {
      let filtered = rooms

      // Filter by room type
      if (roomType !== 'All') {
        filtered = filtered.filter(r => r.type === roomType)
      }

      // If date and time are selected, filter by availability
      if (filterDate && filterStartTime && filterEndTime) {
        // Get all bookings for the selected date and time
        const { data: bookings, error } = await supabase
          .from('room_bookings')
          .select('room_id')
          .eq('booking_date', filterDate)
          .gte('end_time', filterStartTime)
          .lte('start_time', filterEndTime)

        if (error && error.code !== 'PGRST116') throw error

        const bookedRoomIds = new Set((bookings || []).map(b => b.room_id))
        
        // Only show unbooked rooms
        filtered = filtered.filter(r => !bookedRoomIds.has(r.id))
      }

      setAvailableRooms(filtered)
    } catch (error) {
      console.error('Error filtering rooms:', error)
    }
  }

  const handleBookRoom = (room: Room) => {
    setSelectedRoom(room)
    if (filterDate) setBookingData(prev => ({ ...prev, booking_date: filterDate }))
    if (filterStartTime) setBookingData(prev => ({ ...prev, start_time: filterStartTime }))
    if (filterEndTime) setBookingData(prev => ({ ...prev, end_time: filterEndTime }))
    setShowBookForm(true)
  }

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedRoom || !bookingData.booking_date || !bookingData.start_time || !bookingData.end_time) {
      setMessage('❌ Please fill in all required fields')
      return
    }

    if (bookingData.start_time >= bookingData.end_time) {
      setMessage('❌ End time must be after start time')
      return
    }

    try {
      // Check for double booking
      const { data: existingBooking, error: checkError } = await supabase
        .from('room_bookings')
        .select('id')
        .eq('room_id', selectedRoom.id)
        .eq('booking_date', bookingData.booking_date)
        .lt('end_time', bookingData.end_time)
        .gt('start_time', bookingData.start_time)

      if (checkError && checkError.code !== 'PGRST116') throw checkError

      if (existingBooking && existingBooking.length > 0) {
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
      fetchRooms()
    } catch (error) {
      console.error('Error booking room:', error)
      setMessage('❌ Failed to book room')
    }
  }

  if (!user || (user.role !== 'doctor' && user.role !== 'ta')) {
    return null
  }

  const roomTypes = ['All', ...new Set(rooms.map(r => r.type))]

  return (
    <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>
          🏢 Room Booking System
        </h1>
        <p style={{ color: '#6b7280' }}>View available classrooms and labs, then book a room for your lectures</p>
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

      {/* Filter Section */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>
          Find Available Rooms
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.9rem' }}>Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '0.95rem',
                fontFamily: 'inherit'
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.9rem' }}>Start Time</label>
            <input
              type="time"
              value={filterStartTime}
              onChange={(e) => setFilterStartTime(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '0.95rem',
                fontFamily: 'inherit'
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.9rem' }}>End Time</label>
            <input
              type="time"
              value={filterEndTime}
              onChange={(e) => setFilterEndTime(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '0.95rem',
                fontFamily: 'inherit'
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.9rem' }}>Room Type</label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '0.95rem',
                fontFamily: 'inherit'
              }}
            >
              {roomTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Booking Form */}
      {showBookForm && selectedRoom && (
        <div style={{
          background: 'white',
          border: '2px solid #667eea',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>
            📅 Book {selectedRoom.name}
          </h3>
          <form onSubmit={handleSubmitBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
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
                ✓ Confirm Booking
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
                ✕ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rooms Display */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>Loading rooms...</p>
        </div>
      ) : availableRooms.length === 0 ? (
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.75rem',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <p style={{ color: '#6b7280', fontSize: '1rem' }}>
            {filterDate ? '❌ No rooms available for the selected date and time' : 'Select a date and time to see available rooms'}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {availableRooms.map(room => (
            <div
              key={room.id}
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                padding: '1.5rem'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>{room.name}</h3>
                <p style={{ margin: 0, opacity: 0.9 }}>{room.type}</p>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                  👥 <strong>Capacity:</strong> {room.capacity} people
                </p>
                <button
                  onClick={() => handleBookRoom(room)}
                  style={{
                    width: '100%',
                    background: '#667eea',
                    color: 'white',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  📅 Book This Room
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
