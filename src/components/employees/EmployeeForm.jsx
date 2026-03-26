import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Spinner, Alert } from 'react-bootstrap'

const schema = yup.object({
  name: yup.string().required('Name is required'),
  position: yup.string().required('Position is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  profileImage: yup
    .mixed()
    .test('required', 'Profile image is required', function (value) {
      const { isEditing } = this.options.context || {}
      if (isEditing) return true
      return value && value.length > 0
    }),
})

function AvatarPreview({ src, name }) {
  return (
    <div
      className="avatar-circle avatar-circle-xl mx-auto mb-2 d-flex align-items-center justify-content-center"
      style={{ background: src ? 'transparent' : '#e9ecef' }}
    >
      {src ? (
        <img src={src} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
      ) : (
        <i className="bi bi-person-fill text-secondary" style={{ fontSize: '2.5rem' }} />
      )}
    </div>
  )
}

function EmployeeForm({ onSubmit, defaultValues, isEditing, loading, error }) {
  const [imagePreview, setImagePreview] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    context: { isEditing },
    defaultValues: {
      name: defaultValues?.name || '',
      position: defaultValues?.position || '',
      email: defaultValues?.email || '',
    },
  })

  useEffect(() => {
    if (defaultValues?.profileImage) {
      setImagePreview(`/uploads/${defaultValues.profileImage}`)
    }
  }, [defaultValues])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleFormSubmit = (data) => {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('position', data.position)
    formData.append('email', data.email)
    if (data.profileImage && data.profileImage[0]) {
      formData.append('profileImage', data.profileImage[0])
    }
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      {error && <Alert variant="danger" className="py-2">{error}</Alert>}

      <div className="text-center mb-3">
        <AvatarPreview src={imagePreview} />
        <label className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-camera me-1" />
          {isEditing ? 'Change Photo' : 'Upload Photo'}
          <input
            type="file"
            className="d-none"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            {...register('profileImage', { onChange: handleImageChange })}
          />
        </label>
        {errors.profileImage && (
          <div className="text-danger small mt-1">{errors.profileImage.message}</div>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label fw-medium">Full Name <span className="text-danger">*</span></label>
        <input
          type="text"
          className={`form-control ${errors.name ? 'is-invalid' : ''}`}
          placeholder="Enter full name"
          {...register('name')}
        />
        {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label fw-medium">Position <span className="text-danger">*</span></label>
        <input
          type="text"
          className={`form-control ${errors.position ? 'is-invalid' : ''}`}
          placeholder="e.g. Frontend Developer"
          {...register('position')}
        />
        {errors.position && <div className="invalid-feedback">{errors.position.message}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label fw-medium">Official Email <span className="text-danger">*</span></label>
        <input
          type="email"
          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
          placeholder="email@company.com"
          {...register('email')}
        />
        {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
      </div>

      <button type="submit" className="btn btn-primary w-100 mt-2" disabled={loading}>
        {loading ? (
          <><Spinner size="sm" className="me-2" />{isEditing ? 'Updating...' : 'Adding...'}</>
        ) : isEditing ? 'Update Employee' : 'Add Employee'}
      </button>
    </form>
  )
}

export default EmployeeForm
