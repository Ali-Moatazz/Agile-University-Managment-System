'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/')
    }
  }, [user, router])

  if (!user || user.role !== 'admin') {
    return null
  }

  const adminFeatures = [
    { icon: '👔', title: 'Staff Directory', desc: 'Manage staff profiles and information', href: '/staff', color: '#667eea' },
    { icon: '👥', title: 'Students', desc: 'Create and manage student records', href: '/students', color: '#f5576c' },
    { icon: '📚', title: 'Subjects', desc: 'Create course subjects and profiles', href: '/subjects', color: '#f093fb' },
    { icon: '📢', title: 'Announcements', desc: 'Post system-wide announcements', href: '/announcements/create', color: '#4facfe' },
    { icon: '📊', title: 'Catalog', desc: 'View the complete course catalog', href: '/catalog', color: '#43e97b' },
    { icon: '📋', title: 'All Announcements', desc: 'View all posted announcements', href: '/announcements', color: '#fa709a' },
  ]

  return (
    <main style={{ minHeight: '100vh', background: '#f9fafb', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
            Admin Dashboard 👋
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
            Welcome back, {user.full_name}! Manage your university operations from here.
          </p>
        </div>

        {/* Stats Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem', borderRadius: '1rem', color: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📊</div>
            <h3 style={{ fontSize: '0.875rem', opacity: 0.9 }}>System Status</h3>
            <p style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>All Active</p>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', padding: '2rem', borderRadius: '1rem', color: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
            <h3 style={{ fontSize: '0.875rem', opacity: 0.9 }}>Users</h3>
            <p style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Active</p>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', padding: '2rem', borderRadius: '1rem', color: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📚</div>
            <h3 style={{ fontSize: '0.875rem', opacity: 0.9 }}>Courses</h3>
            <p style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Managed</p>
          </div>
        </div>

        {/* Features Grid */}
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1.5rem' }}>Management Tools</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {adminFeatures.map((feature) => (
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

        {/* Quick Tips */}
        <div style={{ marginTop: '3rem', background: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>💡 Quick Tips</h3>
          <ul style={{ color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>• Always validate unique subject codes before saving new courses</li>
            <li>• Staff changes are immediately reflected in the system</li>
            <li>• Announcements are visible to all users in the system</li>
            <li>• Student records must include email for system access</li>
            <li>• Regular backups ensure data security and integrity</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
