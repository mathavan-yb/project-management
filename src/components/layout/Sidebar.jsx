import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', path: '/', icon: 'bi-speedometer2' },
  { label: 'Employees', path: '/employees', icon: 'bi-people-fill' },
  { label: 'Projects', path: '/projects', icon: 'bi-folder-fill' },
]

function Sidebar({ onNavigate, mobileMode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const handleNav = (path) => {
    navigate(path)
    if (onNavigate) onNavigate()
  }

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <div className={`app-sidebar${collapsed && !mobileMode ? ' collapsed' : ''}`}>
      <div className="sidebar-brand">
        <span className="sidebar-brand-text">PM Dashboard</span>
        {!mobileMode && (
          <button
            className="btn btn-sm btn-light p-1"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <i className={`bi ${collapsed ? 'bi-layout-sidebar' : 'bi-layout-sidebar-reverse'}`} />
          </button>
        )}
      </div>

      <nav className="py-2">
        {navItems.map((item) => (
          <div
            key={item.path}
            className={`sidebar-nav-item${isActive(item.path) ? ' active' : ''}`}
            onClick={() => handleNav(item.path)}
          >
            <i className={`bi ${item.icon}`} />
            <span className="sidebar-nav-label">{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar
