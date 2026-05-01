'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

export default function StudentDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== 'student') {
      router.push('/')
    }
  }, [user, router])

  if (!user || user.role !== 'student') {
    return null
  }

  const studentFeatures = [
    { icon: '📚', title: 'Course Catalog', desc: 'Browse and enroll in available courses', href: '/catalog', color: '#667eea' },
    { icon: '📖', title: 'My Courses', desc: 'View your enrolled courses', href: '/courses', color: '#f5576c' },
    { icon: '📊', title: 'My Grades', desc: 'Check your grades and feedback', href: '/grades', color: '#f093fb' },
    { icon: '📢', title: 'Announcements', desc: 'Stay updated with campus announcements', href: '/announcements', color: '#4facfe' },
    { icon: '🏢', title: 'Book Study Room', desc: 'Reserve study spaces and labs', href: '/rooms', color: '#43e97b' },
    { icon: '👥', title: 'My Profile', desc: 'View and update your information', href: '/student', color: '#fa709a' },
  ]

  return (
    <main style={{ minHeight: '100vh', background: '#f9fafb', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
            Student Dashboard 👋
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
            Welcome back, {user.full_name}! Manage your academic journey here.
          </p>
        </div>

        {/* Stats Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem', borderRadius: '1rem', color: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📚</div>
            <h3 style={{ fontSize: '0.875rem', opacity: 0.9 }}>My Courses</h3>
            <p style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Enrolled</p>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', padding: '2rem', borderRadius: '1rem', color: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📊</div>
            <h3 style={{ fontSize: '0.875rem', opacity: 0.9 }}>GPA</h3>
            <p style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Tracking</p>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', padding: '2rem', borderRadius: '1rem', color: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎓</div>
            <h3 style={{ fontSize: '0.875rem', opacity: 0.9 }}>Credits</h3>
            <p style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Earned</p>
          </div>
        </div>

        {/* Features Grid */}
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1.5rem' }}>Your Tools & Resources</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {studentFeatures.map((feature) => (
            <Link href={feature.href} key={feature.href}>
              <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '1rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                transition: 'all 0.3s',
                borderLeft: `4px solid ${feature.color}`
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
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                  {feature.desc}
                </p>
                <button style={{
                  background: feature.color,
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  Access →
                </button>
              </div>
            </Link>
          ))}
        </div>

        {/* Important Information */}
        <div style={{ marginTop: '3rem', background: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>📋 Academic Tips</h3>
          <ul style={{ color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>• Browse the course catalog early to plan your semester</li>
            <li>• Enroll in core courses before electives</li>
            <li>• Check your grades regularly to stay on track</li>
            <li>• Book study rooms for group projects</li>
            <li>• Read all announcements for important deadlines</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
