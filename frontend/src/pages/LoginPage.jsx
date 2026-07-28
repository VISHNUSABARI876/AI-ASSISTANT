import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Bot, Mail, Lock, Eye, EyeOff, Sparkles, Shield, Cpu, Code, FileText } from 'lucide-react'
import { toast } from 'react-toastify'
import LoadingSpinner from '../components/UI/LoadingSpinner'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dark">
      <div className="min-h-screen flex bg-aurora-mesh text-white relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary-600/20 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-600/20 blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

        {/* Left branding panel */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative z-10 border-r border-white/10 glass-panel">
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center  animate-pulse-slow">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white flex items-center gap-2">
                AI <Sparkles className="w-4 h-4 text-accent-400" />
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
              The Next Generation <br />
              <span className="text-primary-300">Neural Operating System</span>
            </h1>

            <p className="mt-4 text-slate-300 text-base max-w-lg leading-relaxed">
              Empower your intelligence with real-time Groq streaming, code execution sandboxes, vector document Q&A, and custom AI personas.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Bot, label: 'Groq LLM', desc: 'Llama-3 streaming' },
              { icon: Code, label: 'Code Generator', desc: 'Sandbox execution' },
              { icon: FileText, label: 'RAG Doc Q&A', desc: 'PDF Intelligence' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-lg shadow-black/10">
                <Icon className="w-6 h-6 mx-auto text-primary-500 mb-2" />
                <p className="font-bold text-slate-800 text-xs">{label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Login Form Portal */}
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <div className="w-full max-w-md glass-card border border-white/10 p-8 animate-fade-in space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500  mb-2">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-white">Access Neural Workspace</h2>
              <p className="text-xs text-slate-400">Sign in to your AI session</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs" noValidate>
              <div>
                <label htmlFor="login-email" className="block font-semibold text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-email"
                    type="email"
                    className={`input-os pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <p className="text-red-400 text-[11px] mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="login-password" className="block font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className={`input-os pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-[11px] mt-1">{errors.password}</p>}
              </div>

              <button
                id="login-submit"
                type="submit"
                className="btn-os-primary w-full py-3 text-sm font-bold "
                disabled={loading}
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Authenticate & Launch'}
              </button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-900/80 backdrop-blur-sm px-3 text-slate-500">or continue with</span>
              </div>
            </div>

            <a
              href={`${import.meta.env.VITE_API_URL || '/api'}/auth/google/login`}
              className="flex items-center justify-center gap-3 w-full py-2.5 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 text-sm font-semibold text-slate-300 hover:text-white"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </a>

            <p className="text-center text-xs text-slate-400 pt-2">
              Don't have an identity yet?{' '}
              <Link to="/register" className="text-primary-400 font-bold hover:underline">
                Create AI Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
