import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import { Spinner, Alert } from 'react-bootstrap'
import { fetchTasks, updateTaskStatus, updateTaskStatusOptimistic, deleteTask, createTask, updateTask } from '../store/slices/taskSlice'
import { fetchProjects } from '../store/slices/projectSlice'
import TaskColumn from '../components/dashboard/TaskColumn'
import AppModal from '../components/common/AppModal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import TaskForm from '../components/tasks/TaskForm'

const COLUMNS = [
  { id: 'need_to_do', label: 'Need to Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'need_for_test', label: 'Need for Test' },
  { id: 'completed', label: 'Completed' },
  { id: 'reopen', label: 'Re-open' },
]

function Dashboard() {
  const dispatch = useDispatch()
  const { tasks, loading, error } = useSelector((state) => state.tasks)
  const { projects } = useSelector((state) => state.projects)

  const [selectedProject, setSelectedProject] = useState('')
  const [activeTask, setActiveTask] = useState(null)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  useEffect(() => { dispatch(fetchProjects()) }, [dispatch])
  useEffect(() => { dispatch(fetchTasks(selectedProject || undefined)) }, [dispatch, selectedProject])

  const getTasksByStatus = (status) => tasks.filter((t) => t.status === status)

  const handleDragStart = ({ active }) => {
    setActiveTask(tasks.find((t) => t._id === active.id))
  }

  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null)
    if (!over) return
    const task = tasks.find((t) => t._id === active.id)
    if (!task || task.status === over.id) return
    if (!COLUMNS.map((c) => c.id).includes(over.id)) return
    dispatch(updateTaskStatusOptimistic({ id: active.id, status: over.id }))
    dispatch(updateTaskStatus({ id: active.id, status: over.id }))
  }

  const handleDragCancel = () => setActiveTask(null)

  const handleDeleteConfirm = async () => {
    if (taskToDelete) {
      await dispatch(deleteTask(taskToDelete._id))
      setDeleteDialogOpen(false)
      setTaskToDelete(null)
    }
  }

  const handleTaskSubmit = async (formData) => {
    setFormLoading(true)
    setFormError(null)
    try {
      if (editingTask) {
        const result = await dispatch(updateTask({ id: editingTask._id, formData }))
        if (updateTask.rejected.match(result)) { setFormError(result.payload); return }
      } else {
        if (selectedProject) formData.append('project', selectedProject)
        const result = await dispatch(createTask(formData))
        if (createTask.rejected.match(result)) { setFormError(result.payload); return }
      }
      setTaskModalOpen(false)
      setEditingTask(null)
    } finally {
      setFormLoading(false)
    }
  }

  const currentProject = projects.find((p) => p._id === selectedProject)

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 className="fw-bold mb-0">Task Board</h4>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <select
            className="form-select form-select-sm"
            style={{ minWidth: 200 }}
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.title}</option>
            ))}
          </select>
          {selectedProject && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => { setEditingTask(null); setFormError(null); setTaskModalOpen(true) }}
            >
              <i className="bi bi-plus-lg me-1" />Add Task
            </button>
          )}
        </div>
      </div>

      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

      {loading && tasks.length === 0 ? (
        <div className="d-flex justify-content-center pt-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="task-board">
            {COLUMNS.map((column) => (
              <TaskColumn
                key={column.id}
                status={column.id}
                tasks={getTasksByStatus(column.id)}
                onEditTask={(task) => { setEditingTask(task); setFormError(null); setTaskModalOpen(true) }}
                onDeleteTask={(task) => { setTaskToDelete(task); setDeleteDialogOpen(true) }}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div style={{
                background: '#fff',
                borderRadius: 8,
                padding: 12,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                border: '2px solid #0d6efd',
                width: 260,
                opacity: 0.95,
              }}>
                <div className="fw-semibold" style={{ fontSize: '0.875rem' }}>{activeTask.title}</div>
                {activeTask.assignedTo && (
                  <div className="text-muted mt-1" style={{ fontSize: '0.775rem' }}>{activeTask.assignedTo.name}</div>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <AppModal
        open={taskModalOpen}
        onClose={() => { setTaskModalOpen(false); setEditingTask(null); setFormError(null) }}
        title={editingTask ? 'Edit Task' : 'Add New Task'}
      >
        <TaskForm
          onSubmit={handleTaskSubmit}
          defaultValues={editingTask}
          projectEmployees={currentProject?.employees || []}
          isEditing={!!editingTask}
          loading={formLoading}
          error={formError}
        />
      </AppModal>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setTaskToDelete(null) }}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
      />
    </div>
  )
}

export default Dashboard
