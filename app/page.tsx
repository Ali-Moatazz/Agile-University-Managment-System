export default function Home() {
  return (
    <main className="container">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-primary">Welcome to UniManage</h1>
        <p className="text-xl text-secondary">Complete University Management System</p>
      </div>

      <div className="grid grid-3 mb-8">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📚 Features</h3>
          </div>
          <div className="card-body">
            <ul className="text-sm space-y-2">
              <li>✓ Staff Directory Management</li>
              <li>✓ Student Records</li>
              <li>✓ Subject & Course Catalog</li>
              <li>✓ Course Enrollment</li>
              <li>✓ Announcements & Communication</li>
              <li>✓ Grade Dashboard</li>
              <li>✓ Room Booking System</li>
            </ul>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🎯 Quick Access</h3>
          </div>
          <div className="card-body space-y-3">
            <a href="/staff" className="btn btn-primary btn-sm w-full">Staff Directory</a>
            <a href="/students" className="btn btn-primary btn-sm w-full">Students</a>
            <a href="/subjects" className="btn btn-primary btn-sm w-full">Create Subjects</a>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🔗 Resources</h3>
          </div>
          <div className="card-body space-y-3">
            <a href="/catalog" className="btn btn-secondary btn-sm w-full">Browse Catalog</a>
            <a href="/announcements" className="btn btn-secondary btn-sm w-full">Announcements</a>
            <a href="/rooms" className="btn btn-secondary btn-sm w-full">Book Room</a>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📊 System Overview</h3>
        </div>
        <div className="card-body">
          <p className="text-secondary mb-4">
            UniManage is a comprehensive platform designed to streamline university operations. 
            From managing staff and student records to handling course catalogs and room bookings, 
            this system provides an integrated solution for educational institutions.
          </p>
          <div className="grid grid-2">
            <div>
              <h4 className="font-semibold mb-2">For Administrators</h4>
              <ul className="text-sm text-secondary space-y-1">
                <li>• Manage staff profiles</li>
                <li>• Create and manage students</li>
                <li>• Create course subjects</li>
                <li>• Post announcements</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">For Students & Faculty</h4>
              <ul className="text-sm text-secondary space-y-1">
                <li>• Browse course catalog</li>
                <li>• Enroll in courses</li>
                <li>• View grades and feedback</li>
                <li>• Book classrooms/labs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}