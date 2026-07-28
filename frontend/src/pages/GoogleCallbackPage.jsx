import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Bot } from 'lucide-react'
import { toast } from 'react-toastify'

export default function GoogleCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { loginWithToken } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error) {
      toast.error('Google sign-in was cancelled or failed.')
      navigate('/login', { replace: true })
      return
    }

    if (!token) {
      toast.error('No authentication token received.')
      navigate('/login', { replace: true })
      return
    }

    ;(async () => {
      try {
        await loginWithToken(token)
        toast.success('Signed in with Google!')
        navigate('/dashboard', { replace: true })
      } catch {
        toast.error('Failed to complete Google sign-in.')
        navigate('/login', { replace: true })
      }
    })()
  }, [searchParams, navigate, loginWithToken])

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center  animate-pulse-slow mx-auto">
          <Bot className="w-8 h-8 text-white" />
        </div>
        <p className="text-slate-300 text-lg font-semibold">Signing you in...</p>
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  )
}