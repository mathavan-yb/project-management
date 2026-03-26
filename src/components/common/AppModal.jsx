import React from 'react'
import { Modal } from 'react-bootstrap'

function AppModal({ open, onClose, title, children, maxWidth = 'sm' }) {
  const sizeMap = { xs: 'sm', sm: 'md', md: 'lg', lg: 'xl' }
  const size = sizeMap[maxWidth] || 'md'

  return (
    <Modal show={open} onHide={onClose} size={size} centered>
      <Modal.Header closeButton>
        <Modal.Title className="fs-5 fw-semibold">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
    </Modal>
  )
}

export default AppModal
