import './globals.css'
import Navbar from '@/components/Navbar'
import { AuthProvider } from '@/lib/auth-context'

export const metadata = {
  title: 'UniManage - University Management System',
  description: 'Complete university management platform for students, staff, and administrators',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}