import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  LayoutDashboard,
  MessageSquare,
  FileText,
  Code,
  UploadCloud,
  History,
  Settings,
  User,
  Sun,
  Moon,
  LogOut,
  Command,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { isDark, toggle: toggleTheme } = useTheme()
  const inputRef = useRef(null)

  const commands = [
    {
      id: 'nav-dashboard',
      label: 'Go to Dashboard',
      category: 'Navigation',
      icon: LayoutDashboard,
      action: () => navigate('/dashboard'),
    },
    {
      id: 'nav-chat',
      label: 'Start New AI Chat',
      category: 'Navigation',
      icon: MessageSquare,
      action: () => navigate('/chat'),
    },
    {
      id: 'nav-summarize',
      label: 'Doc Intelligence & Summarizer',
      category: 'Navigation',
      icon: FileText,
      action: () => navigate('/summarize'),
    },
    {
      id: 'nav-codegen',
      label: 'Code Generator',
      category: 'Navigation',
      icon: Code,
      action: () => navigate('/codegen'),
    },
    {
      id: 'nav-upload',
      label: 'Upload Files Hub',
      category: 'Navigation',
      icon: UploadCloud,
      action: () => navigate('/upload'),
    },
    {
      id: 'nav-history',
      label: 'View Conversation Vault',
      category: 'Navigation',
      icon: History,
      action: () => navigate('/history'),
    },
    {
      id: 'nav-profile',
      label: 'View User Profile',
      category: 'Account',
      icon: User,
      action: () => navigate('/profile'),
    },
    {
      id: 'nav-settings',
      label: 'Developer Settings',
      category: 'Account',
      icon: Settings,
      action: () => navigate('/settings'),
    },
    {
      id: 'action-theme',
      label: 'Toggle Dark / Light Mode',
      category: 'Preferences',
      icon: isDark ? Sun : Moon,
      action: () => toggleTheme(),
    },
    {
      id: 'action-logout',
      label: 'Sign Out Session',
      category: 'Account',
      icon: LogOut,
      action: () => logout(),
    },
  ]

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.category.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const executeCommand = (cmd) => {
    cmd.action()
    onClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(
        (prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1)
      )
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredCommands[selectedIndex]) {
        executeCommand(filteredCommands[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl glass-card border border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
          <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or jump to page... (Esc to cancel)"
            className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm font-medium"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded border border-white/10">
            ESC
          </kbd>
        </div>

        {/* Commands List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 no-scrollbar">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No matching commands found for "{query}"
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon
              const isSelected = idx === selectedIndex
              return (
                <button
                  key={cmd.id}
                  onClick={() => executeCommand(cmd)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-sm transition-all ${
                    isSelected
                      ? 'bg-primary-500/90 text-white  border border-primary-400/40'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    <span className="font-semibold text-xs">{cmd.label}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-white/5">
                    {cmd.category}
                  </span>
                </button>
              )
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-950/80 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Command className="w-3.5 h-3.5 text-primary-400" />
            <span>Command Palette</span>
          </div>
          <div className="flex items-center gap-3 font-mono">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
        </div>
      </div>
    </div>
  )
}
