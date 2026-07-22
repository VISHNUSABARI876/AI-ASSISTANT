import { useState, useEffect } from 'react'
import api from '../services/api'
import {
  Key,
  Plus,
  Trash2,
  Check,
  EyeOff,
  Copy,
  ShieldCheck,
  Sliders,
  Sparkles,
  Zap,
  Cpu,
  Moon,
  Sun,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { useTheme } from '../context/ThemeContext'

export default function SettingsPage() {
  const { isDark, toggle: toggleTheme } = useTheme()
  const [keys, setKeys] = useState([])
  const [loadingKeys, setLoadingKeys] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [revealedKey, setRevealedKey] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  // Interactive OS Settings Switches
  const [animationEnabled, setAnimationEnabled] = useState(true)
  const [responseLength, setResponseLength] = useState('Detailed')
  const [selectedModel, setSelectedModel] = useState('Llama 3 8B (Groq)')

  const fetchKeys = async () => {
    try {
      const res = await api.get('/keys/')
      setKeys(res.data.keys || [])
    } catch {
      toast.error('Failed to load API keys.')
    } finally {
      setLoadingKeys(false)
    }
  }

  useEffect(() => {
    fetchKeys()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newKeyName.trim()) {
      toast.warning('Key name is required.')
      return
    }
    setCreating(true)
    try {
      const res = await api.post('/keys/', { name: newKeyName.trim() })
      setRevealedKey(res.data.key)
      setKeys((prev) => [res.data.key_info, ...prev])
      setNewKeyName('')
      setShowCreate(false)
      toast.success('API Key created! Copy it now.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create key.')
    } finally {
      setCreating(false)
    }
  }

  const handleRevoke = async (keyId) => {
    if (!window.confirm('Revoke this API key?')) return
    try {
      await api.delete(`/keys/${keyId}`)
      setKeys((prev) => prev.map((k) => (k.id === keyId ? { ...k, is_active: false } : k)))
      toast.success('API Key revoked.')
    } catch {
      toast.error('Failed to revoke key.')
    }
  }

  const handleDelete = async (keyId) => {
    if (!window.confirm('Permanently delete this API key?')) return
    try {
      await api.delete(`/keys/${keyId}/delete`)
      setKeys((prev) => prev.filter((k) => k.id !== keyId))
      toast.success('API Key deleted.')
    } catch {
      toast.error('Failed to delete key.')
    }
  }

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <Sliders className="w-7 h-7 text-primary-400" /> System & Developer Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Customize AI behavior, animation preferences, and manage developer API keys
        </p>
      </div>

      {/* OS Preferences & Switches */}
      <div className="glass-card border border-white/10 p-6 space-y-6 shadow-glow">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent-400" /> AI OS Preferences
        </h2>

        <div className="space-y-4 text-xs">
          {/* Dark / Light Theme Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
            <div>
              <p className="font-bold text-white flex items-center gap-2">
                {isDark ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                Appearance Theme
              </p>
              <p className="text-slate-400 mt-0.5">Toggle futuristic dark OS baseline</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isDark ? 'bg-primary-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDark ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Smooth Animations Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
            <div>
              <p className="font-bold text-white">Animations & Aurora Mesh</p>
              <p className="text-slate-400 mt-0.5">Enable smooth micro-interactions & background particles</p>
            </div>
            <button
              onClick={() => setAnimationEnabled((p) => !p)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                animationEnabled ? 'bg-primary-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  animationEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* AI Model Selection */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
            <div>
              <p className="font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-secondary-400" /> Default AI Model
              </p>
              <p className="text-slate-400 mt-0.5">Primary language model for inference</p>
            </div>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="input-os w-auto py-1.5 px-3 text-xs"
            >
              <option value="Llama 3 8B (Groq)">Llama 3 8B (Groq - Fast)</option>
              <option value="Llama 3.3 70B (Groq)">Llama 3.3 70B (Groq - Deep Reasoning)</option>
            </select>
          </div>

          {/* Response Length */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
            <div>
              <p className="font-bold text-white">Response Verbosity</p>
              <p className="text-slate-400 mt-0.5">Preferred length for AI answers</p>
            </div>
            <div className="flex gap-2">
              {['Concise', 'Detailed', 'Comprehensive'].map((len) => (
                <button
                  key={len}
                  onClick={() => setResponseLength(len)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    responseLength === len
                      ? 'bg-primary-600 text-white shadow-glow'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Developer API Key Manager */}
      <div className="glass-card border border-white/10 p-6 space-y-6 shadow-glow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-primary-400" /> Developer API Keys
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Programmatic API authentication tokens</p>
          </div>
          <button
            onClick={() => setShowCreate((p) => !p)}
            className="btn-os-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-glow"
          >
            <Plus className="w-4 h-4" /> New Key
          </button>
        </div>

        {/* Revealed Key Alert */}
        {revealedKey && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 animate-fade-in text-xs">
            <p className="font-bold text-emerald-300 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> API Key Created — Copy Now!
            </p>
            <code className="block break-all font-mono bg-slate-900 border border-emerald-500/20 rounded-lg p-2.5 text-white select-all">
              {revealedKey}
            </code>
            <div className="flex justify-between items-center pt-1">
              <span className="text-[11px] text-slate-400">This key will not be shown again.</span>
              <button
                onClick={() => copyToClipboard(revealedKey, 'new')}
                className="btn-os-secondary text-xs px-3 py-1 flex items-center gap-1 text-emerald-300"
              >
                {copiedId === 'new' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Key
              </button>
            </div>
          </div>
        )}

        {/* Create Key Form */}
        {showCreate && (
          <form onSubmit={handleCreate} className="p-4 rounded-xl bg-slate-900/80 border border-white/10 flex items-end gap-3 animate-fade-in">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Key Label</label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. CLI Automation Token"
                className="input-os text-xs py-2"
                autoFocus
              />
            </div>
            <button type="submit" disabled={creating} className="btn-os-primary text-xs py-2 px-4 flex-shrink-0">
              {creating ? <LoadingSpinner size="sm" /> : 'Create'}
            </button>
          </form>
        )}

        {/* Keys List */}
        <div className="space-y-2">
          {loadingKeys ? (
            <div className="py-8 text-center"><LoadingSpinner text="Loading keys..." /></div>
          ) : keys.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">No API keys generated yet.</div>
          ) : (
            keys.map((key) => (
              <div
                key={key.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white truncate">{key.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${key.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                      {key.is_active ? 'Active' : 'Revoked'}
                    </span>
                  </div>
                  <p className="font-mono text-slate-400 text-[11px] mt-0.5">
                    {key.key_prefix}•••••••• · Created {key.created_at ? format(new Date(key.created_at), 'MMM d, yyyy') : ''}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {key.is_active && (
                    <button onClick={() => handleRevoke(key.id)} className="btn-os-ghost text-amber-400 p-1.5" title="Revoke">
                      <EyeOff className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(key.id)} className="btn-os-ghost text-red-400 p-1.5" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
