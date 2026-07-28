import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Bot, User, Share2, Copy, Check, ArrowLeft, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import MarkdownRenderer from '../components/UI/MarkdownRenderer'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { toast } from 'react-toastify'
import api from '../services/api'

function SharedBubble({ msg }) {
  const isUser = msg.isUser || msg.role === 'user'
  return (
    <div className={`flex items-start gap-3 animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-sm  ${
          isUser ? 'bg-gradient-to-br from-primary-500 to-accent-500' : 'bg-gradient-to-br from-secondary-500 to-primary-600'
        }`}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>
      <div className={`max-w-[80%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl p-4 text-sm leading-relaxed border ${
            isUser
              ? 'bg-primary-500 text-white border-primary-400/40 rounded-tr-sm '
              : 'glass-card text-slate-100 border-white/10 rounded-tl-sm shadow-card-os'
          }`}
        >
          {msg.image_url && (
            <img src={msg.image_url} alt="Attached" className="max-w-xs max-h-56 rounded-xl mb-2 object-cover" />
          )}
          {isUser ? <span className="whitespace-pre-wrap">{msg.content}</span> : <MarkdownRenderer content={msg.content} />}
        </div>
        {msg.timestamp && (
          <span className="text-[10px] font-mono text-slate-500 px-1">
            {format(new Date(msg.timestamp), 'HH:mm')}
          </span>
        )}
      </div>
    </div>
  )
}

export default function SharedChatPage() {
  const { shareId } = useParams()
  const [chat, setChat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await api.get(`/share/${shareId}`)
        setChat(res.data)
      } catch (err) {
        setError(err.response?.data?.error || 'Conversation link not found.')
      } finally {
        setLoading(false)
      }
    }
    fetchChat()
  }, [shareId])

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    toast.success('Share link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#050816]">
        <LoadingSpinner size="lg" text="Loading shared AI conversation..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#050816] text-center px-6 space-y-4">
        <Share2 className="w-12 h-12 text-slate-400 dark:text-slate-600 animate-pulse" />
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Conversation Link Invalid</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs">{error}</p>
        <Link to="/" className="btn-os-primary text-xs px-6 py-2.5 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Return Home
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#050816] text-slate-900 dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#050816]/80 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="btn-os-ghost p-2 rounded-xl text-slate-500 dark:text-slate-300">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              {chat.title || 'Shared Neural Session'} <Sparkles className="w-3.5 h-3.5 text-accent-400" />
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              {chat.view_count} view{chat.view_count !== 1 ? 's' : ''} · Public Shared View
            </p>
          </div>
        </div>

        <button onClick={copyLink} className="btn-os-secondary text-xs px-4 py-2 flex items-center gap-1.5">
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </header>

      {/* Feed */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {(chat.messages || [])
          .filter((m) => m.id !== 'welcome')
          .map((msg, idx) => (
            <SharedBubble key={msg.id || idx} msg={msg} />
          ))}
      </main>

      {/* Footer CTA */}
      <footer className="border-t border-slate-200 dark:border-white/10 py-8 text-center bg-slate-100 dark:bg-slate-950/80 backdrop-blur-xl">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Shared session generated with AI Assistant
        </p>
        <Link to="/" className="btn-os-primary text-xs px-6 py-3 font-bold inline-flex items-center gap-2 ">
          <Bot className="w-4 h-4" /> Launch Free
        </Link>
      </footer>
    </div>
  )
}
