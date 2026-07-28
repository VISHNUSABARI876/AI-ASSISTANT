import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  MessageSquare,
  History,
  UploadCloud,
  FileText,
  Code,
  BookOpen,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bot,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const mainNavLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/chat', icon: MessageSquare, label: 'AI Chat' },
  { to: '/history', icon: History, label: 'Chat History' },
  { to: '/upload', icon: UploadCloud, label: 'File Upload' },
  { to: '/summarize', icon: FileText, label: 'Doc Intelligence' },
  { to: '/codegen', icon: Code, label: 'Code Generator' },
  { to: '/prompts', icon: BookOpen, label: 'Prompt Library' },
]

const accountNavLinks = [
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    if (onClose) onClose()
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-md transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col
          bg-white/90 dark:bg-[#0A0F1E]/90 backdrop-blur-2xl border-r border-slate-200 dark:border-white/10
          transition-all duration-300 ease-in-out shadow-card-os
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${collapsed ? 'w-20' : 'w-64'}
        `}
      >
        {/* Header & Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-200 dark:border-white/10">
          <button
            onClick={() => setCollapsed((p) => !p)}
            className="flex items-center gap-3 min-w-0 group"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 via-accent-500 to-secondary-500 flex items-center justify-center flex-shrink-0  animate-pulse-slow">
              <Bot className="w-6 h-6 text-white" />
              <div className="absolute -right-1.5 -bottom-1.5 w-4 h-4 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                {collapsed ? <ChevronRight className="w-2.5 h-2.5 text-white" /> : <ChevronLeft className="w-2.5 h-2.5 text-white" />}
              </div>
            </div>
            {!collapsed && (
              <div className="min-w-0 animate-fade-in text-left">
                <h1 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight tracking-tight flex items-center gap-1">
                  AI <Sparkles className="w-3.5 h-3.5 text-accent-400" />
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">AI Assistant</p>
              </div>
            )}
          </button>
        </div>

        {/* User Card */}
        <div className="p-3 border-b border-slate-200 dark:border-white/5">
          <div className={`flex items-center gap-3 p-2 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm ring-2 ring-primary-500/40  flex-shrink-0">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.username || 'User'}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.email || 'Active Session'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar space-y-6">
          {/* Main Links */}
          <div>
            {!collapsed && (
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
                Main
              </p>
            )}
            <ul className="space-y-1.5">
              {mainNavLinks.map(({ to, icon: Icon, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    onClick={onClose}
                    className={({ isActive }) => `
                      relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group
                      ${collapsed ? 'justify-center px-2' : ''}
                      ${
                        isActive
                          ? 'bg-primary-500/20 text-white border border-primary-500/40 '
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }
                    `}
                    title={collapsed ? label : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary-400 rounded-r-full " />
                        )}
                        <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-primary-400' : 'text-slate-400 group-hover:text-white'}`} />
                        {!collapsed && <span>{label}</span>}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          <div>
            {!collapsed && (
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
                System
              </p>
            )}
            <ul className="space-y-1.5">
              {accountNavLinks.map(({ to, icon: Icon, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    onClick={onClose}
                    className={({ isActive }) => `
                      relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group
                      ${collapsed ? 'justify-center px-2' : ''}
                      ${
                        isActive
                          ? 'bg-primary-500/20 text-white border border-primary-500/40 '
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }
                    `}
                    title={collapsed ? label : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary-400 rounded-r-full " />
                        )}
                        <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-primary-400' : 'text-slate-400 group-hover:text-white'}`} />
                        {!collapsed && <span>{label}</span>}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Logout Section */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all ${
              collapsed ? 'justify-center px-2' : ''
            }`}
            title="Sign Out"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
