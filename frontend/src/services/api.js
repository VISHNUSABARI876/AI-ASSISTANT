import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // 60s — AI responses can take a while
})

// Attach JWT to every request
api.interceptors.request.use((config) => {
  // Strip leading slash if baseURL is absolute to prevent Axios from discarding /api suffix
  if (
    config.baseURL &&
    config.baseURL.startsWith('http') &&
    config.url &&
    config.url.startsWith('/')
  ) {
    config.url = config.url.substring(1)
  }

  const token = localStorage.getItem('ai_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Global error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ai_token')
      // Reload to trigger auth check (avoids circular dep with context)
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
