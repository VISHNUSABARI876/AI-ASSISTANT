import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Bot, User, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react'
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
    { id: 'reg-username', name: 'username', label: 'Username', type: 'text', icon: User, placeholder: 'johndoe' },
    { id: 'reg-email', name: 'email', label: 'Email Address', type: 'email', icon: Mail, placeholder: 'name@example.com' },
    { id: 'reg-password', name: 'password', label: 'Password', type: 'password', icon: Lock, placeholder: '••••••••' },
    { id: 'reg-confirm', name: 'confirm', label: 'Confirm Password', type: 'password', icon: Lock, placeholder: '••••••••' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050816] text-white p-6 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary-600/20 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-600/20 blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      <div className="w-full max-w-md glass-card border border-white/10 p-8 animate-fade-in relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500  mb-2">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white flex items-center justify-center gap-2">
            Initialize AI Account <Sparkles className="w-4 h-4 text-accent-400" />
          </h1>
          <p className="text-xs text-slate-400">Create your free AI profile</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs" noValidate>
          {fields.map(({ id, name, label, type, icon: Icon, placeholder }) => (
            <div key={name}>
              <label htmlFor={id} className="block font-semibold text-slate-300 mb-1">{label}</label>
              <div className="relative">
                <Icon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id={id}
                  type={(name === 'password' || name === 'confirm') && showPassword ? 'text' : type}
                  className={`input-os pl-10 ${errors[name] ? 'border-red-500' : ''}`}
                  placeholder={placeholder}
                  value={form[name]}
                  onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                />
                {(name === 'password' || name === 'confirm') && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
              {errors[name] && <p className="text-red-400 text-[11px] mt-1">{errors[name]}</p>}
            </div>
          ))}

          <button
            id="register-submit"
            type="submit"
            className="btn-os-primary w-full py-3 text-sm font-bold "
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Create AI Account'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 pt-2">
          Already registered?{' '}
          <Link to="/login" className="text-primary-400 font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
