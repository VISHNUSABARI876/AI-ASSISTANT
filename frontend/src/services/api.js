import axios from 'axios'

// Use relative /api so Vite's dev-server proxy forwards to Flask on port 5000.
// This avoids all browser CORS checks during development.
// For production, set VITE_API_URL to the absolute backend URL (e.g. https://api.example.com/api).
const BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL   // absolute URL set explicitly (production)
  : '/api'                          // relative — routed through Vite proxy (development)

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // 60s — AI responses can take a while
})

// Attach JWT to every request
api.interceptors.request.use((config) => {
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
