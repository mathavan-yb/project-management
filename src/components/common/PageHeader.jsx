import React from 'react'

function PageHeader({ title, actionLabel, onAction }) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h4 className="fw-bold mb-0">{title}</h4>
      {actionLabel && onAction && (
        <button className="btn btn-primary" onClick={onAction}>
          <i className="bi bi-plus-lg me-1" />
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default PageHeader
