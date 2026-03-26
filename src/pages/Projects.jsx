import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Spinner, Alert } from 'react-bootstrap'
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
} from '../store/slices/projectSlice'
import { fetchEmployees } from '../store/slices/employeeSlice'
import PageHeader from '../components/common/PageHeader'
import AppModal from '../components/common/AppModal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import ProjectForm from '../components/projects/ProjectForm'

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getProjectStatus(project) {
  const now = new Date()
  if (now < new Date(project.startDate)) return { label: 'Upcoming', cls: 'bg-info' }
  if (now > new Date(project.endDate)) return { label: 'Completed', cls: 'bg-success' }
  return { label: 'Active', cls: 'bg-warning text-dark' }
}

function Projects() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { projects, loading, error } = useSelector((state) => state.projects)
  const { employees } = useSelector((state) => state.employees)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState(null)

  useEffect(() => {
    dispatch(fetchProjects())
    dispatch(fetchEmployees())
  }, [dispatch])

  const handleFormSubmit = async (formData) => {
    setFormLoading(true)
    setFormError(null)
    try {
      let result
      if (editingProject) {
        result = await dispatch(updateProject({ id: editingProject._id, formData }))
        if (updateProject.rejected.match(result)) { setFormError(result.payload); return }
      } else {
        result = await dispatch(createProject(formData))
        if (createProject.rejected.match(result)) { setFormError(result.payload); return }
      }
      setModalOpen(false)
      setEditingProject(null)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (projectToDelete) {
      await dispatch(deleteProject(projectToDelete._id))
      setDeleteDialogOpen(false)
      setProjectToDelete(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Projects"
        actionLabel="New Project"
        onAction={() => { setEditingProject(null); setFormError(null); setModalOpen(true) }}
      />

      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

      {loading && projects.length === 0 ? (
        <div className="d-flex justify-content-center pt-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : projects.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-3 p-5 text-center">
          <i className="bi bi-folder-x text-secondary mb-3" style={{ fontSize: '3rem' }} />
          <h6 className="text-muted">No projects yet</h6>
          <p className="text-muted small mb-0">Create your first project to get started</p>
        </div>
      ) : (
        <div className="row g-3">
          {projects.map((project) => {
            const status = getProjectStatus(project)
            return (
              <div key={project._id} className="col-12 col-sm-6 col-md-4">
                <div
                  className="card border-0 shadow-sm rounded-3 h-100"
                  style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
                  onClick={() => navigate(`/projects/${project._id}`)}
                >
                  <div className="card-body p-3">
                    <div className="d-flex align-items-start gap-2 mb-2">
                      <div style={{ width: 50, height: 50, borderRadius: 10, background: '#e7f1ff', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {project.logo ? (
                          <img src={`/uploads/${project.logo}`} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <i className="bi bi-folder-fill text-primary" style={{ fontSize: '1.4rem' }} />
                        )}
                      </div>
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="fw-bold text-truncate" style={{ fontSize: '0.95rem' }}>{project.title}</div>
                        <span className={`badge ${status.cls} mt-1`} style={{ fontSize: '0.7rem' }}>{status.label}</span>
                      </div>
                    </div>

                    <p className="text-muted text-clamp-2 mb-2" style={{ fontSize: '0.825rem' }}>
                      {project.description}
                    </p>

                    <hr className="my-2" />

                    <div className="d-flex align-items-center gap-1 mb-2 text-muted" style={{ fontSize: '0.775rem' }}>
                      <i className="bi bi-calendar-event" />
                      <span>{formatDate(project.startDate)} {String.fromCharCode(8211)} {formatDate(project.endDate)}</span>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-people text-muted" style={{ fontSize: '0.875rem' }} />
                      <span className="text-muted" style={{ fontSize: '0.775rem' }}>
                        {project.employees?.length || 0} member{(project.employees?.length || 0) !== 1 ? 's' : ''}
                      </span>
                      <div className="d-flex ms-1" style={{ gap: 2 }}>
                        {(project.employees || []).slice(0, 4).map((emp) => (
                          <div
                            key={emp._id}
                            className="avatar-circle avatar-circle-sm d-inline-flex align-items-center justify-content-center"
                            style={{ background: '#e7f1ff', border: '2px solid #fff' }}
                            title={emp.name}
                          >
                            {emp.profileImage ? (
                              <img src={`/uploads/${emp.profileImage}`} alt={emp.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            ) : (
                              <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#0d6efd' }}>{emp.name[0]}</span>
                            )}
                          </div>
                        ))}
                        {(project.employees?.length || 0) > 4 && (
                          <span className="text-muted" style={{ fontSize: '0.7rem', alignSelf: 'center' }}>+{project.employees.length - 4}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="card-footer bg-transparent border-top-0 pt-0 pb-2 px-3 d-flex justify-content-end gap-1">
                    <button
                      className="btn btn-sm btn-light"
                      title="Edit"
                      onClick={(e) => { e.stopPropagation(); setEditingProject(project); setFormError(null); setModalOpen(true) }}
                    >
                      <i className="bi bi-pencil" />
                    </button>
                    <button
                      className="btn btn-sm btn-light text-danger"
                      title="Delete"
                      onClick={(e) => { e.stopPropagation(); setProjectToDelete(project); setDeleteDialogOpen(true) }}
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

      <AppModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingProject(null); setFormError(null) }}
        title={editingProject ? 'Edit Project' : 'New Project'}
      >
        <ProjectForm
          onSubmit={handleFormSubmit}
          defaultValues={editingProject}
          employees={employees}
          isEditing={!!editingProject}
          loading={formLoading}
          error={formError}
        />
      </AppModal>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setProjectToDelete(null) }}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        message={`Are you sure you want to delete "${projectToDelete?.title}"? This action cannot be undone.`}
      />
    </div>
  )
}

export default Projects
