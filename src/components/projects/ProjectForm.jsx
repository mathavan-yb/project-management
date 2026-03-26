import React, { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Spinner, Alert } from 'react-bootstrap'

const schema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  startDate: yup.string().required('Start date is required'),
  endDate: yup
    .string()
    .required('End date is required')
    .test('after-start', 'End date must be after start date', function (value) {
      const { startDate } = this.parent
      if (!startDate || !value) return true
      return new Date(value) > new Date(startDate)
    }),
})

function EmployeeMultiSelect({ employees, selected, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (emp) => {
    const exists = selected.some((s) => s._id === emp._id)
    onChange(exists ? selected.filter((s) => s._id !== emp._id) : [...selected, emp])
  }

  const isSelected = (emp) => selected.some((s) => s._id === emp._id)

  return (
    <div className="employee-select-dropdown" ref={ref}>
      <div
        className="form-control d-flex flex-wrap gap-1 align-items-center"
        style={{ minHeight: 38, cursor: 'pointer' }}
        onClick={() => setOpen(!open)}
      >
        {selected.length === 0 ? (
          <span className="text-muted" style={{ fontSize: '0.9rem' }}>Select employees...</span>
        ) : (
          selected.map((emp) => (
            <span key={emp._id} className="badge bg-primary d-flex align-items-center gap-1" style={{ fontWeight: 500 }}>
              {emp.name}
              <i
                className="bi bi-x"
                style={{ cursor: 'pointer' }}
                onMouseDown={(e) => { e.stopPropagation(); toggle(emp) }}
              />
            </span>
          ))
        )}
        <i className={`bi bi-chevron-${open ? 'up' : 'down'} ms-auto text-muted`} />
      </div>
      {open && (
        <div className="employee-select-menu">
          {(employees || []).length === 0 ? (
            <div className="employee-select-item text-muted">No employees available</div>
          ) : (
            (employees || []).map((emp) => (
              <div
                key={emp._id}
                className="employee-select-item"
                onClick={() => toggle(emp)}
              >
                <input
                  type="checkbox"
                  checked={isSelected(emp)}
                  readOnly
                  className="form-check-input me-1"
                />
                <div
                  className="avatar-circle avatar-circle-sm d-inline-flex align-items-center justify-content-center"
                  style={{ background: '#e7f1ff' }}
                >
                  {emp.profileImage ? (
                    <img src={`/uploads/${emp.profileImage}`} alt={emp.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  ) : (
                    <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#0d6efd' }}>{emp.name[0]}</span>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{emp.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>{emp.position}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function ProjectForm({ onSubmit, defaultValues, employees, isEditing, loading, error }) {
  const [logoPreview, setLogoPreview] = useState(null)
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const logoInputRef = useRef()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      startDate: defaultValues?.startDate
        ? new Date(defaultValues.startDate).toISOString().split('T')[0]
        : '',
      endDate: defaultValues?.endDate
        ? new Date(defaultValues.endDate).toISOString().split('T')[0]
        : '',
    },
  })

  useEffect(() => {
    if (defaultValues?.logo) setLogoPreview(`/uploads/${defaultValues.logo}`)
    if (defaultValues?.employees) setSelectedEmployees(defaultValues.employees)
  }, [defaultValues])

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setLogoPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleFormSubmit = (data) => {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('description', data.description)
    formData.append('startDate', data.startDate)
    formData.append('endDate', data.endDate)
    selectedEmployees.forEach((emp) => formData.append('employees', emp._id))
    if (logoInputRef.current?.files[0]) {
      formData.append('logo', logoInputRef.current.files[0])
    }
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      {error && <Alert variant="danger" className="py-2">{error}</Alert>}

      {/* Logo Upload */}
      <div className="d-flex align-items-center gap-3 mb-3">
        <div
          className="project-logo d-flex align-items-center justify-content-center"
          style={{ width: 72, height: 72, borderRadius: 10, border: '1px solid #dee2e6', background: '#f8f9fa', overflow: 'hidden', flexShrink: 0 }}
        >
          {logoPreview ? (
            <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <i className="bi bi-image text-secondary fs-3" />
          )}
        </div>
        <label className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-upload me-1" />
          {isEditing ? 'Change Logo' : 'Upload Logo'}
          <input
            ref={logoInputRef}
            type="file"
            className="d-none"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleLogoChange}
          />
        </label>
      </div>

      <div className="mb-3">
        <label className="form-label fw-medium">Project Title <span className="text-danger">*</span></label>
        <input
          type="text"
          className={`form-control ${errors.title ? 'is-invalid' : ''}`}
          placeholder="Enter project title"
          {...register('title')}
        />
        {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label fw-medium">Description <span className="text-danger">*</span></label>
        <textarea
          className={`form-control ${errors.description ? 'is-invalid' : ''}`}
          rows={3}
          placeholder="Describe the project..."
          {...register('description')}
        />
        {errors.description && <div className="invalid-feedback">{errors.description.message}</div>}
      </div>

      <div className="row g-3 mb-3">
        <div className="col-6">
          <label className="form-label fw-medium">Start Date <span className="text-danger">*</span></label>
          <input
            type="date"
            className={`form-control ${errors.startDate ? 'is-invalid' : ''}`}
            {...register('startDate')}
          />
          {errors.startDate && <div className="invalid-feedback">{errors.startDate.message}</div>}
        </div>
        <div className="col-6">
          <label className="form-label fw-medium">End Date <span className="text-danger">*</span></label>
          <input
            type="date"
            className={`form-control ${errors.endDate ? 'is-invalid' : ''}`}
            {...register('endDate')}
          />
          {errors.endDate && <div className="invalid-feedback">{errors.endDate.message}</div>}
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label fw-medium">Assign Employees</label>
        <EmployeeMultiSelect
          employees={employees}
          selected={selectedEmployees}
          onChange={setSelectedEmployees}
        />
      </div>

      <button type="submit" className="btn btn-primary w-100 mt-1" disabled={loading}>
        {loading ? (
          <><Spinner size="sm" className="me-2" />{isEditing ? 'Updating...' : 'Creating...'}</>
        ) : isEditing ? 'Update Project' : 'Create Project'}
      </button>
    </form>
  )
}

export default ProjectForm
