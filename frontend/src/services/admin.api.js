import api from './api'

export const adminApi = {
  getUnverifiedUsers: () => api.get('/admin/users/unverified'),
  verifyUser: (userId) => api.put(`/admin/users/${userId}/verify`),
  rejectUser: (userId) => api.put(`/admin/users/${userId}/reject`),
}
