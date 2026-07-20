import { NavLink, useNavigate } from 'react-router-dom'
import {
  RiDashboardLine,
  RiChat3Line,
  RiHistoryLine,
  RiUploadCloud2Line,
  RiFilePdfLine,
  RiCodeSSlashLine,
  RiUserLine,
  RiSettings4Line,
  RiRobot2Line,
  RiLogoutBoxLine,
} from 'react-icons/ri'
import { useAuth } from '../../context/AuthContext'

const navLinks = [
  { to: '/dashboard', icon: RiDashboardLine, label: 'Dashboard' },
  { to: '/chat', icon: RiChat3Line, label: 'AI Chat' },
  { to: '/history', icon: RiHistoryLine, label: 'Chat History' },
  { to: '/upload', icon: RiUploadCloud2Line, label: 'File Upload' },
  { to: '/summarize', icon: RiFilePdfLine, label: 'PDF Summarize' },
  { to: '/codegen', icon: RiCodeSSlashLine, label: 'Code Generator' },
]

const bottomLinks = [
  { to: '/profile', icon: RiUserLine, label: 'Profile' },
  { to: '/settings', icon: RiSettings4Line, label: 'Settings' },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
    if (onClose) onClose()
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col
          w-[260px] bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-700/60
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-200 dark:border-slate-700/60">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
            <RiRobot2Line className="text-white text-xl" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">AI Assistant</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Intelligent Workspace</p>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-700/40">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                {user?.username || 'User'}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email || ''}</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">
            Main
          </p>
          <ul className="space-y-1">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    isActive ? 'nav-item-active' : 'nav-item'
                  }
                >
                  <Icon className="text-lg flex-shrink-0" />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2 mt-6">
            Account
          </p>
          <ul className="space-y-1">
            {bottomLinks.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    isActive ? 'nav-item-active' : 'nav-item'
                  }
                >
                  <Icon className="text-lg flex-shrink-0" />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-slate-200 dark:border-slate-700/60">
          <button
            onClick={handleLogout}
            className="nav-item w-full text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-300"
          >
            <RiLogoutBoxLine className="text-lg" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
