import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const fetchEmployees = createAsyncThunk(
  'employees/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/employees')
      return response.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

export const createEmployee = createAsyncThunk(
  'employees/create',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/employees', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

export const updateEmployee = createAsyncThunk(
  'employees/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/employees/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

export const deleteEmployee = createAsyncThunk(
  'employees/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/employees/${id}`)
      return id
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

const employeeSlice = createSlice({
  name: 'employees',
  initialState: {
    employees: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // fetchEmployees
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false
        state.employees = action.payload
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    // createEmployee
    builder
      .addCase(createEmployee.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.loading = false
        state.employees.unshift(action.payload)
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    // updateEmployee
    builder
      .addCase(updateEmployee.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loading = false
        const index = state.employees.findIndex((e) => e._id === action.payload._id)
        if (index !== -1) {
          state.employees[index] = action.payload
        }
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    // deleteEmployee
    builder
      .addCase(deleteEmployee.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.loading = false
        state.employees = state.employees.filter((e) => e._id !== action.payload)
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError } = employeeSlice.actions
export default employeeSlice.reducer
