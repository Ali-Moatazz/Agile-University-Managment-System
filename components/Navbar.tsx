'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  // Don't show navbar on login/signup pages
  if (pathname === '/' || !user) {
    return null
  }

  const isActive = (path: string) => pathname === path ? 'active' : ''

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  // Role-based navigation
  const adminLinks = [
    { href: '/admin', label: '📊 Dashboard' },
    { href: '/staff', label: '👔 Staff' },
    { href: '/students', label: '👥 Students' },
    { href: '/subjects', label: '📚 Subjects' },
    { href: '/announcements/create', label: '📢 Create Announcement' },
  ]

  const doctorTALinks = [
    { href: '/faculty', label: '📊 Dashboard' },
    { href: '/catalog', label: '📚 Catalog' },
    { href: '/rooms', label: '🏢 Book Room' },
    { href: '/grades', label: '📈 Manage Grades' },
    { href: '/announcements', label: '📢 Announcements' },
  ]

  const studentLinks = [
    { href: '/student', label: '📊 Dashboard' },
    { href: '/catalog', label: '📚 Catalog' },
    { href: '/courses', label: '📖 My Courses' },
    { href: '/grades', label: '📊 My Grades' },
    { href: '/announcements', label: '📢 Announcements' },
    { href: '/rooms', label: '🏢 Book Study Room' },
  ]

  const getLinks = () => {
    switch (user.role) {
      case 'admin':
        return adminLinks
      case 'doctor':
      case 'ta':
        return doctorTALinks
      case 'student':
        return studentLinks
      default:
        return []
    }
  }

  const links = getLinks()

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href={user.role === 'admin' ? '/admin' : user.role === 'student' ? '/student' : '/faculty'} className="navbar-logo">
          📚 UniManage
        </Link>
        <ul className="navbar-nav">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={isActive(link.href)}>
                {link.label}
              </Link>
            </li>
          ))}
          <li style={{ marginLeft: 'auto' }}>
            <span style={{ color: '#6b7280', marginRight: '1rem', display: 'inline-block' }}>
              👤 {user.full_name} ({user.role})
            </span>
          </li>
          <li>
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                color: '#ef4444',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: '600'
              }}
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}