import api from './api'

export const donorsApi = {
  getNearby: ({ lat, lng, distance, bloodGroup, organ } = {}) =>
    api.get('/donors/nearby', { params: { lat, lng, distance, bloodGroup, organ } }),
}
