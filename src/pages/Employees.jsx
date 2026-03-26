import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Spinner, Alert } from 'react-bootstrap'
import {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../store/slices/employeeSlice'
import PageHeader from '../components/common/PageHeader'
import AppModal from '../components/common/AppModal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import EmployeeForm from '../components/employees/EmployeeForm'

function Employees() {
  const dispatch = useDispatch()
  const { employees, loading, error } = useSelector((state) => state.employees)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState(null)

  useEffect(() => { dispatch(fetchEmployees()) }, [dispatch])

  const handleDeleteConfirm = async () => {
    if (employeeToDelete) {
      await dispatch(deleteEmployee(employeeToDelete._id))
      setDeleteDialogOpen(false)
      setEmployeeToDelete(null)
    }
  }

  const handleFormSubmit = async (formData) => {
    setFormLoading(true)
    setFormError(null)
    try {
      let result
      if (editingEmployee) {
        result = await dispatch(updateEmployee({ id: editingEmployee._id, formData }))
        if (updateEmployee.rejected.match(result)) { setFormError(result.payload); return }
      } else {
        result = await dispatch(createEmployee(formData))
        if (createEmployee.rejected.match(result)) { setFormError(result.payload); return }
      }
      setModalOpen(false)
      setEditingEmployee(null)
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Employees"
        actionLabel="Add Employee"
        onAction={() => { setEditingEmployee(null); setFormError(null); setModalOpen(true) }}
      />

      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

      {loading && employees.length === 0 ? (
        <div className="d-flex justify-content-center pt-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-3">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="fw-semibold">Employee</th>
                  <th className="fw-semibold">Position</th>
                  <th className="fw-semibold">Email</th>
                  <th className="fw-semibold">Joined</th>
                  <th className="fw-semibold text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-5">
                      No employees found. Add your first employee!
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp._id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="avatar-circle d-inline-flex align-items-center justify-content-center" style={{ background: '#e7f1ff' }}>
                            {emp.profileImage ? (
                              <img src={`/uploads/${emp.profileImage}`} alt={emp.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            ) : (
                              <span style={{ fontWeight: 600, color: '#0d6efd', fontSize: '0.85rem' }}>{emp.name[0]}</span>
                            )}
                          </div>
                          <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>{emp.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border" style={{ fontWeight: 500 }}>
                          {emp.position}
                        </span>
                      </td>
                      <td className="text-muted" style={{ fontSize: '0.875rem' }}>{emp.email}</td>
                      <td className="text-muted" style={{ fontSize: '0.875rem' }}>
                        {new Date(emp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-light me-1"
                          title="Edit"
                          onClick={() => { setEditingEmployee(emp); setFormError(null); setModalOpen(true) }}
                        >
                          <i className="bi bi-pencil" />
                        </button>
                        <button
                          className="btn btn-sm btn-light text-danger"
                          title="Delete"
                          onClick={() => { setEmployeeToDelete(emp); setDeleteDialogOpen(true) }}
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AppModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingEmployee(null); setFormError(null) }}
        title={editingEmployee ? 'Edit Employee' : 'Add Employee'}
      >
        <EmployeeForm
          onSubmit={handleFormSubmit}
          defaultValues={editingEmployee}
          isEditing={!!editingEmployee}
          loading={formLoading}
          error={formError}
        />
      </AppModal>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setEmployeeToDelete(null) }}
        onConfirm={handleDeleteConfirm}
        title="Delete Employee"
        message={`Are you sure you want to delete "${employeeToDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  )
}

export default Employees
