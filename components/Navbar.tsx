'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const router = useRouter()

  if (pathname === '/' || !user) return null

  const adminLinks = [
    { id: 'adm-dash', href: '/admin', label: '📊 Dashboard' },
    { id: 'adm-acc', href: '/admin/accounts', label: '👤 Manage Accounts' },
    { id: 'adm-rooms', href: '/admin/rooms', label: '🏢 Manage Rooms' },
    { id: 'adm-staff', href: '/staff', label: '👔 Staff' },
    { id: 'adm-stu', href: '/students', label: '👥 Students' },
    { id: 'adm-subj', href: '/subjects', label: '📚 Subjects' },
    { id: 'adm-ann', href: '/announcements/create', label: '📢 Create Announcement' },
  ]

  const doctorLinks = [
    { id: 'doc-dash', href: '/faculty', label: '📊 Dashboard' },
    { id: 'doc-cat', href: '/catalog', label: '📚 Catalog' },
    { id: 'doc-room', href: '/rooms', label: '🏢 Book Room' },
    { id: 'doc-grade', href: '/grades/manage', label: '📈 Manage Grades' },
    { id: 'doc-ann', href: '/announcements', label: '📢 Announcements' },
  ]

  const studentLinks = [
    { id: 'stu-dash', href: '/student', label: '📊 Dashboard' },
    { id: 'stu-cat', href: '/catalog', label: '📚 Catalog' },
    { id: 'stu-course', href: '/courses', label: '📖 My Courses' },
    { id: 'stu-grade', href: '/grades', label: '📊 My Grades' },
    { id: 'stu-ann', href: '/announcements', label: '📢 Announcements' },
  ]

  const links = user.role === 'admin' ? adminLinks : 
                (user.role === 'doctor' || user.role === 'ta') ? doctorLinks : 
                studentLinks

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/" className="navbar-logo">📚 UniManage</Link>
        <ul className="navbar-nav">
          {links.map((link) => (
            // FIX: Combining role and ID makes it impossible to have a duplicate key
            <li key={`${user.role}-${link.id}`}>
              <Link href={link.href} className={pathname === link.href ? 'active' : ''}>
                {link.label}
              </Link>
            </li>
          ))}
          <li style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>👤 {user.full_name}</span>
            <button onClick={() => { logout(); router.push('/') }} className="btn btn-sm btn-danger">Logout</button>
          </li>
        </ul>
      </div>
    </nav>
  )
}