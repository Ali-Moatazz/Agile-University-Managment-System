import './globals.css'
import Navbar from '@/components/Navbar'

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
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}