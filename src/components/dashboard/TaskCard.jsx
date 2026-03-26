import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

const statusColors = {
  need_to_do:    { bg: '#e3f2fd', text: '#1976d2' },
  in_progress:   { bg: '#fff3e0', text: '#e65100' },
  need_for_test: { bg: '#f3e5f5', text: '#7b1fa2' },
  completed:     { bg: '#e8f5e9', text: '#2e7d32' },
  reopen:        { bg: '#ffebee', text: '#c62828' },
}

const statusLabels = {
  need_to_do: 'Need to Do',
  in_progress: 'In Progress',
  need_for_test: 'Need for Test',
  completed: 'Completed',
  reopen: 'Re-open',
}

function formatDate(date) {
  if (!date) return 'No ETA'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function TaskCard({ task, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
    data: { task },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  const isOverdue = task.eta && new Date(task.eta) < new Date() && task.status !== 'completed'
  const sc = statusColors[task.status] || { bg: '#f5f5f5', text: '#666' }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`task-card${isDragging ? ' is-dragging' : ''}`}
    >
      {task.referenceImages && task.referenceImages.length > 0 && (
        <div style={{ height: 90, borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
          <img
            src={`/uploads/${task.referenceImages[0]}`}
            alt="ref"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      <div className="fw-semibold mb-1" style={{ fontSize: '0.875rem', lineHeight: 1.3 }}>
        {task.title}
      </div>

      <div className="text-muted text-clamp-2 mb-2" style={{ fontSize: '0.775rem' }}>
        {task.description}
      </div>

      <span
        className="badge mb-2"
        style={{ backgroundColor: sc.bg, color: sc.text, fontWeight: 600, fontSize: '0.68rem' }}
      >
        {statusLabels[task.status]}
      </span>

      {task.assignedTo && (
        <div className="d-flex align-items-center gap-2 mb-2">
          <div className="avatar-circle avatar-circle-sm d-inline-flex align-items-center justify-content-center" style={{ background: '#e7f1ff' }}>
            {task.assignedTo.profileImage ? (
              <img
                src={`/uploads/${task.assignedTo.profileImage}`}
                alt={task.assignedTo.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : (
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#0d6efd' }}>
                {task.assignedTo.name?.[0]}
              </span>
            )}
          </div>
          <span className="text-muted" style={{ fontSize: '0.775rem' }}>{task.assignedTo.name}</span>
        </div>
      )}

      <div className={`d-flex align-items-center gap-1 mb-2 ${isOverdue ? 'text-overdue' : 'text-muted'}`} style={{ fontSize: '0.775rem' }}>
        <i className="bi bi-clock" style={{ fontSize: '0.75rem' }} />
        <span style={{ fontWeight: isOverdue ? 600 : 400 }}>{formatDate(task.eta)}</span>
      </div>

      <div
        className="d-flex justify-content-end gap-1"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          className="btn btn-sm btn-light p-1"
          style={{ lineHeight: 1 }}
          onClick={(e) => { e.stopPropagation(); onEdit(task) }}
          title="Edit"
        >
          <i className="bi bi-pencil" style={{ fontSize: '0.75rem' }} />
        </button>
        <button
          className="btn btn-sm btn-light p-1 text-danger"
          style={{ lineHeight: 1 }}
          onClick={(e) => { e.stopPropagation(); onDelete(task) }}
          title="Delete"
        >
          <i className="bi bi-trash" style={{ fontSize: '0.75rem' }} />
        </button>
      </div>
    </div>
  )
}

export default TaskCard
