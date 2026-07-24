import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'
import { toast } from 'react-toastify'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('ai_token'))
  const [loading, setLoading] = useState(true)

  // Verify token on mount
  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const data = await authService.getMe(token)
        setUser(data.user)
      } catch {
        // Token invalid or expired
        localStorage.removeItem('ai_token')
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    verify()
  }, [token])

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password)
    localStorage.setItem('ai_token', data.token)
    setToken(data.token)
    setUser(data.user)
    toast.success(`Welcome back, ${data.user.username}! 👋`)
    return data
  }, [])

  const register = useCallback(async (username, email, password) => {
    const data = await authService.register(username, email, password)
    localStorage.setItem('ai_token', data.token)
    setToken(data.token)
    setUser(data.user)
    toast.success(`Account created! Welcome, ${data.user.username}! 🎉`)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('ai_token')
    setToken(null)
    setUser(null)
    toast.info('You have been signed out.')
  }, [])

  const loginWithToken = useCallback(async (newToken) => {
    const data = await authService.getMe(newToken)
    localStorage.setItem('ai_token', newToken)
    setToken(newToken)
    setUser(data.user)
    return data
  }, [])

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser)
  }, [])

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    loginWithToken,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
