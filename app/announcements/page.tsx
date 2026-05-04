'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import AnnouncementCard from '@/components/AnnouncementCard'
import Link from 'next/link'

interface Announcement {
  id: string
  title: string
  content: string
  created_by: string
  created_at: string
  updated_at: string
}

export default function AnnouncementsPage() {
  const { user } = useAuth()
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
      setMessage('❌ Failed to load announcements')
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
        setMessage('❌ Failed to delete announcement')
      }
    }
  }

  return (
    <main className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>Announcements</h1>
          <p style={{ color: '#6b7280' }}>Latest news and updates from the university</p>
        </div>
        {user?.role === 'admin' && (
          <Link href="/announcements/create" style={{
            background: '#667eea',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: '600'
          }}>
            + Create Announcement
          </Link>
        )}
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
      ) : announcements.length === 0 ? (
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.75rem',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>No announcements yet.</p>
          {user?.role === 'admin' && (
            <Link href="/announcements/create" style={{
              background: '#667eea',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '600',
              display: 'inline-block'
            }}>
              Post the first announcement
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onDelete={user?.role === 'admin' ? handleDelete : undefined}
            />
          ))}
        </div>
      )}
    </main>
  )
}