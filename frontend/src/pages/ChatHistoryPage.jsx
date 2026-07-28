import { useState, useEffect, useCallback } from 'react'
import { chatService } from '../services/chatService'
import {
  Search,
  MessageSquare,
  Trash2,
  Download,
  Bot,
  User,
  Clock,
  RefreshCw,
  Pin,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import { PageLoader } from '../components/UI/LoadingSpinner'
import { exportAsCSV, exportAsMarkdown } from '../utils/exportUtils'
import MarkdownRenderer from '../components/UI/MarkdownRenderer'

export default function ChatHistoryPage() {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [expanded, setExpanded] = useState(null)
  const [pinnedIds, setPinnedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ai_pinned_chats')) || [] } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('ai_pinned_chats', JSON.stringify(pinnedIds))
  }, [pinnedIds])

  const loadHistory = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const data = await chatService.getHistory(p, 15)
      setChats(data.chats || [])
      setTotalPages(data.pages || 1)
      setTotal(data.total || 0)
      setPage(p)
    } catch {
      toast.error('Failed to load conversation vault.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHistory(1)
  }, [loadHistory])

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadHistory(1)
      return
    }
    setSearching(true)
    try {
      const data = await chatService.searchHistory(searchQuery.trim())
      setChats(data.chats || [])
      setTotalPages(1)
      setTotal(data.chats?.length || 0)
    } catch {
      toast.error('Search failed.')
    } finally {
      setSearching(false)
    }
  }

  const togglePin = (e, chatId) => {
    e.stopPropagation()
    setPinnedIds((prev) =>
      prev.includes(chatId) ? prev.filter((id) => id !== chatId) : [...prev, chatId]
    )
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this chat entry permanently?')) return
    try {
      await chatService.deleteChat(id)
      setChats((prev) => prev.filter((c) => c.id !== id))
      setTotal((t) => Math.max(0, t - 1))
      toast.success('Chat deleted.')
    } catch {
      toast.error('Failed to delete chat.')
    }
  }

  const handleExportCSV = () => {
    if (chats.length === 0) {
      toast.warning('No chats to export.')
      return
    }
    exportAsCSV(chats)
    toast.success('Chat history exported as CSV!')
  }

  const handleExportMarkdown = () => {
    if (chats.length === 0) {
      toast.warning('No chats to export.')
      return
    }
    const messages = chats.flatMap((c) => [
      { id: c.id, content: c.message, isUser: true, timestamp: c.timestamp },
      { id: c.id + '-r', content: c.response, isUser: false, timestamp: c.timestamp },
    ])
    exportAsMarkdown(messages, 'Chat History Vault Export')
    toast.success('Chat history exported as Markdown!')
  }

  // Sort pinned chats to top
  const sortedChats = [...chats].sort((a, b) => {
    const isAPinned = pinnedIds.includes(a.id)
    const isBPinned = pinnedIds.includes(b.id)
    if (isAPinned && !isBPinned) return -1
    if (!isAPinned && isBPinned) return 1
    return 0
  })

  if (loading && chats.length === 0) return <PageLoader />

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7 text-primary-400" /> Conversation Vault
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {total} total conversation{total !== 1 ? 's' : ''} saved in neural history
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button onClick={handleExportCSV} className="btn-os-secondary text-xs flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button onClick={handleExportMarkdown} className="btn-os-secondary text-xs flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Markdown
          </button>
          <button onClick={() => loadHistory(1)} className="btn-os-ghost p-2 text-slate-300" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="input-os pl-10"
            placeholder="Search conversation text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button onClick={handleSearch} disabled={searching} className="btn-os-primary px-6 text-xs font-bold">
          {searching ? 'Searching...' : 'Search'}
        </button>
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('')
              loadHistory(1)
            }}
            className="btn-os-secondary px-4 text-xs"
          >
            Clear
          </button>
        )}
      </div>

      {/* Chats Feed */}
      {sortedChats.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400 space-y-3">
          <MessageSquare className="w-10 h-10 mx-auto text-slate-600 animate-pulse" />
          <p className="font-semibold text-slate-300">
            {searchQuery ? 'No matching conversations found.' : 'No chat history yet. Start a session!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedChats.map((chat) => {
            const isPinned = pinnedIds.includes(chat.id)
            const isExpanded = expanded === chat.id

            return (
              <div
                key={chat.id}
                className={`glass-card p-4 transition-all border ${
                  isPinned ? 'border-primary-500/50 bg-primary-500/10' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    className="flex items-start gap-3.5 flex-1 text-left"
                    onClick={() => setExpanded(isExpanded ? null : chat.id)}
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary-500/20 text-primary-400 border border-primary-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 ">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate flex items-center gap-2">
                        {chat.message}
                        {isPinned && <Pin className="w-3.5 h-3.5 text-accent-400 fill-accent-400" />}
                      </p>
                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {chat.timestamp ? format(new Date(chat.timestamp), 'MMM d, yyyy · HH:mm') : 'Saved'}
                      </span>
                    </div>
                  </button>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => togglePin(e, chat.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isPinned ? 'text-accent-400 bg-accent-500/20' : 'text-slate-400 hover:text-white'
                      }`}
                      title={isPinned ? 'Unpin' : 'Pin to top'}
                    >
                      <Pin className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setExpanded(isExpanded ? null : chat.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleDelete(chat.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete chat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded AI response */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-start gap-3 animate-fade-in">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-secondary-500 to-primary-600 text-white flex items-center justify-center flex-shrink-0 text-xs ">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="flex-1 glass-panel p-4 rounded-xl text-xs leading-relaxed max-h-96 overflow-y-auto no-scrollbar">
                      <MarkdownRenderer content={chat.response} />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !searchQuery && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => loadHistory(page - 1)}
            disabled={page === 1 || loading}
            className="btn-os-secondary text-xs px-4 py-2"
          >
            Previous
          </button>
          <span className="text-xs font-mono text-slate-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => loadHistory(page + 1)}
            disabled={page === totalPages || loading}
            className="btn-os-secondary text-xs px-4 py-2"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
