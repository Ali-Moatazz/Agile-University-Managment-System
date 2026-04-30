import { Room } from '@/lib/supabase'

interface RoomCardProps {
  room: Room
  onBook?: (room: Room) => void
  onEdit?: (room: Room) => void
  onDelete?: (id: string) => void
  availabilityInfo?: string
}

export default function RoomCard({
  room,
  onBook,
  onEdit,
  onDelete,
  availabilityInfo,
}: RoomCardProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{room.name}</h3>
        <p className="card-subtitle">{room.building}</p>
      </div>
      <div className="card-body">
        <p className="text-sm mb-2">
          <strong>Type:</strong> {room.type}
        </p>
        <p className="text-sm mb-2">
          <strong>Capacity:</strong> {room.capacity} students
        </p>
        {availabilityInfo && (
          <p className="text-sm mb-2 text-success">
            <strong>Status:</strong> {availabilityInfo}
          </p>
        )}
        <span className="badge badge-success">Available</span>
      </div>
      <div className="card-footer">
        {onBook && (
          <button
            onClick={() => onBook(room)}
            className="btn btn-primary btn-sm"
          >
            📅 Book Room
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(room)}
            className="btn btn-secondary btn-sm"
          >
            ✏️ Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(room.id)}
            className="btn btn-danger btn-sm"
          >
            🗑️ Delete
          </button>
        )}
      </div>
    </div>
  )
}
