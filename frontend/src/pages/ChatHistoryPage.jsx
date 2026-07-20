import { useState, useEffect, useCallback } from 'react'
import { chatService } from '../services/chatService'
import {
  RiSearchLine, RiChat3Line, RiDeleteBinLine, RiDownloadLine,
  RiRobot2Line, RiUser3Line, RiTimeLine, RiRefreshLine,
} from 'react-icons/ri'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import { PageLoader } from '../components/UI/LoadingSpinner'

export default function ChatHistoryPage() {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [expanded, setExpanded] = useState(null)

  const loadHistory = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const data = await chatService.getHistory(p, 15)
      setChats(data.chats || [])
      setTotalPages(data.pages || 1)
      setTotal(data.total || 0)
      setPage(p)
    } catch {
      toast.error('Failed to load chat history.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadHistory(1) }, [loadHistory])

  const handleSearch = async () => {
    if (!searchQuery.trim()) { loadHistory(1); return }
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

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this chat entry?')) return
    try {
      await chatService.deleteChat(id)
      setChats((prev) => prev.filter((c) => c.id !== id))
      setTotal((t) => t - 1)
      toast.success('Chat deleted.')
    } catch {
      toast.error('Failed to delete chat.')
    }
  }

  const handleDownload = async (fmt) => {
    try {
      await chatService.downloadHistory(fmt)
      toast.success(`Chat history downloaded as ${fmt.toUpperCase()}.`)
    } catch {
      toast.error('Download failed.')
    }
  }

  if (loading && chats.length === 0) return <PageLoader />

  return (
    <div className="page-container py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Chat History</h1>
          <p className="page-subtitle">{total} conversation{total !== 1 ? 's' : ''} stored</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleDownload('json')} className="btn-secondary text-xs gap-1.5">
            <RiDownloadLine /> JSON
          </button>
          <button onClick={() => handleDownload('csv')} className="btn-secondary text-xs gap-1.5">
            <RiDownloadLine /> CSV
          </button>
          <button onClick={() => loadHistory(1)} className="btn-ghost p-2" title="Refresh">
            <RiRefreshLine className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="search-history-input"
            type="text"
            className="input pl-10"
            placeholder="Search your chat history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button
          id="search-history-btn"
          onClick={handleSearch}
          className="btn-primary px-5"
          disabled={searching}
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(''); loadHistory(1) }}
            className="btn-secondary px-4"
          >
            Clear
          </button>
        )}
      </div>

      {/* Results */}
      {chats.length === 0 ? (
        <div className="card p-12 text-center">
          <RiChat3Line className="text-5xl text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {searchQuery ? 'No results found for your search.' : 'No chat history yet. Start a conversation!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {chats.map((chat) => (
            <div key={chat.id} className="card p-4 hover:shadow-md transition-all">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <button
                  className="flex items-start gap-3 flex-1 text-left"
                  onClick={() => setExpanded(expanded === chat.id ? null : chat.id)}
                >
                  <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <RiUser3Line className="text-primary-600 dark:text-primary-400 text-xs" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                      {chat.message}
                    </p>
                    <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                      <RiTimeLine className="text-xs" />
                      {chat.timestamp ? format(new Date(chat.timestamp), 'MMM d, yyyy · HH:mm') : ''}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => handleDelete(chat.id)}
                  className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                  title="Delete this chat"
                >
                  <RiDeleteBinLine className="text-sm" />
                </button>
              </div>

              {/* Expanded AI response */}
              {expanded === chat.id && (
                <div className="mt-3 ml-10 flex items-start gap-3 animate-fade-in">
                  <div className="w-7 h-7 rounded-full bg-accent-100 dark:bg-accent-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <RiRobot2Line className="text-accent-600 dark:text-accent-400 text-xs" />
                  </div>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{chat.response}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !searchQuery && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => loadHistory(page - 1)}
            disabled={page === 1 || loading}
            className="btn-secondary px-4 py-2 text-sm"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => loadHistory(page + 1)}
            disabled={page === totalPages || loading}
            className="btn-secondary px-4 py-2 text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
