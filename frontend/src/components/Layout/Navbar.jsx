import { RiMenuLine, RiSunLine, RiMoonLine, RiBellLine, RiRobot2Line } from 'react-icons/ri'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useLocation } from 'react-router-dom'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/chat': 'AI Chat',
  '/history': 'Chat History',
  '/upload': 'File Upload',
  '/summarize': 'PDF Summarize',
  '/codegen': 'Code Generator',
  '/profile': 'User Profile',
  '/settings': 'Settings',
}

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth()
  const { isDark, toggle } = useTheme()
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'AI Assistant'

  return (
    <header className="sticky top-0 z-30 h-16 glass border-b border-slate-200 dark:border-slate-700/50 flex items-center px-4 gap-4">
      {/* Mobile menu button */}
      <button
        id="sidebar-toggle"
        onClick={onMenuClick}
        className="lg:hidden btn-ghost p-2"
        aria-label="Toggle sidebar"
      >
        <RiMenuLine className="text-xl" />
      </button>

      {/* Title */}
      <div className="flex items-center gap-2">
        <RiRobot2Line className="text-primary-500 text-xl hidden sm:block" />
        <h2 className="font-bold text-slate-800 dark:text-white text-base">{title}</h2>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
        {/* Theme toggle */}
        <button
          id="theme-toggle"
          onClick={toggle}
          className="btn-ghost p-2 rounded-xl"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <RiSunLine className="text-xl text-amber-400" />
          ) : (
            <RiMoonLine className="text-xl text-slate-600" />
          )}
        </button>

        {/* Notifications (UI only) */}
        <button id="notifications-btn" className="btn-ghost p-2 rounded-xl relative" aria-label="Notifications">
          <RiBellLine className="text-xl" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-sm font-bold ml-1 flex-shrink-0 ring-2 ring-primary-300 dark:ring-primary-700">
          {user?.username?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  )
}
