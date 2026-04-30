import { Staff } from '@/lib/supabase'

interface StaffCardProps {
  staff: Staff
  onEdit: (staff: Staff) => void
  onDelete: (id: string) => void
}

export default function StaffCard({ staff, onEdit, onDelete }: StaffCardProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{staff.name}</h3>
        <p className="card-subtitle">{staff.role}</p>
      </div>
      <div className="card-body">
        <p className="text-sm mb-2">
          <strong>Email:</strong> <a href={`mailto:${staff.email}`}>{staff.email}</a>
        </p>
        <p className="text-sm mb-2">
          <strong>Office:</strong> {staff.office_location}
        </p>
        {staff.phone && (
          <p className="text-sm mb-2">
            <strong>Phone:</strong> {staff.phone}
          </p>
        )}
        <span className={`badge badge-${staff.role === 'Professor' ? 'primary' : 'success'}`}>
          {staff.role}
        </span>
      </div>
      <div className="card-footer">
        <button
          onClick={() => onEdit(staff)}
          className="btn btn-secondary btn-sm"
        >
          ✏️ Edit
        </button>
        <button
          onClick={() => onDelete(staff.id)}
          className="btn btn-danger btn-sm"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  )
}
