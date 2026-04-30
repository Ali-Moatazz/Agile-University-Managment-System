import { Student } from '@/lib/supabase'

interface StudentCardProps {
  student: Student
  onEdit: (student: Student) => void
  onDelete: (id: string) => void
}

export default function StudentCard({ student, onEdit, onDelete }: StudentCardProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{student.name}</h3>
        <p className="card-subtitle">ID: {student.student_id}</p>
      </div>
      <div className="card-body">
        <p className="text-sm mb-2">
          <strong>Email:</strong> <a href={`mailto:${student.email}`}>{student.email}</a>
        </p>
        {student.major && (
          <p className="text-sm mb-2">
            <strong>Major:</strong> {student.major}
          </p>
        )}
        <span className="badge badge-primary">Student</span>
      </div>
      <div className="card-footer">
        <button
          onClick={() => onEdit(student)}
          className="btn btn-secondary btn-sm"
        >
          ✏️ Edit
        </button>
        <button
          onClick={() => onDelete(student.id)}
          className="btn btn-danger btn-sm"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  )
}
