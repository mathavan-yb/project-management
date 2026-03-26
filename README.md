# Project Management Dashboard

A full-featured Project Management Dashboard built with React, supporting complete CRUD operations for Projects, Tasks, and Employees, with a Kanban-style drag-and-drop task board.

---

## Overview

This application allows teams to manage their projects and tasks efficiently. Employees are assigned to projects, and tasks are linked to both projects and their assigned employees. The dashboard provides a visual Kanban board with drag-and-drop support to track task progress across multiple stages.

---

## Features

### Employee Management
- Create, view, edit, and delete employees
- Fields: Name, Position, Official Email (unique), Profile Image
- Full form validation with Yup

### Project Management
- Create, view (list & detail), edit, and delete projects
- Fields: Project Title, Description, Logo, Start & End Date/Time, Assigned Employees
- Only assigned employees can be selected when creating tasks

### Task Management
- Tasks are linked to existing projects only
- Fields: Task Title, Description, Assigned Employee, ETA, Reference Images
- Create, view, edit, and delete tasks

### Kanban Dashboard
- Columns: **Need to Do**, **In Progress**, **Need for Test**, **Completed**, **Re-open**
- Filter tasks by project via dropdown
- Drag-and-drop tasks between columns (powered by dnd-kit)
- Task cards display: title, assigned employee, ETA, and image

### Validation
- All fields are mandatory
- Email must be valid and unique
- Start Date must be before End Date
- Only project-assigned employees are selectable for tasks

---

## Tech Stack

| Category | Technology |
|---|---|
| UI Framework | React 18 (Functional Components + Hooks) |
| Routing | React Router DOM v6 |
| State Management | Redux Toolkit |
| Drag & Drop | dnd-kit (`@dnd-kit/core`, `@dnd-kit/sortable`) |
| Forms & Validation | React Hook Form + Yup |
| UI Library | Bootstrap 5 + Bootstrap Icons |
| HTTP Client | Axios |
| Build Tool | Vite |

---

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── axios.js              # Axios instance configuration
│   ├── components/
│   │   ├── common/
│   │   │   ├── AppModal.jsx      # Reusable modal wrapper
│   │   │   ├── ConfirmDialog.jsx # Reusable confirmation dialog
│   │   │   └── PageHeader.jsx    # Page header with title/actions
│   │   ├── dashboard/
│   │   │   ├── BoardColumn.jsx   # Kanban column (droppable)
│   │   │   ├── TaskCard.jsx      # Task card (draggable)
│   │   │   └── TaskColumn.jsx    # Column with task list
│   │   ├── employees/
│   │   │   └── EmployeeForm.jsx  # Create/edit employee form
│   │   ├── layout/
│   │   │   ├── Layout.jsx        # App shell with sidebar
│   │   │   └── Sidebar.jsx       # Navigation sidebar
│   │   ├── projects/
│   │   │   └── ProjectForm.jsx   # Create/edit project form
│   │   └── tasks/
│   │       └── TaskForm.jsx      # Create/edit task form
│   ├── pages/
│   │   ├── Dashboard.jsx         # Kanban board page
│   │   ├── Employees.jsx         # Employee list page
│   │   ├── ProjectDetail.jsx     # Single project detail & tasks
│   │   └── Projects.jsx          # Projects list page
│   ├── store/
│   │   ├── index.js              # Redux store configuration
│   │   └── slices/
│   │       ├── employeeSlice.js  # Employee state & async thunks
│   │       ├── projectSlice.js   # Project state & async thunks
│   │       └── taskSlice.js      # Task state & async thunks
│   ├── App.jsx                   # Route definitions
│   ├── main.jsx                  # App entry point
│   └── index.css
├── index.html
├── package.json
└── vite.config.js
```

---

## Routes

| Path | Page |
|---|---|
| `/` | Dashboard (Kanban board) |
| `/employees` | Employee list |
| `/projects` | Project list |
| `/projects/:id` | Project detail & tasks |

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn
- A running backend API (update the base URL in `src/api/axios.js`)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd frontend

# Install dependencies
npm install
```

### Running the App

```bash
# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## Configuration

Update the API base URL in [src/api/axios.js](src/api/axios.js) to point to your backend:

```js
const instance = axios.create({
  baseURL: 'http://localhost:5000/api', // change this to your backend URL
});
```

---

## Screenshots

> Add screenshots or a GIF of the running application here.

---

## Live Demo

> Add the deployed URL here if available.
