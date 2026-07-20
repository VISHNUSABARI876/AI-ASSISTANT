import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  RiUser3Line,
  RiMailLine,
  RiCalendarLine,
  RiEditLine,
  RiCheckLine,
  RiCloseLine,
  RiShieldLine,
  RiRobot2Line,
} from 'react-icons/ri'

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4 py-4 border-b border-slate-100 dark:border-dark-600 last:border-0">
    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-dark-600 flex items-center justify-center flex-shrink-0">
      <Icon className="text-primary-500 text-lg" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{label}</p>
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{value || '—'}</p>
    </div>
  </div>
)

export default function ProfilePage() {
  const { user } = useAuth()
  const [editMode, setEditMode] = useState(false)
  const [displayName, setDisplayName] = useState(user?.username || '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // TODO: wire up to PATCH /api/users/me
    setSaved(true)
    setEditMode(false)
    setTimeout(() => setSaved(false), 2500)
  }

  const joined = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown'

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">My Profile</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your account information.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar card */}
        <div className="lg:col-span-1">
          <div className="card p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-4 shadow-lg">
              <span className="text-white text-3xl font-extrabold">
                {(user?.username || 'U')[0].toUpperCase()}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user?.username}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>

            <div className="mt-4 w-full flex flex-col gap-2">
              <div className="flex items-center justify-center gap-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-semibold px-3 py-2 rounded-xl">
                <RiShieldLine /> Active Account
              </div>
              <div className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-dark-600 text-slate-600 dark:text-slate-300 text-xs font-medium px-3 py-2 rounded-xl">
                <RiRobot2Line /> AI Assistant User
              </div>
            </div>
          </div>
        </div>

        {/* Details card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Account Details</h3>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium transition-colors"
                >
                  <RiEditLine /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 font-medium hover:text-green-700"
                  >
                    <RiCheckLine /> Save
                  </button>
                  <button
                    onClick={() => { setEditMode(false); setDisplayName(user?.username || '') }}
                    className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 font-medium"
                  >
                    <RiCloseLine /> Cancel
                  </button>
                </div>
              )}
            </div>

            {saved && (
              <div className="mb-4 flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium px-4 py-2.5 rounded-xl">
                <RiCheckLine /> Profile updated successfully!
              </div>
            )}

            {editMode ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-dark-700 border border-slate-200 dark:border-dark-500 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    Email (read-only)
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-slate-100 dark:bg-dark-700 border border-slate-200 dark:border-dark-500 rounded-xl px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>
            ) : (
              <>
                <InfoRow icon={RiUser3Line} label="Username" value={user?.username} />
                <InfoRow icon={RiMailLine} label="Email" value={user?.email} />
                <InfoRow icon={RiCalendarLine} label="Member Since" value={joined} />
              </>
            )}
          </div>

          {/* Stats summary */}
          <div className="card p-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Activity Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: 'Chats', value: '—' },
                { label: 'Files', value: '—' },
                { label: 'Summaries', value: '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 dark:bg-dark-700 rounded-2xl p-4">
                  <p className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">{value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
