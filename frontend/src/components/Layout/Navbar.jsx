import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Menu,
  Sun,
  Moon,
  Bell,
  Search,
  Bot,
  Sparkles,
  CheckCircle2,
  X,
  Cpu,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const pageTitles = {
  '/dashboard': 'OS Dashboard',
  '/chat': 'AI Neural Chat',
  '/history': 'Conversation Vault',
  '/upload': 'File Upload Hub',
  '/summarize': 'Doc Intelligence',
  '/codegen': 'AI Code Studio',
  '/profile': 'User Profile',
  '/settings': 'System Settings',
  '/prompts': 'Prompt Library',
}

export default function Navbar({ onMenuClick, onOpenPalette }) {
  const { user } = useAuth()
  const { isDark, toggle } = useTheme()
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'AI Operating System'

  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Groq Model Updated', desc: 'Llama 3 8B model is operating at high speed.', time: '2m ago', read: false },
    { id: 2, title: 'RAG Document Engine', desc: 'Ready for instant vector PDF Q&A.', time: '1h ago', read: false },
    { id: 3, title: 'Welcome to AI OS', desc: 'Redesigned interface is active.', time: '2h ago', read: true },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#050816]/80 backdrop-blur-2xl border-b border-white/10 flex items-center px-4 sm:px-6 justify-between gap-4">
      {/* Left: Mobile Menu & Current Route Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden btn-os-ghost p-2 rounded-xl text-slate-300 hover:text-white"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-extrabold text-white text-sm sm:text-base leading-tight tracking-tight flex items-center gap-2">
              {title}
            </h2>
          </div>
        </div>

        {/* AI OS Model Badge */}
        <div className="hidden sm:flex items-center gap-2 ml-4 px-3 py-1 rounded-full bg-slate-900/90 border border-primary-500/30 text-xs font-semibold text-primary-300 shadow-glow">
          <Cpu className="w-3.5 h-3.5 text-accent-400" />
          <span>Llama 3</span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Online
          </span>
        </div>
      </div>

      {/* Center: Command Palette Input */}
      <button
        onClick={onOpenPalette}
        className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900/70 hover:bg-slate-800/90 text-slate-400 hover:text-slate-200 text-xs border border-white/10 transition-all shadow-inner w-64 lg:w-80 justify-between"
      >
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-500" />
          <span>Search tools, models, commands...</span>
        </div>
        <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold text-slate-300 bg-slate-800 rounded border border-white/10">
          ⌘K
        </kbd>
      </button>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Mobile Search button */}
        <button
          onClick={onOpenPalette}
          className="md:hidden btn-os-ghost p-2 rounded-xl text-slate-300"
          title="Search Command Palette"
        >
          <kbd className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 rounded border border-white/10">⌘K</kbd>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggle}
          className="btn-os-ghost p-2 rounded-xl text-slate-300 hover:text-white"
          title={isDark ? 'Light Mode' : 'Dark Mode'}
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications((p) => !p)}
            className="btn-os-ghost p-2 rounded-xl text-slate-300 hover:text-white relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-accent-500 rounded-full ring-2 ring-[#050816] shadow-glow" />
            )}
          </button>

          {/* Notifications Modal Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 glass-card border border-white/10 shadow-glow-lg p-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary-400" />
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">System Notifications</h4>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] font-semibold text-primary-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border transition-colors ${
                      n.read
                        ? 'bg-slate-900/40 border-white/5 text-slate-400'
                        : 'bg-slate-900/90 border-primary-500/30 text-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <p className="font-semibold text-xs text-white">{n.title}</p>
                      <span className="text-[10px] text-slate-500">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-snug">{n.desc}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowNotifications(false)}
                className="w-full mt-3 py-1.5 text-center text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="relative group ml-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 via-accent-500 to-secondary-400 flex items-center justify-center text-white font-extrabold text-sm ring-2 ring-primary-500/50 shadow-glow cursor-pointer">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#050816]" />
        </div>
      </div>
    </header>
  )
}
