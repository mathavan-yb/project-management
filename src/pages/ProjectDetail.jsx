import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Spinner, Alert } from 'react-bootstrap'
import { fetchProject } from '../store/slices/projectSlice'
import { fetchTasks, createTask, updateTask, deleteTask } from '../store/slices/taskSlice'
import AppModal from '../components/common/AppModal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import TaskForm from '../components/tasks/TaskForm'

const statusLabels = {
  need_to_do: 'Need to Do',
  in_progress: 'In Progress',
  need_for_test: 'Need for Test',
  completed: 'Completed',
  reopen: 'Re-open',
}

const statusBadge = {
  need_to_do:    'bg-primary',
  in_progress:   'bg-warning text-dark',
  need_for_test: 'bg-purple text-white',
  completed:     'bg-success',
  reopen:        'bg-danger',
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { currentProject, loading: projectLoading, error: projectError } = useSelector((s) => s.projects)
  const { tasks, loading: tasksLoading, error: tasksError } = useSelector((s) => s.tasks)

  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState(null)

  useEffect(() => {
    dispatch(fetchProject(id))
    dispatch(fetchTasks(id))
  }, [dispatch, id])

  const handleTaskSubmit = async (formData) => {
    setFormLoading(true)
    setFormError(null)
    try {
      if (editingTask) {
        const result = await dispatch(updateTask({ id: editingTask._id, formData }))
        if (updateTask.rejected.match(result)) { setFormError(result.payload); return }
      } else {
        formData.append('project', id)
        const result = await dispatch(createTask(formData))
        if (createTask.rejected.match(result)) { setFormError(result.payload); return }
      }
      setTaskModalOpen(false)
      setEditingTask(null)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (taskToDelete) {
      await dispatch(deleteTask(taskToDelete._id))
      setDeleteDialogOpen(false)
      setTaskToDelete(null)
    }
  }

  if (projectLoading && !currentProject) {
    return (
      <div className="d-flex justify-content-center pt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  if (projectError) {
    return <Alert variant="danger" className="mt-3">{projectError}</Alert>
  }

  if (!currentProject) return null

  const isOverdue = currentProject.endDate && new Date(currentProject.endDate) < new Date()

  return (
    <div>
      {/* Back button */}
      <button className="btn btn-light btn-sm mb-3" onClick={() => navigate('/projects')}>
        <i className="bi bi-arrow-left me-1" />Back to Projects
      </button>

      {/* Project Header */}
      <div className="card border-0 shadow-sm rounded-3 p-3 mb-4">
        <div className="d-flex align-items-start gap-3 flex-wrap">
          <div style={{ width: 80, height: 80, borderRadius: 12, background: '#e7f1ff', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {currentProject.logo ? (
              <img src={`/uploads/${currentProject.logo}`} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <i className="bi bi-folder-fill text-primary" style={{ fontSize: '2.2rem' }} />
            )}
          </div>

          <div className="flex-grow-1">
            <h4 className="fw-bold mb-1">{currentProject.title}</h4>
            <p className="text-muted mb-2" style={{ maxWidth: 700 }}>{currentProject.description}</p>

            <div className="d-flex gap-4 flex-wrap">
              <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.875rem' }}>
                <i className="bi bi-calendar-event" />
                <span><strong>Start:</strong> {formatDate(currentProject.startDate)}</span>
              </div>
              <div className={`d-flex align-items-center gap-1 ${isOverdue ? 'text-danger' : 'text-muted'}`} style={{ fontSize: '0.875rem' }}>
                <i className="bi bi-calendar-event" />
                <span><strong>End:</strong> {formatDate(currentProject.endDate)}{isOverdue && ' (Overdue)'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Team */}
        {currentProject.employees && currentProject.employees.length > 0 && (
          <>
            <hr className="my-3" />
            <div>
              <div className="fw-semibold mb-2" style={{ fontSize: '0.9rem' }}>
                Team Members ({currentProject.employees.length})
              </div>
              <div className="d-flex flex-wrap gap-2">
                {currentProject.employees.map((emp) => (
                  <span key={emp._id} className="badge bg-light text-dark border d-flex align-items-center gap-1 py-1 px-2" style={{ fontWeight: 500, fontSize: '0.8rem' }}>
                    <div className="avatar-circle avatar-circle-sm d-inline-flex align-items-center justify-content-center" style={{ background: '#e7f1ff' }}>
                      {emp.profileImage ? (
                        <img src={`/uploads/${emp.profileImage}`} alt={emp.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      ) : (
                        <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#0d6efd' }}>{emp.name[0]}</span>
                      )}
                    </div>
                    {emp.name} &middot; {emp.position}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tasks Section */}
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">Tasks ({tasks.length})</h5>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => { setEditingTask(null); setFormError(null); setTaskModalOpen(true) }}
          >
            <i className="bi bi-plus-lg me-1" />Add Task
          </button>
        </div>

        {tasksError && <Alert variant="danger" className="mb-3">{tasksError}</Alert>}

        {tasksLoading && tasks.length === 0 ? (
          <div className="d-flex justify-content-center pt-4">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="card border-0 shadow-sm rounded-3 p-5 text-center">
            <p className="text-muted mb-0">No tasks yet. Add the first task to this project!</p>
          </div>
        ) : (
          <div className="row g-3">
            {tasks.map((task) => {
              const isTaskOverdue = task.eta && new Date(task.eta) < new Date() && task.status !== 'completed'
              return (
                <div key={task._id} className="col-12 col-sm-6 col-md-4">
                  <div className="card border-0 shadow-sm rounded-3 h-100">
                    <div className="card-body p-3">
                      {task.referenceImages && task.referenceImages.length > 0 && (
                        <div style={{ height: 120, borderRadius: 6, overflow: 'hidden', marginBottom: 10 }}>
                          <img src={`/uploads/${task.referenceImages[0]}`} alt="ref" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}

                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <span className="fw-bold" style={{ fontSize: '0.9rem' }}>{task.title}</span>
                        <span className={`badge ${statusBadge[task.status] || 'bg-secondary'} ms-1`} style={{ fontSize: '0.65rem', flexShrink: 0 }}>
                          {statusLabels[task.status]}
                        </span>
                      </div>

                      <p className="text-muted text-clamp-2 mb-2" style={{ fontSize: '0.8rem' }}>
                        {task.description}
                      </p>

                      {task.assignedTo && (
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <div className="avatar-circle avatar-circle-sm d-inline-flex align-items-center justify-content-center" style={{ background: '#e7f1ff' }}>
                            {task.assignedTo.profileImage ? (
                              <img src={`/uploads/${task.assignedTo.profileImage}`} alt={task.assignedTo.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            ) : (
                              <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#0d6efd' }}>{task.assignedTo.name?.[0]}</span>
                            )}
                          </div>
                          <div>
                            <div className="fw-semibold" style={{ fontSize: '0.8rem' }}>{task.assignedTo.name}</div>
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>{task.assignedTo.position}</div>
                          </div>
                        </div>
                      )}

                      <div className={`d-flex align-items-center gap-1 ${isTaskOverdue ? 'text-danger' : 'text-muted'}`} style={{ fontSize: '0.78rem' }}>
                        <i className="bi bi-clock" />
                        <span style={{ fontWeight: isTaskOverdue ? 600 : 400 }}>ETA: {formatDate(task.eta)}</span>
                      </div>

                      {task.referenceImages && task.referenceImages.length > 1 && (
                        <div className="text-muted mt-1" style={{ fontSize: '0.72rem' }}>
                          +{task.referenceImages.length - 1} more image{task.referenceImages.length > 2 ? 's' : ''}
                        </div>
                      )}
                    </div>

                    <div className="card-footer bg-transparent border-top-0 pt-0 pb-2 px-3 d-flex justify-content-end gap-1">
                      <button
                        className="btn btn-sm btn-light"
                        onClick={() => { setEditingTask(task); setFormError(null); setTaskModalOpen(true) }}
                      >
                        <i className="bi bi-pencil" />
                      </button>
                      <button
                        className="btn btn-sm btn-light text-danger"
                        onClick={() => { setTaskToDelete(task); setDeleteDialogOpen(true) }}
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

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
        message={`Are you sure you want to delete "${taskToDelete?.title}"?`}
      />
    </div>
  )
}

export default ProjectDetail
