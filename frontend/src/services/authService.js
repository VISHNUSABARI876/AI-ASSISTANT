import api from './api'

export const authService = {
  async register(username, email, password) {
    const res = await api.post('/auth/register', { username, email, password })
    return res.data
  },

  async login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    return res.data
  },

  async getMe(token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const res = await api.get('/auth/me', { headers })
    return res.data
  },

  async updateProfile(data) {
    const res = await api.put('/auth/profile', data)
    return res.data
  },

  async changePassword(oldPassword, newPassword) {
    const res = await api.put('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    })
    return res.data
  },
}
