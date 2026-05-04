'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function AuthPage() {
  const router = useRouter()
  const { user, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // If already logged in, redirect to dashboard
  if (user) {
    if (user.role === 'admin') {
      router.push('/admin')
    } else if (user.role === 'student') {
      router.push('/student')
    } else {
      router.push('/faculty')
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Login without specifying role - it's fetched from database
      await login(email, password, '')

      // Redirect based on actual user role from database
      // (The user will be set in context after login)
      // Adding delay to allow state to update
      setTimeout(() => {
        const savedUser = localStorage.getItem('unimanage_user')
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          if (userData.role === 'admin') {
            router.push('/admin')
          } else if (userData.role === 'student') {
            router.push('/student')
          } else {
            router.push('/faculty')
          }
        }
      }, 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '1200px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem', color: 'white' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>📚 UniManage</h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9 }}>University Management System</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {/* Left Side - Features/Info */}
          <div style={{ color: 'white' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Complete University Management</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '1.5rem', borderRadius: '0.75rem', backdropFilter: 'blur(10px)' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', textDecoration: 'none' }}>✨ For Everyone</h3>
                <p style={{ opacity: 0.9, fontSize: '0.95rem', textDecoration: 'none' }}>Admin, Faculty, TA, or Student - Access role-specific features</p>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '1.5rem', borderRadius: '0.75rem', backdropFilter: 'blur(10px)' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', textDecoration: 'none' }}>🔒 Secure Access</h3>
                <p style={{ opacity: 0.9, fontSize: '0.95rem', textDecoration: 'none' }}>Only admins can create accounts for secure account management</p>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '1.5rem', borderRadius: '0.75rem', backdropFilter: 'blur(10px)' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', textDecoration: 'none' }}>⚡ Features</h3>
                <ul style={{ opacity: 0.9, fontSize: '0.95rem', paddingLeft: '1.5rem', listStyle: 'disc', margin: '0' }}>
                  <li>Staff & Student Management</li>
                  <li>Course Catalog & Enrollment</li>
                  <li>Grade Dashboard</li>
                  <li>Room Booking System</li>
                  <li>Announcements</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            {/* Auth Title */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>Login to UniManage</h2>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Enter your credentials to access the system</p>
            </div>

            {error && (
              <div style={{
                padding: '1rem',
                background: '#fee2e2',
                color: '#991b1b',
                borderRadius: '0.5rem',
                marginBottom: '1.5rem',
                borderLeft: '4px solid #ef4444'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', color: '#1f2937' }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@university.edu"
                  required
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '600', color: '#1f2937' }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.875rem 1.5rem',
                  background: loading ? '#9ca3af' : '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  fontSize: '0.95rem'
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'none')}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
                Need an account? Contact your administrator to create one.
              </p>

              {/* Demo Credentials */}
              <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '0.5rem', fontSize: '0.85rem', color: '#6b7280' }}>
                <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Demo Credentials:</p>
                <p>Admin: admin@university.edu / password123</p>
                <p>Faculty: faculty@university.edu / password123</p>
                <p>Student: student@university.edu / password123</p>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', color: 'white', marginTop: '3rem', opacity: 0.8 }}>
          <p>© 2026 UniManage. All rights reserved. | Secure University Management Platform</p>
        </div>
      </div>
    </main>
  )
}
