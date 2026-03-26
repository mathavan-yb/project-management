import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/projects')
      return response.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

export const fetchProject = createAsyncThunk(
  'projects/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/projects/${id}`)
      return response.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

export const createProject = createAsyncThunk(
  'projects/create',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/projects', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

export const updateProject = createAsyncThunk(
  'projects/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/projects/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

export const deleteProject = createAsyncThunk(
  'projects/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/projects/${id}`)
      return id
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [],
    currentProject: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentProject: (state) => {
      state.currentProject = null
    },
  },
  extraReducers: (builder) => {
    // fetchProjects
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false
        state.projects = action.payload
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    // fetchProject
    builder
      .addCase(fetchProject.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.loading = false
        state.currentProject = action.payload
      })
      .addCase(fetchProject.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    // createProject
    builder
      .addCase(createProject.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false
        state.projects.unshift(action.payload)
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    // updateProject
    builder
      .addCase(updateProject.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false
        const index = state.projects.findIndex((p) => p._id === action.payload._id)
        if (index !== -1) {
          state.projects[index] = action.payload
        }
        if (state.currentProject?._id === action.payload._id) {
          state.currentProject = action.payload
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    // deleteProject
    builder
      .addCase(deleteProject.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false
        state.projects = state.projects.filter((p) => p._id !== action.payload)
        if (state.currentProject?._id === action.payload) {
          state.currentProject = null
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearCurrentProject } = projectSlice.actions
export default projectSlice.reducer
