import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { chatService } from '../services/chatService'
import { fileService } from '../services/fileService'
import api from '../services/api'
import {
  MessageSquare,
  UploadCloud,
  Code,
  FileText,
  Bot,
  ArrowRight,
  Clock,
  BookOpen,
  Sparkles,
  Zap,
  Cpu,
  Database,
  Search,
  Trash2,
  Terminal,
  Activity,
} from 'lucide-react'
import { format } from 'date-fns'
import { PageLoader } from '../components/UI/LoadingSpinner'
import TiltCard from '../components/UI/TiltCard'

const QUICK_PROMPTS = [
  'Explain Java',
  'Summarize PDF',
  'Generate React App',
  'Debug Python',
  'Write SQL',
  'Optimize Code',
]

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ chats: null, files: null })
  const [cacheStats, setCacheStats] = useState(null)
  const [recentChats, setRecentChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const [historyData, filesData] = await Promise.all([
          chatService.getHistory(1, 6),
          fileService.listFiles(),
        ])
        setStats({ chats: historyData.total, files: filesData.files?.length || 0 })
        setRecentChats(historyData.chats || [])
      } catch {
        // Handle gracefully
      }

      try {
        const cRes = await api.get('/cache/stats')
        setCacheStats(cRes.data)
      } catch { /* non-critical */ }

      setLoading(false)
    }
    load()
  }, [])

  const handlePromptClick = (promptText) => {
    sessionStorage.setItem('inject_prompt', promptText)
    navigate('/chat')
  }

  const handleDeleteChat = async (e, chatId) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await chatService.deleteChat(chatId)
      setRecentChats((prev) => prev.filter((c) => c.id !== chatId))
    } catch {
      // ignore
    }
  }

  const filteredChats = recentChats.filter(
    (c) =>
      c.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.response?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const hour = currentTime.getHours()
  const greeting = hour < 5 ? 'Good night' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  if (loading) return <PageLoader />

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Animated Hero Section */}
      <div className="relative rounded-3xl overflow-hidden glass-card border border-white/10 p-6 sm:p-10 shadow-glow-lg">
        {/* Ambient Aurora Gradient Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-600/30 blur-[100px] animate-aurora" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-accent-600/30 blur-[100px] animate-aurora [animation-delay:-5s]" />
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-accent-400" />
              <span>AI Operating System Core Active</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {greeting}, <span className="text-gradient-neon">{user?.username || 'Architect'}</span>! 👋
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Your neural workspace is fully operational with{' '}
              <strong className="text-white">{stats.chats ?? 0}</strong> active sessions and{' '}
              <strong className="text-white">{stats.files ?? 0}</strong> ingested documents.
            </p>

            {/* Current Date & Ticker */}
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-1">
              <span className="flex items-center gap-1.5 text-secondary-400">
                <Clock className="w-3.5 h-3.5" />
                {format(currentTime, 'EEEE, MMM d, yyyy · HH:mm:ss')}
              </span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="hidden sm:flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Groq LLM Connected
              </span>
            </div>
          </div>

          {/* Glowing Animated AI Core Orb */}
          <div className="flex flex-col sm:flex-row items-center gap-4 self-stretch lg:self-auto">
            <div className="relative w-28 h-28 rounded-full bg-slate-900/90 border border-white/20 flex items-center justify-center shadow-glow group cursor-pointer hover:scale-105 transition-transform">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary-500 via-accent-500 to-secondary-500 animate-spin-slow opacity-60 blur-md" />
              <div className="relative z-10 w-20 h-20 rounded-full bg-[#050816] flex items-center justify-center border border-white/20">
                <Bot className="w-10 h-10 text-primary-400 animate-pulse" />
              </div>
            </div>

            <div className="flex flex-col gap-2.5 w-full sm:w-auto">
              <Link
                to="/chat"
                className="btn-os-primary text-xs sm:text-sm px-6 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-glow"
              >
                <MessageSquare className="w-4 h-4" /> Start Neural Chat
              </Link>
              <Link
                to="/prompts"
                className="btn-os-secondary text-xs sm:text-sm px-6 py-3 rounded-2xl flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-accent-400" /> Browse Prompts
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Prompts Chips */}
        <div className="relative z-10 mt-8 pt-6 border-t border-white/10">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Quick Neural Prompts
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handlePromptClick(prompt)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-primary-600/30 text-slate-300 hover:text-white border border-white/10 hover:border-primary-500/40 text-xs font-medium backdrop-blur-md transition-all duration-200 active:scale-95 shadow-sm flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-accent-400" />
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TiltCard maxTilt={8}>
          <Link to="/history" className="glass-card p-6 block relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Conversations</p>
                <h3 className="text-3xl font-extrabold text-white mt-1">{stats.chats ?? '—'}</h3>
                <p className="text-[11px] text-slate-500 mt-1">All-time stored chats</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary-500/20 text-primary-400 border border-primary-500/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-glow">
                <MessageSquare className="w-6 h-6" />
              </div>
            </div>
          </Link>
        </TiltCard>

        <TiltCard maxTilt={8}>
          <Link to="/upload" className="glass-card p-6 block relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Uploaded Files</p>
                <h3 className="text-3xl font-extrabold text-white mt-1">{stats.files ?? '—'}</h3>
                <p className="text-[11px] text-slate-500 mt-1">PDFs & Documents</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-accent-500/20 text-accent-400 border border-accent-500/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-glow">
                <UploadCloud className="w-6 h-6" />
              </div>
            </div>
          </Link>
        </TiltCard>

        <TiltCard maxTilt={8}>
          <Link to="/settings" className="glass-card p-6 block relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Cache Active</p>
                <h3 className="text-3xl font-extrabold text-white mt-1">
                  {cacheStats ? cacheStats.active_entries : 'Active'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">Fast cached responses</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-secondary-500/20 text-secondary-400 border border-secondary-500/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-glow">
                <Database className="w-6 h-6" />
              </div>
            </div>
          </Link>
        </TiltCard>

        <TiltCard maxTilt={8}>
          <Link to="/prompts" className="glass-card p-6 block relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Prompt Templates</p>
                <h3 className="text-3xl font-extrabold text-white mt-1">22</h3>
                <p className="text-[11px] text-slate-500 mt-1">8 Specialized categories</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-glow">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </Link>
        </TiltCard>
      </div>

      {/* Quick Launchpad Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-400" /> OS Action Launchpad
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: 'Neural Chat', desc: 'Groq streaming AI', icon: MessageSquare, to: '/chat', color: 'from-primary-600 to-accent-600' },
            { title: 'Code Studio', desc: 'Interactive sandbox', icon: Code, to: '/codegen', color: 'from-accent-600 to-rose-600' },
            { title: 'Doc Intelligence', desc: 'RAG PDF analysis', icon: FileText, to: '/summarize', color: 'from-amber-500 to-orange-600' },
            { title: 'File Upload', desc: 'Document ingestion', icon: UploadCloud, to: '/upload', color: 'from-emerald-500 to-teal-600' },
          ].map(({ title, desc, icon: Icon, to, color }) => (
            <Link
              key={title}
              to={to}
              className="glass-card p-5 block hover:-translate-y-1 transition-all duration-200 group border border-white/10 hover:border-primary-500/40"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-glow mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm group-hover:text-primary-300 transition-colors">{title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Conversations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent-400" /> Recent Conversations
          </h2>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-os py-1.5 pl-9 pr-3 text-xs w-48"
              />
            </div>
            <Link to="/history" className="text-xs text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1">
              View Vault <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {filteredChats.length === 0 ? (
          <div className="glass-card p-10 text-center text-slate-400 space-y-3">
            <Bot className="w-10 h-10 mx-auto text-slate-600 animate-pulse" />
            <p className="font-semibold text-slate-300">No matching conversations found.</p>
            <Link to="/chat" className="btn-os-primary text-xs px-5 py-2 inline-flex">
              Start Conversation
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredChats.map((chat) => (
              <Link
                key={chat.id}
                to="/history"
                className="glass-card p-4 flex items-center justify-between gap-4 hover:border-primary-500/40 group transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-primary-500/20 text-primary-400 border border-primary-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate group-hover:text-primary-300 transition-colors">
                      {chat.message}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      🤖 {chat.response?.slice(0, 90)}...
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                    {chat.timestamp ? format(new Date(chat.timestamp), 'MMM d, HH:mm') : ''}
                  </span>
                  <button
                    onClick={(e) => handleDeleteChat(e, chat.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                    title="Delete Chat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
