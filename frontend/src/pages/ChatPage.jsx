import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { chatService } from '../services/chatService'
import { useAuth } from '../context/AuthContext'
import { RiSendPlaneLine, RiRobot2Line, RiUser3Line, RiDeleteBinLine } from 'react-icons/ri'
import { TypingIndicator } from '../components/UI/LoadingSpinner'
import { toast } from 'react-toastify'
import { format } from 'date-fns'

/** Renders AI markdown responses with proper code blocks, bold, lists etc. */
function MarkdownMessage({ content }) {
  return (
    <ReactMarkdown
      components={{
        // Fenced code blocks → dark scrollable block
        code({ inline, className, children, ...props }) {
          const code = String(children).replace(/\n$/, '')
          if (inline) {
            return (
              <code
                className="bg-slate-200 dark:bg-slate-600 text-rose-600 dark:text-rose-300 px-1 py-0.5 rounded text-[0.8em] font-mono"
                {...props}
              >
                {code}
              </code>
            )
          }
          return (
            <pre className="bg-slate-900 text-green-400 rounded-xl p-3 my-2 overflow-auto text-xs font-mono leading-relaxed whitespace-pre">
              <code>{code}</code>
            </pre>
          )
        },
        // Paragraphs — keep spacing
        p({ children }) {
          return <p className="mb-2 last:mb-0">{children}</p>
        },
        // Bold
        strong({ children }) {
          return <strong className="font-semibold">{children}</strong>
        },
        // Lists
        ul({ children }) {
          return <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>
        },
        ol({ children }) {
          return <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol>
        },
        li({ children }) {
          return <li className="text-sm">{children}</li>
        },
        // Headings
        h1({ children }) { return <h1 className="text-base font-bold mb-1">{children}</h1> },
        h2({ children }) { return <h2 className="text-sm font-bold mb-1">{children}</h2> },
        h3({ children }) { return <h3 className="text-sm font-semibold mb-1">{children}</h3> },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

function ChatBubble({ msg, isUser }) {
  return (
    <div className={`flex items-start gap-3 animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm ${isUser
            ? 'bg-gradient-to-br from-primary-400 to-primary-600'
            : 'bg-gradient-to-br from-accent-400 to-accent-600'
          }`}
      >
        {isUser ? <RiUser3Line /> : <RiRobot2Line />}
      </div>
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser
              ? 'bg-primary-600 text-white rounded-tr-sm'
              : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-600 rounded-tl-sm shadow-sm'
            }`}
        >
          {isUser ? (
            <span className="whitespace-pre-wrap">{msg.content}</span>
          ) : (
            <MarkdownMessage content={msg.content} />
          )}
        </div>
        {msg.timestamp && (
          <span className="text-[10px] text-slate-400 dark:text-slate-500 px-1">
            {format(new Date(msg.timestamp), 'HH:mm')}
          </span>
        )}
      </div>
    </div>
  )
}

export default function ChatPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      content: `Hello ${user?.username || 'there'}! 👋 I'm your AI assistant powered by Groq. Ask me anything — I'm here to help!`,
      isUser: false,
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { id: Date.now(), content: text, isUser: true, timestamp: new Date().toISOString() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const data = await chatService.sendMessage(text)
      const aiMsg = {
        id: Date.now() + 1,
        content: data.reply,
        isUser: false,
        timestamp: data.chat?.timestamp || new Date().toISOString(),
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      console.error('CHAT ERROR:', err)
      toast.error('Failed to get AI response.')
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, content: 'Sorry, I encountered an error. Please try again.', isUser: false, timestamp: new Date().toISOString() },
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      content: `Chat cleared! I'm still here — what's on your mind? 🤖`,
      isUser: false,
      timestamp: new Date().toISOString(),
    }])
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-dark-800">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700/50 glass">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
            <RiRobot2Line className="text-white text-lg" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">AI Assistant</p>
            <p className="text-xs text-accent-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-accent-500 inline-block animate-pulse" />
              Online
            </p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="btn-ghost text-xs gap-1.5 text-slate-500"
          title="Clear chat"
          id="clear-chat-btn"
        >
          <RiDeleteBinLine /> Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} msg={msg} isUser={msg.isUser} />
        ))}
        {loading && (
          <div className="flex items-start gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center flex-shrink-0 text-white">
              <RiRobot2Line />
            </div>
            <div className="bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-2xl rounded-tl-sm shadow-sm">
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-3 border-t border-slate-200 dark:border-slate-700/50 glass">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask me anything... (Enter to send, Shift+Enter for new line)"
              rows={1}
              className="input resize-none min-h-[48px] max-h-32 py-3 pr-4 leading-relaxed"
              style={{ overflowY: 'auto' }}
              disabled={loading}
            />
          </div>
          <button
            id="send-message-btn"
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="btn-primary p-3 h-12 w-12 flex-shrink-0 rounded-xl"
            aria-label="Send message"
          >
            <RiSendPlaneLine className="text-lg" />
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-2">
          Powered by Groq · Responses may not always be accurate
        </p>
      </div>
    </div>
  )
}
