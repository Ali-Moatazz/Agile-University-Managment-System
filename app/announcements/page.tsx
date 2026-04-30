'use client'

import { useEffect, useState } from 'react'
import { supabase, Announcement } from '@/lib/supabase'
import AnnouncementCard from '@/components/AnnouncementCard'
import Link from 'next/link'

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAnnouncements(data || [])
    } catch (error) {
      console.error('Error fetching announcements:', error)
      setMessage('Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      try {
        const { error } = await supabase
          .from('announcements')
          .delete()
          .eq('id', id)

        if (error) throw error
        setMessage('✓ Announcement deleted!')
        fetchAnnouncements()
      } catch (error) {
        console.error('Error deleting:', error)
        setMessage('Failed to delete announcement')
      }
    }
  }

  return (
    <main className="container">
      <div className="flex-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Announcements</h1>
          <p className="text-secondary">Latest news and updates from the university</p>
        </div>
        <Link href="/announcements/create" className="btn btn-primary">
          + Create Announcement
        </Link>
      </div>

      {message && (
        <div className={`alert mb-6 ${message.includes('✓') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="flex-center p-8">
          <div className="spinner"></div>
        </div>
      ) : announcements.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-secondary mb-4">No announcements yet.</p>
          <Link href="/announcements/create" className="btn btn-primary">
            Post the first announcement
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </main>
  )
}