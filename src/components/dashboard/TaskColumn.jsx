import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import TaskCard from './TaskCard'

const columnStyles = {
  need_to_do:    { headerBg: '#1976d2', lightBg: '#e3f2fd', label: 'Need to Do' },
  in_progress:   { headerBg: '#e65100', lightBg: '#fff3e0', label: 'In Progress' },
  need_for_test: { headerBg: '#7b1fa2', lightBg: '#f3e5f5', label: 'Need for Test' },
  completed:     { headerBg: '#2e7d32', lightBg: '#e8f5e9', label: 'Completed' },
  reopen:        { headerBg: '#c62828', lightBg: '#ffebee', label: 'Re-open' },
}

function TaskColumn({ status, tasks, onEditTask, onDeleteTask }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const style = columnStyles[status] || { headerBg: '#666', lightBg: '#f5f5f5', label: status }

  return (
    <div className={`task-column${isOver ? ' is-over' : ''}`}>
      <div className="task-column-header" style={{ backgroundColor: style.headerBg }}>
        <span>{style.label}</span>
        <span
          className="badge rounded-pill"
          style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: '#fff', fontWeight: 700 }}
        >
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`task-column-body${isOver ? ' is-over' : ''}`}
        style={isOver ? { backgroundColor: style.lightBg } : {}}
      >
        {tasks.length === 0 ? (
          <div className={`task-column-empty${isOver ? ' is-over' : ''}`}>
            {isOver ? 'Drop here' : 'No tasks'}
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default TaskColumn
