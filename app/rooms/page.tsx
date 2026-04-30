'use client'

import { useEffect, useState } from 'react'
import { supabase, Room, RoomBooking } from '@/lib/supabase'
import RoomCard from '@/components/RoomCard'

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [showBookForm, setShowBookForm] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [message, setMessage] = useState('')
  const [bookingData, setBookingData] = useState({
    date: '',
    start_time: '',
    end_time: '',
    subject: '',
  })

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