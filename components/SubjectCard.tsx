import { Subject } from '@/lib/supabase'

interface SubjectCardProps {
  subject: Subject
  onEdit?: (subject: Subject) => void
  onDelete?: (id: string) => void
  onEnroll?: (subject: Subject) => void
  isEnrolled?: boolean
}

export default function SubjectCard({
  subject,
  onEdit,
  onDelete,
  onEnroll,
  isEnrolled = false,
}: SubjectCardProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{subject.name}</h3>
        <p className="card-subtitle">{subject.code}</p>
      </div>
      <div className="card-body">
        <p className="text-sm mb-3">
          {subject.description}
        </p>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm">
              <strong>Credits:</strong> {subject.credits}
            </p>
            <span className={`badge ${subject.type === 'Core' ? 'badge-primary' : 'badge-success'}`}>
              {subject.type}
            </span>
          </div>
        </div>
      </div>
      <div className="card-footer">
        {onEnroll && (
          <button
            onClick={() => onEnroll(subject)}
            disabled={isEnrolled}
            className={`btn btn-sm ${isEnrolled ? 'btn-secondary' : 'btn-success'}`}
          >
            {isEnrolled ? '✓ Enrolled' : '+ Enroll'}
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(subject)}
            className="btn btn-secondary btn-sm"
          >
            ✏️ Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(subject.id)}
            className="btn btn-danger btn-sm"
          >
            🗑️ Delete
          </button>
        )}
      </div>
    </div>
  )
}
