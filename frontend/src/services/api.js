import axios from 'axios'
import useAuthStore from '@/store/authStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8800'


const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true, // sends HTTP-only cookie on every request
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // 10 second timeout
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearUser()
    }
    return Promise.reject(error)
  }
)

export default api
