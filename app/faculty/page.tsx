'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

export default function FacultyDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user || (user.role !== 'doctor' && user.role !== 'ta')) {
      router.push('/')
    }
  }, [user, router])

  if (!user || (user.role !== 'doctor' && user.role !== 'ta')) {
    return null
  }

  const facultyFeatures = [
    { icon: '📚', title: 'Course Catalog', desc: 'Browse and view available courses', href: '/catalog', color: '#667eea' },
    { icon: '🏢', title: 'Book Room', desc: 'Reserve classrooms or lab spaces', href: '/rooms', color: '#f5576c' },
    { icon: '📈', title: 'Manage Grades', desc: 'View and manage student grades', href: '/grades', color: '#f093fb' },
    { icon: '📢', title: 'Announcements', desc: 'View all system announcements', href: '/announcements', color: '#4facfe' },
    { icon: '👥', title: 'Student Roster', desc: 'View enrolled students in courses', href: '/catalog', color: '#43e97b' },
    { icon: '📊', title: 'Reports', desc: 'Generate course and grade reports', href: '/grades', color: '#fa709a' },
  ]

  return (
    <main style={{ minHeight: '100vh', background: '#f9fafb', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
            Faculty Dashboard 👋
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
            Welcome, {user?.full_name}! Manage your courses and resources here.
          </p>
        </div>

        {/* Stats Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem', borderRadius: '1rem', color: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📚</div>
            <h3 style={{ fontSize: '0.875rem', opacity: 0.9 }}>My Courses</h3>
            <p style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Available</p>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', padding: '2rem', borderRadius: '1rem', color: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
            <h3 style={{ fontSize: '0.875rem', opacity: 0.9 }}>Students</h3>
            <p style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Enrolled</p>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', padding: '2rem', borderRadius: '1rem', color: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏢</div>
            <h3 style={{ fontSize: '0.875rem', opacity: 0.9 }}>Booked Rooms</h3>
            <p style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>This Semester</p>
          </div>
        </div>

        {/* Features Grid */}
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1.5rem' }}>Resources & Tools</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {facultyFeatures.map((feature) => (
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
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem', textDecoration: 'none' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '1rem', textDecoration: 'none' }}>
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

        {/* Quick Tips */}
        <div style={{ marginTop: '3rem', background: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem', textDecoration: 'none' }}>💡 Helpful Reminders</h3>
          <ul style={{ color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyle: 'disc', paddingLeft: '1.5rem', margin: '0' }}>
            <li>Book rooms in advance for your lectures and office hours</li>
            <li>Enter grades promptly after assessments are completed</li>
            <li>Check announcements regularly for important updates</li>
            <li>Student rosters update automatically when they enroll</li>
            <li>Submit feedback with grades to help student development</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
