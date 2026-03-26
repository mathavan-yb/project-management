import React, { useState } from 'react'
import { Offcanvas } from 'react-bootstrap'
import Sidebar from './Sidebar'

function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <div className="mobile-topbar">
        <button
          className="btn btn-light btn-sm"
          onClick={() => setMobileOpen(true)}
        >
          <i className="bi bi-list fs-5" />
        </button>
        <span className="fw-bold text-primary">PM Dashboard</span>
      </div>

      <Offcanvas show={mobileOpen} onHide={() => setMobileOpen(false)} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="text-primary fw-bold">PM Dashboard</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <Sidebar onNavigate={() => setMobileOpen(false)} mobileMode />
        </Offcanvas.Body>
      </Offcanvas>

      {/* Desktop layout */}
      <div className="app-layout">
        <Sidebar />
        <main className="app-main">
          {children}
        </main>
      </div>
    </>
  )
}

export default Layout
