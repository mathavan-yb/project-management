import { configureStore } from '@reduxjs/toolkit'
import employeeReducer from './slices/employeeSlice'
import projectReducer from './slices/projectSlice'
import taskReducer from './slices/taskSlice'

const store = configureStore({
  reducer: {
    employees: employeeReducer,
    projects: projectReducer,
    tasks: taskReducer,
  },
})

export default store
