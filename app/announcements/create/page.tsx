'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function CreateAnnouncementPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      setMessage('Please fix the errors below')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from('announcements').insert([
        {
          title: formData.title,
          content: formData.content,
          created_by: 'Admin', // In a real app, this comes from auth
        },
      ])

      if (error) throw error
      setMessage('✓ Announcement published successfully!')
      setTimeout(() => router.push('/announcements'), 2000)
    } catch (error) {
      console.error('Error creating announcement:', error)
      setMessage('Failed to create announcement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Create Announcement</h1>
        <p className="text-secondary">Post news and updates for all users</p>
      </div>

      {message && (
        <div className={`alert mb-6 ${message.includes('✓') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">New Announcement</h3>
        </div>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`form-input ${errors.title ? 'border-red-500' : ''}`}
              placeholder="Announcement title"
              required
            />
            {errors.title && <p className="form-error">{errors.title}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Content *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className={`form-textarea ${errors.content ? 'border-red-500' : ''}`}
              placeholder="Announcement content..."
              required
              rows={8}
            />
            {errors.content && <p className="form-error">{errors.content}</p>}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Publishing...' : 'Publish Announcement'}
            </button>
            <a href="/announcements" className="btn btn-secondary">
              Cancel
            </a>
          </div>
        </form>
      </div>
    </main>
  )
}