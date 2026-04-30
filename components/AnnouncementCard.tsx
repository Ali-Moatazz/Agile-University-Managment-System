import { Announcement } from '@/lib/supabase'

interface AnnouncementCardProps {
  announcement: Announcement
  onEdit?: (announcement: Announcement) => void
  onDelete?: (id: string) => void
}

export default function AnnouncementCard({
  announcement,
  onEdit,
  onDelete,
}: AnnouncementCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{announcement.title}</h3>
        <p className="card-subtitle">Posted by {announcement.created_by}</p>
        <p className="text-sm text-secondary mt-2">{formatDate(announcement.created_at)}</p>
      </div>
      <div className="card-body">
        <p className="text-base">{announcement.content}</p>
      </div>
      {(onEdit || onDelete) && (
        <div className="card-footer">
          {onEdit && (
            <button
              onClick={() => onEdit(announcement)}
              className="btn btn-secondary btn-sm"
            >
              ✏️ Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(announcement.id)}
              className="btn btn-danger btn-sm"
            >
              🗑️ Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}