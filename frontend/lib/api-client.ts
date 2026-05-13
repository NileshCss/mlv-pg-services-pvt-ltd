import axios, { AxiosInstance, AxiosError } from 'axios'

// ─────────────────────────────────────────────────────────
// API Client Configuration
// ─────────────────────────────────────────────────────────

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// ─────────────────────────────────────────────────────────
// Create Axios Instance
// ─────────────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─────────────────────────────────────────────────────────
// Request Interceptor - Add Auth Token
// ─────────────────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ─────────────────────────────────────────────────────────
// Response Interceptor - Handle Errors
// ─────────────────────────────────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized - Redirect to login
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access Forbidden')
    }

    return Promise.reject(error)
  }
)

// ─────────────────────────────────────────────────────────
// API Methods
// ─────────────────────────────────────────────────────────

export const api = {
  // Auth endpoints
  auth: {
    login: (email: string, password: string) =>
      apiClient.post('/auth/login', { email, password }),
    register: (data: any) => apiClient.post('/auth/register', data),
    logout: () => apiClient.post('/auth/logout'),
    refreshToken: () => apiClient.post('/auth/refresh'),
  },

  // User endpoints
  users: {
    getProfile: () => apiClient.get('/users/profile'),
    updateProfile: (data: any) => apiClient.put('/users/profile', data),
    getAll: (params?: any) => apiClient.get('/users', { params }),
    getById: (id: string) => apiClient.get(`/users/${id}`),
    create: (data: any) => apiClient.post('/users', data),
    update: (id: string, data: any) => apiClient.put(`/users/${id}`, data),
    delete: (id: string) => apiClient.delete(`/users/${id}`),
  },

  // Booking endpoints
  bookings: {
    getAll: (params?: any) => apiClient.get('/bookings', { params }),
    getById: (id: string) => apiClient.get(`/bookings/${id}`),
    create: (data: any) => apiClient.post('/bookings', data),
    update: (id: string, data: any) => apiClient.put(`/bookings/${id}`, data),
    delete: (id: string) => apiClient.delete(`/bookings/${id}`),
  },

  // Room endpoints
  rooms: {
    getAll: (params?: any) => apiClient.get('/rooms', { params }),
    getById: (id: string) => apiClient.get(`/rooms/${id}`),
    create: (data: any) => apiClient.post('/rooms', data),
    update: (id: string, data: any) => apiClient.put(`/rooms/${id}`, data),
    delete: (id: string) => apiClient.delete(`/rooms/${id}`),
  },
}

export default apiClient
