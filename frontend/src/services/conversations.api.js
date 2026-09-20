import api from './api'

export const conversationsApi = {
  getAll: () => api.get('/conversations'),
  getMessages: (conversationId) => api.get(`/conversations/${conversationId}/messages`),
}
