import axios from 'axios'
import useAuthStore from '@/store/authStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8800'

/**
 * Single configured Axios instance.
 * ALL API calls in the app must go through this — never create a new axios instance in a component.
 */
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true, // sends HTTP-only cookie on every request
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // 10 second timeout
})

// ─── Response interceptor ─────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // On 401 anywhere — clear auth state immediately so UI updates
    if (error.response?.status === 401) {
      useAuthStore.getState().clearUser()
    }
    return Promise.reject(error)
  }
)

export default api
