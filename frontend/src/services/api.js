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
  timeout: 120000, // 120s — AI responses and Render cold starts can take a while
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
    let errorMessage = 'An unexpected error occurred.';
    
    if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
      errorMessage = 'Request timed out. Please try again.';
      console.error('[API Timeout]', err);
    } else if (err.message === 'Network Error') {
      errorMessage = 'Network error or CORS failure. Backend may be unreachable.';
      console.error('[API Network/CORS Error]', err);
    } else if (err.response) {
      errorMessage = `HTTP Error ${err.response.status}: ${err.response.data?.error || err.message}`;
      console.error(`[API HTTP Error ${err.response.status}]`, err.response.data);
      if (err.response.status === 401 && !window.location.pathname.startsWith('/login')) {
        localStorage.removeItem('ai_token');
        window.location.replace('/login');
      }
    } else {
      console.error('[API Unknown Error]', err);
    }
    
    // Attach customized message so UI toasts show the exact reason (e.g. timeout, CORS)
    if (!err.response) {
      err.response = { data: { error: errorMessage } };
    } else if (!err.response.data) {
      err.response.data = { error: errorMessage };
    } else if (!err.response.data.error) {
      err.response.data.error = errorMessage;
    }
    
    err.customMessage = errorMessage;
    
    return Promise.reject(err);
  }
)

export default api
