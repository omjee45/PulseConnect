import api from './api'

export const profileApi = {
  getProfile: (userId) => api.get(`/profile/${userId}`),
  updateProfile: (data) => api.put('/profile', data),
}
