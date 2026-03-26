import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Spinner, Alert } from 'react-bootstrap'

const schema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  assignedTo: yup.string().required('Assigned employee is required'),
  eta: yup.string().required('ETA is required'),
})

const statusOptions = [
  { value: 'need_to_do', label: 'Need to Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'need_for_test', label: 'Need for Test' },
  { value: 'completed', label: 'Completed' },
  { value: 'reopen', label: 'Re-open' },
]

function TaskForm({ onSubmit, defaultValues, projectEmployees, isEditing, loading, error }) {
  const [imagePreviews, setImagePreviews] = useState([])
  const [selectedFiles, setSelectedFiles] = useState([])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      assignedTo: defaultValues?.assignedTo?._id || defaultValues?.assignedTo || '',
      eta: defaultValues?.eta
        ? new Date(defaultValues.eta).toISOString().split('T')[0]
        : '',
      status: defaultValues?.status || 'need_to_do',
    },
  })

  useEffect(() => {
    if (defaultValues?.referenceImages?.length > 0) {
      setImagePreviews(
        defaultValues.referenceImages.map((img) => ({
          src: `/uploads/${img}`,
          filename: img,
          existing: true,
        }))
      )
    }
  }, [defaultValues])

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    const newPreviews = []
    const newFiles = []

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push({ src: reader.result, file, existing: false })
        if (newPreviews.length === files.length) {
          setImagePreviews((prev) => [...prev, ...newPreviews])
        }
      }
      reader.readAsDataURL(file)
      newFiles.push(file)
    })
    setSelectedFiles((prev) => [...prev, ...newFiles])
  }

  const removeImage = (index) => {
    const preview = imagePreviews[index]
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    if (!preview.existing) {
      setSelectedFiles((prev) => prev.filter((f) => f !== preview.file))
    }
  }

  const handleFormSubmit = (data) => {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('description', data.description)
    formData.append('assignedTo', data.assignedTo)
    formData.append('eta', data.eta)
    formData.append('status', data.status || 'need_to_do')

    selectedFiles.forEach((file) => formData.append('referenceImages', file))

    if (isEditing && defaultValues?.referenceImages) {
      const remainingExisting = imagePreviews.filter((p) => p.existing).map((p) => p.filename)
      const toRemove = defaultValues.referenceImages.filter(
        (img) => !remainingExisting.includes(img)
      )
      if (toRemove.length > 0) {
        formData.append('removeImages', JSON.stringify(toRemove))
      }
    }

    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      {error && <Alert variant="danger" className="py-2">{error}</Alert>}

      <div className="mb-3">
        <label className="form-label fw-medium">Task Title <span className="text-danger">*</span></label>
        <input
          type="text"
          className={`form-control ${errors.title ? 'is-invalid' : ''}`}
          placeholder="Enter task title"
          {...register('title')}
        />
        {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label fw-medium">Description <span className="text-danger">*</span></label>
        <textarea
          className={`form-control ${errors.description ? 'is-invalid' : ''}`}
          rows={3}
          placeholder="Describe the task..."
          {...register('description')}
        />
        {errors.description && <div className="invalid-feedback">{errors.description.message}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label fw-medium">Assign To <span className="text-danger">*</span></label>
        <select
          className={`form-select ${errors.assignedTo ? 'is-invalid' : ''}`}
          {...register('assignedTo')}
        >
          <option value="">Select employee...</option>
          {(projectEmployees || []).map((emp) => (
            <option key={emp._id} value={emp._id}>
              {emp.name} — {emp.position}
            </option>
          ))}
        </select>
        {errors.assignedTo && <div className="invalid-feedback">{errors.assignedTo.message}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label fw-medium">ETA <span className="text-danger">*</span></label>
        <input
          type="date"
          className={`form-control ${errors.eta ? 'is-invalid' : ''}`}
          {...register('eta')}
        />
        {errors.eta && <div className="invalid-feedback">{errors.eta.message}</div>}
      </div>

      {isEditing && (
        <div className="mb-3">
          <label className="form-label fw-medium">Status</label>
          <select className="form-select" {...register('status')}>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Reference Images */}
      <div className="mb-3">
        <label className="form-label fw-medium">Reference Images</label>
        <div>
          <label className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-images me-1" />
            Add Images
            <input
              type="file"
              className="d-none"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleImageChange}
            />
          </label>
        </div>

        {imagePreviews.length > 0 && (
          <div className="image-preview-grid">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="image-preview-item">
                <img src={preview.src} alt={`preview-${index}`} />
                <button
                  type="button"
                  className="image-preview-remove"
                  onClick={() => removeImage(index)}
                >
                  <i className="bi bi-x" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button type="submit" className="btn btn-primary w-100 mt-1" disabled={loading}>
        {loading ? (
          <><Spinner size="sm" className="me-2" />{isEditing ? 'Updating...' : 'Creating...'}</>
        ) : isEditing ? 'Update Task' : 'Create Task'}
      </button>
    </form>
  )
}

export default TaskForm
