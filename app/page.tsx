'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function AuthPage() {
  const router = useRouter()
  const { user, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // FIX: Redirection must happen inside useEffect, not in the main render body
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin')
      } else if (user.role === 'student') {
        router.push('/student')
      } else {
        router.push('/faculty')
      }
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      // Redirect will happen automatically via the useEffect above
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  if (user) return <div className="flex-center p-20">Redirecting...</div>
  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '1200px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem', color: 'white' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold' }}>📚 UniManage</h1>
          <p>University Management System</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          <div style={{ color: 'white' }}>
            <h2>Complete University Management</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
               {/* Note: I removed the .map here to avoid any key conflicts on this page */}
               <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '1rem', borderRadius: '10px' }}>
                  <strong>✨ For Everyone</strong>
                  <p>Access role-specific features</p>
               </div>
               <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '1rem', borderRadius: '10px' }}>
                  <strong>🔒 Secure Access</strong>
                  <p>Admin-managed accounts</p>
               </div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Login</h2>
            {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="form-input" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="form-input" />
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}