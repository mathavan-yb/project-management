import React from 'react'
import { Modal, Button } from 'react-bootstrap'

function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText = 'Delete' }) {
  return (
    <Modal show={open} onHide={onClose} size="sm" centered>
      <Modal.Header closeButton>
        <Modal.Title className="fs-6 fw-semibold d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle-fill text-warning" />
          {title || 'Confirm Action'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-0">{message || 'Are you sure you want to proceed? This action cannot be undone.'}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" size="sm" onClick={onConfirm}>
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ConfirmDialog
