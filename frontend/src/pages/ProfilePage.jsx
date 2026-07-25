import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  User,
  Mail,
  Calendar,
  Edit2,
  Check,
  X,
  ShieldCheck,
  Bot,
  MessageSquare,
  UploadCloud,
  FileText,
  Code,
  Sparkles,
} from 'lucide-react'
import { chatService } from '../services/chatService'
import { fileService } from '../services/fileService'
import { authService } from '../services/authService'
import { toast } from 'react-toastify'
import TiltCard from '../components/UI/TiltCard'

export default function ProfilePage() {
  const { user } = useAuth()
  const [editMode, setEditMode] = useState(false)
  const [displayName, setDisplayName] = useState(user?.username || '')
  const [saved, setSaved] = useState(false)
  const [userStats, setUserStats] = useState({ chats: 0, files: 0 })

  useEffect(() => {
    Promise.all([
      chatService.getHistory(1, 1).catch(() => ({ total: 0 })),
      fileService.listFiles().catch(() => ({ files: [] })),
    ]).then(([historyData, filesData]) => {
      setUserStats({
        chats: historyData.total || 0,
        files: filesData.files?.length || 0,
      })
    })
  }, [])

  const handleSave = async () => {
    try {
      await authService.updateProfile({ username: displayName })
      setSaved(true)
      setEditMode(false)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      toast.error('Failed to update profile.')
    }
  }

  const joined = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Active'

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <User className="w-7 h-7 text-primary-400" /> User Profile & Credentials
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your account identity, security status, and system activity
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Profile Card */}
        <TiltCard maxTilt={6} className="lg:col-span-1">
          <div className="glass-card p-6 flex flex-col items-center text-center space-y-4 border border-white/10 shadow-glow">
            {/* Animated Avatar Core */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 via-accent-500 to-secondary-500 p-1 shadow-glow animate-pulse-slow">
                <div className="w-full h-full rounded-full bg-[#050816] flex items-center justify-center text-white font-extrabold text-3xl">
                  {(user?.username || 'U')[0].toUpperCase()}
                </div>
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 ring-4 ring-[#050816]" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                {user?.username || 'Architect'} <Sparkles className="w-4 h-4 text-accent-400" />
              </h2>
              <p className="text-xs font-mono text-slate-400 mt-0.5">{user?.email}</p>
            </div>

            <div className="w-full space-y-2 pt-2">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Authenticated Session
              </div>
              <div className="p-2.5 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-300 text-xs font-semibold flex items-center justify-center gap-2">
                <Bot className="w-4 h-4 text-primary-400" /> AI OS Tier: Unlimited
              </div>
            </div>
          </div>
        </TiltCard>

        {/* Details & Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details Form Card */}
          <div className="glass-card p-6 border border-white/10 space-y-4 shadow-glow">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-bold text-white text-base">Identity Settings</h3>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="btn-os-ghost text-xs text-primary-400 hover:text-white flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSave} className="btn-os-primary text-xs py-1.5 px-3 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Save
                  </button>
                  <button onClick={() => setEditMode(false)} className="btn-os-ghost text-xs text-slate-400 flex items-center gap-1">
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                </div>
              )}
            </div>

            {saved && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                <Check className="w-4 h-4" /> Profile updated successfully!
              </div>
            )}

            {editMode ? (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input-os py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Email (Immutable)</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="input-os py-2.5 cursor-not-allowed opacity-60"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-slate-400 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary-400" /> Display Name
                  </span>
                  <span className="font-bold text-white">{user?.username}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-accent-400" /> Email Address
                  </span>
                  <span className="font-bold text-white">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-secondary-400" /> Member Since
                  </span>
                  <span className="font-bold text-white">{joined}</span>
                </div>
              </div>
            )}
          </div>

          {/* Activity Statistics */}
          <div className="glass-card p-6 border border-white/10 space-y-4 shadow-glow">
            <h3 className="font-bold text-white text-base">Usage Metrics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                <MessageSquare className="w-5 h-5 mx-auto text-primary-400" />
                <p className="text-2xl font-extrabold text-white">{userStats.chats}</p>
                <p className="text-[11px] text-slate-400">Chats</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                <UploadCloud className="w-5 h-5 mx-auto text-accent-400" />
                <p className="text-2xl font-extrabold text-white">{userStats.files}</p>
                <p className="text-[11px] text-slate-400">Uploads</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                <FileText className="w-5 h-5 mx-auto text-secondary-400" />
                <p className="text-2xl font-extrabold text-white">Active</p>
                <p className="text-[11px] text-slate-400">Summaries</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                <Code className="w-5 h-5 mx-auto text-emerald-400" />
                <p className="text-2xl font-extrabold text-white">Ready</p>
                <p className="text-[11px] text-slate-400">Code Gens</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
