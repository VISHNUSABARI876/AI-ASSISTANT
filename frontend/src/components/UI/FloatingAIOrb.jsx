import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Bot,
  Terminal,
  Zap,
  FileText,
  Code,
  X,
  ArrowRight,
  Activity,
  Cpu,
} from 'lucide-react'

export default function FloatingAIOrb() {
  const [open, setOpen] = useState(false)
  const [orbPos, setOrbPos] = useState({ x: 0, y: 0 })
  const navigate = useNavigate()
  const orbRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window
      const offsetX = (e.clientX - innerWidth / 2) * 0.02
      const offsetY = (e.clientY - innerHeight / 2) * 0.02
      setOrbPos({ x: offsetX, y: offsetY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const quickActions = [
    { label: 'Start New Chat', icon: Bot, path: '/chat', desc: 'Direct assistant conversation' },
    { label: 'Summarize Document', icon: FileText, path: '/summarize', desc: 'Instant PDF & text analysis' },
    { label: 'Code Generator', icon: Code, path: '/codegen', desc: 'Interactive code playground' },
    { label: 'Prompt Library', icon: Terminal, path: '/prompts', desc: 'Curated AI prompts' },
  ]

  const handleAction = (path) => {
    navigate(path)
    setOpen(false)
  }

  return (
    <>
      {/* Floating Orb Button */}
      <div
        ref={orbRef}
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center transition-transform duration-300 ease-out cursor-pointer group"
        style={{ transform: `translate3d(${orbPos.x}px, ${orbPos.y}px, 0)` }}
        onClick={() => setOpen((prev) => !prev)}
        title="Open AI OS Assistant"
      >
        {/* Pulsing Outer Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 via-accent-500 to-secondary-400 blur-xl opacity-70 group-hover:opacity-100 animate-pulse-slow transition-opacity" />

        {/* Orb Inner Container */}
        <div className="relative w-14 h-14 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center shadow-glow overflow-hidden group-hover:scale-110 transition-transform">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/40 via-accent-500/30 to-secondary-500/20 animate-spin-slow" />
          <Sparkles className="w-6 h-6 text-white relative z-10 group-hover:rotate-12 transition-transform" />
        </div>
      </div>

      {/* Quick Commands Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg glass-card border border-white/10 p-6 shadow-glow-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    AI OS Command Hub <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </h3>
                  <p className="text-xs text-slate-400">Quick actions & system diagnostics</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="btn-os-ghost p-2 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions List */}
            <div className="space-y-2 mb-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">Fast Commands</p>
              {quickActions.map(({ label, icon: Icon, path, desc }) => (
                <button
                  key={path}
                  onClick={() => handleAction(path)}
                  className="w-full p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-primary-500/40 flex items-center justify-between group transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-500/20 text-primary-400 group-hover:bg-primary-500 group-hover:text-white flex items-center justify-center transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200 group-hover:text-white">{label}</p>
                      <p className="text-xs text-slate-400">{desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>

            {/* Live System Diagnostics */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Engine Status: <strong className="text-emerald-400">Optimal</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Cpu className="w-3.5 h-3.5 text-primary-400" />
                <span>Groq Llama-3 8B</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
