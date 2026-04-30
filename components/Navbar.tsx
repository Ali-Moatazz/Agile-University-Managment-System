'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path ? 'active' : ''

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/" className="navbar-logo">
          📚 UniManage
        </Link>
        <ul className="navbar-nav">
          <li>
            <Link href="/" className={isActive('/')}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/staff" className={isActive('/staff')}>
              Staff Directory
            </Link>
          </li>
          <li>
            <Link href="/students" className={isActive('/students')}>
              Students
            </Link>
          </li>
          <li>
            <Link href="/subjects" className={isActive('/subjects')}>
              Subjects
            </Link>
          </li>
          <li>
            <Link href="/catalog" className={isActive('/catalog')}>
              Catalog
            </Link>
          </li>
          <li>
            <Link href="/courses" className={isActive('/courses')}>
              My Courses
            </Link>
          </li>
          <li>
            <Link href="/announcements" className={isActive('/announcements')}>
              Announcements
            </Link>
          </li>
          <li>
            <Link href="/grades" className={isActive('/grades')}>
              Grades
            </Link>
          </li>
          <li>
            <Link href="/rooms" className={isActive('/rooms')}>
              Rooms
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}