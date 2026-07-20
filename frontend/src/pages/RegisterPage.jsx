import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  RiRobot2Line, RiUserLine, RiMailLine, RiLockLine, RiEyeLine, RiEyeOffLine,
} from 'react-icons/ri'
import { toast } from 'react-toastify'
import LoadingSpinner from '../components/UI/LoadingSpinner'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.username || form.username.length < 3) e.username = 'Username must be at least 3 characters'
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email is required'
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      const serverErrors = err.response?.data?.errors
      if (serverErrors) {
        setErrors(serverErrors)
      } else {
        toast.error(err.response?.data?.error || 'Registration failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { id: 'reg-username', name: 'username', label: 'Username', type: 'text', icon: RiUserLine, placeholder: 'johndoe', autoComplete: 'username' },
    { id: 'reg-email', name: 'email', label: 'Email', type: 'email', icon: RiMailLine, placeholder: 'you@example.com', autoComplete: 'email' },
    { id: 'reg-password', name: 'password', label: 'Password', type: 'password', icon: RiLockLine, placeholder: '••••••••', autoComplete: 'new-password' },
    { id: 'reg-confirm', name: 'confirm', label: 'Confirm Password', type: 'password', icon: RiLockLine, placeholder: '••••••••', autoComplete: 'new-password' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-800 p-6">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-glow mb-4">
            <RiRobot2Line className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Create account</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Join AI Assistant — it's free</p>
        </div>

        {/* Card */}
        <div className="card p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {fields.map(({ id, name, label, type, icon: Icon, placeholder, autoComplete }) => (
              <div key={name}>
                <label htmlFor={id} className="label">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                  <input
                    id={id}
                    type={
                      (name === 'password' || name === 'confirm') && showPassword ? 'text' : type
                    }
                    className={`input pl-10 ${errors[name] ? 'input-error' : ''}`}
                    placeholder={placeholder}
                    value={form[name]}
                    onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                    autoComplete={autoComplete}
                  />
                  {(name === 'password' || name === 'confirm') && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <RiEyeOffLine className="text-lg" /> : <RiEyeLine className="text-lg" />}
                    </button>
                  )}
                </div>
                {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
              </div>
            ))}

            <button
              id="register-submit"
              type="submit"
              className="btn-primary w-full py-3 text-base"
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
