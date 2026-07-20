import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { chatService } from '../services/chatService'
import { fileService } from '../services/fileService'
import {
  RiChat3Line, RiHistoryLine, RiUploadCloud2Line, RiCodeSSlashLine,
  RiFilePdfLine, RiRobot2Line, RiArrowRightLine, RiTimeLine,
} from 'react-icons/ri'
import { format } from 'date-fns'
import { PageLoader } from '../components/UI/LoadingSpinner'

const StatCard = ({ icon: Icon, label, value, color, to }) => (
  <Link to={to} className="card-hover p-6 flex items-center gap-4 group">
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
      <Icon className="text-2xl text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value ?? '—'}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{label}</p>
    </div>
    <RiArrowRightLine className="ml-auto text-slate-300 dark:text-slate-600 group-hover:text-primary-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
  </Link>
)

const QuickAction = ({ icon: Icon, label, desc, to, color }) => (
  <Link to={to} className="card-hover p-5 flex flex-col gap-3 group">
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
      <Icon className="text-xl text-white" />
    </div>
    <div>
      <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{label}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
    </div>
  </Link>
)

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ chats: null, files: null })
  const [recentChats, setRecentChats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [historyData, filesData] = await Promise.all([
          chatService.getHistory(1, 5),
          fileService.listFiles(),
        ])
        setStats({ chats: historyData.total, files: filesData.files.length })
        setRecentChats(historyData.chats || [])
      } catch {
        // Non-critical — show skeleton
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  if (loading) return <PageLoader />

  return (
    <div className="page-container py-8">
      {/* Welcome banner */}
      <div className="rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 p-8 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-primary-800/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <RiRobot2Line className="text-white/80 text-2xl" />
            <span className="text-primary-100 font-medium text-sm">AI Assistant</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            {greeting}, {user?.username}! 👋
          </h1>
          <p className="text-primary-100 mt-2">
            Your intelligent workspace is ready. What would you like to do today?
          </p>
          <Link to="/chat" className="mt-5 inline-flex items-center gap-2 bg-white text-primary-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-primary-50 transition-colors shadow-md">
            <RiChat3Line /> Start Chatting
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={RiChat3Line} label="Total Chats" value={stats.chats} color="bg-primary-500" to="/history" />
        <StatCard icon={RiUploadCloud2Line} label="Uploaded Files" value={stats.files} color="bg-accent-500" to="/upload" />
        <StatCard icon={RiFilePdfLine} label="PDF Summaries" value="∞" color="bg-amber-500" to="/summarize" />
        <StatCard icon={RiCodeSSlashLine} label="Code Snippets" value="∞" color="bg-rose-500" to="/codegen" />
      </div>

      {/* Quick actions */}
      <h2 className="page-title mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <QuickAction icon={RiChat3Line} label="AI Chat" desc="Chat with GPT-2" to="/chat" color="bg-primary-500" />
        <QuickAction icon={RiCodeSSlashLine} label="Generate Code" desc="AI-powered code" to="/codegen" color="bg-rose-500" />
        <QuickAction icon={RiFilePdfLine} label="Summarize PDF" desc="Extract insights" to="/summarize" color="bg-amber-500" />
        <QuickAction icon={RiUploadCloud2Line} label="Upload File" desc="PDF & TXT files" to="/upload" color="bg-accent-500" />
      </div>

      {/* Recent chats */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="page-title">Recent Chats</h2>
        <Link to="/history" className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline flex items-center gap-1">
          View all <RiArrowRightLine />
        </Link>
      </div>

      {recentChats.length === 0 ? (
        <div className="card p-10 text-center text-slate-400 dark:text-slate-500">
          <RiChat3Line className="text-4xl mx-auto mb-3 opacity-50" />
          <p className="font-medium">No chats yet.</p>
          <p className="text-sm mt-1">Start a conversation with the AI!</p>
          <Link to="/chat" className="btn-primary mt-4 inline-flex">Start Chatting</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {recentChats.map((chat) => (
            <div key={chat.id} className="card p-4 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0">
                <RiChat3Line className="text-primary-600 dark:text-primary-400 text-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{chat.message}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">{chat.response}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
                <RiTimeLine className="text-xs" />
                {chat.timestamp ? format(new Date(chat.timestamp), 'MMM d, HH:mm') : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
