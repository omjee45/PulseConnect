import api from './api'

export const connectionsApi = {
  sendRequest: (receiverId, introMessage) =>
    api.post('/connections/request', { receiverId, introMessage }),
  getIncoming: () => api.get('/connections/incoming'),
  getOutgoing: () => api.get('/connections/outgoing'),
  acceptRequest: (requestId) => api.put(`/connections/${requestId}/accept`),
  rejectRequest: (requestId) => api.put(`/connections/${requestId}/reject`),
}
