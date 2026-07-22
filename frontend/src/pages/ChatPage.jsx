import { useState, useRef, useEffect } from 'react'
import { chatService } from '../services/chatService'
import { useAuth } from '../context/AuthContext'
import {
  Send,
  Bot,
  User,
  Trash2,
  Globe,
  Plus,
  X,
  Image as ImageIcon,
  Share2,
  Download,
  Copy,
  Check,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  RotateCw,
  Sparkles,
  Cpu,
  Radio,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import { exportAsMarkdown, exportAsPDF, exportAsText } from '../utils/exportUtils'
import MarkdownRenderer from '../components/UI/MarkdownRenderer'

// Animated Voice Waveform Component
function VoiceWaveform() {
  return (
    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-accent-500/20 border border-accent-500/40 text-accent-300 text-xs animate-pulse">
      <Volume2 className="w-3.5 h-3.5 text-accent-400" />
      <span className="font-mono text-[10px] uppercase tracking-wider">AI Voice Active</span>
      <div className="flex items-center gap-0.5 ml-1">
        <span className="w-1 h-3 bg-accent-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1 h-4 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1 h-2 bg-secondary-400 rounded-full animate-bounce" />
      </div>
    </div>
  )
}

// AI Thinking Neural Brain Orbit Indicator
function AIThinkingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-fade-in my-4">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 via-accent-500 to-secondary-500 flex items-center justify-center text-white shadow-glow animate-pulse-slow">
        <Bot className="w-5 h-5" />
      </div>
      <div className="glass-card px-5 py-4 border border-primary-500/40 flex items-center gap-4 shadow-glow">
        {/* Orbital Particles */}
        <div className="relative w-7 h-7 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-primary-500/30 border-t-primary-400 animate-spin" />
          <div className="absolute inset-1 rounded-full border-2 border-accent-500/30 border-b-accent-400 animate-spin-slow" />
          <Cpu className="w-3.5 h-3.5 text-primary-300 animate-pulse" />
        </div>

        <div>
          <p className="text-xs font-bold text-white flex items-center gap-2">
            Llama 3 Neural Processing <Sparkles className="w-3 h-3 text-accent-400" />
          </p>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">Synthesizing intelligent response...</p>
        </div>
      </div>
    </div>
  )
}

function ChatBubble({ msg, isUser, onCopy, onSpeak, isSpeaking, onRegenerate }) {
  const [copied, setCopied] = useState(false)
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)

  const handleCopyText = () => {
    navigator.clipboard.writeText(msg.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className={`flex items-start gap-3 animate-slide-up ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-sm shadow-glow ${
          isUser
            ? 'bg-gradient-to-br from-primary-500 to-accent-500'
            : 'bg-gradient-to-br from-secondary-500 via-primary-600 to-accent-600'
        }`}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      <div className={`max-w-[85%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1.5`}>
        {/* Content Box */}
        <div
          className={`rounded-2xl p-4 text-sm leading-relaxed border transition-all ${
            isUser
              ? 'bg-gradient-to-r from-primary-600/90 to-accent-600/90 text-white border-primary-400/40 shadow-glow rounded-tr-sm'
              : 'glass-card text-slate-100 border-white/10 rounded-tl-sm shadow-card-os'
          }`}
        >
          {msg.image_url && (
            <img
              src={msg.image_url}
              alt="Attached content"
              className="max-w-xs max-h-56 rounded-xl mb-3 border border-white/20 shadow-md object-cover"
            />
          )}

          {isUser ? (
            <span className="whitespace-pre-wrap">{msg.content}</span>
          ) : (
            <MarkdownRenderer content={msg.content} />
          )}
        </div>

        {/* Message Actions Bar (for AI) */}
        {!isUser && msg.id !== 'welcome' && (
          <div className="flex items-center gap-2 px-1 text-slate-400 text-xs flex-wrap">
            {/* Timestamp */}
            {msg.timestamp && (
              <span className="text-[10px] font-mono text-slate-500">
                {format(new Date(msg.timestamp), 'HH:mm')}
              </span>
            )}

            <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/5">
              {/* Copy */}
              <button
                onClick={handleCopyText}
                className="p-1 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                title="Copy Response"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              {/* Speak TTS */}
              <button
                onClick={() => onSpeak(msg.content)}
                className={`p-1 rounded-lg transition-colors ${
                  isSpeaking ? 'bg-accent-500 text-white' : 'hover:bg-white/10 hover:text-white'
                }`}
                title={isSpeaking ? 'Stop Audio' : 'Speak Response (TTS)'}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              {/* Like */}
              <button
                onClick={() => {
                  setLiked(!liked)
                  if (disliked) setDisliked(false)
                }}
                className={`p-1 rounded-lg transition-colors ${liked ? 'text-emerald-400' : 'hover:bg-white/10 hover:text-white'}`}
                title="Like"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>

              {/* Dislike */}
              <button
                onClick={() => {
                  setDisliked(!disliked)
                  if (liked) setLiked(false)
                }}
                className={`p-1 rounded-lg transition-colors ${disliked ? 'text-red-400' : 'hover:bg-white/10 hover:text-white'}`}
                title="Dislike"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>

              {/* Regenerate */}
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-1 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                  title="Regenerate Response"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
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
      content: `Greetings ${user?.username || 'User'}! 👋 I am your Groq-powered AI OS Assistant. How can I empower your workflow today?`,
      isUser: false,
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [webSearchEnabled, setWebSearchEnabled] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [speakingMsgContent, setSpeakingMsgContent] = useState(null)

  // Personas
  const [personas, setPersonas] = useState([])
  const [selectedPersona, setSelectedPersona] = useState(null)
  const [showPersonaModal, setShowPersonaModal] = useState(false)
  const [newPersonaName, setNewPersonaName] = useState('')
  const [newPersonaPrompt, setNewPersonaPrompt] = useState('')
  const [newPersonaDesc, setNewPersonaDesc] = useState('')
  const [newPersonaIcon, setNewPersonaIcon] = useState('🤖')

  // Attached Image state
  const [attachedImage, setAttachedImage] = useState(null)
  const imageInputRef = useRef(null)

  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-resize textarea as user types
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 240) + 'px'
  }, [input])

  useEffect(() => {
    chatService
      .getPersonas()
      .then((data) => {
        if (data.personas && data.personas.length > 0) {
          setPersonas(data.personas)
          setSelectedPersona(data.personas[0])
        }
      })
      .catch(() => {})
  }, [])

  // Inject prompt from session storage if transferred from Prompts page or Dashboard
  useEffect(() => {
    const injected = sessionStorage.getItem('inject_prompt')
    if (injected) {
      setInput(injected)
      sessionStorage.removeItem('inject_prompt')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // TTS Speech Reader
  const handleSpeak = (text) => {
    if (!('speechSynthesis' in window)) {
      toast.warning('Text-to-Speech is not supported in this browser.')
      return
    }
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
      if (speakingMsgContent === text) {
        setSpeakingMsgContent(null)
        return
      }
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.onend = () => setSpeakingMsgContent(null)
    utterance.onerror = () => setSpeakingMsgContent(null)
    setSpeakingMsgContent(text)
    window.speechSynthesis.speak(utterance)
  }

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.warning('Please select an image file.')
      return
    }
    const reader = new FileReader()
    reader.onload = (evt) => setAttachedImage(evt.target.result)
    reader.readAsDataURL(file)
  }

  const handleCreatePersona = async (e) => {
    e.preventDefault()
    if (!newPersonaName.trim() || !newPersonaPrompt.trim()) {
      toast.warning('Name and System Prompt are required.')
      return
    }
    try {
      const res = await chatService.createPersona({
        name: newPersonaName,
        system_prompt: newPersonaPrompt,
        description: newPersonaDesc,
        icon: newPersonaIcon,
      })
      toast.success('Custom persona created!')
      setPersonas((prev) => [...prev, res.persona])
      setSelectedPersona(res.persona)
      setShowPersonaModal(false)
      setNewPersonaName('')
      setNewPersonaPrompt('')
      setNewPersonaDesc('')
    } catch {
      toast.error('Failed to create persona.')
    }
  }

  const sendMessage = async () => {
    const text = input.trim()
    if ((!text && !attachedImage) || loading) return

    const currentImage = attachedImage
    const userMsg = {
      id: Date.now(),
      content: text || '[Vision analysis attachment]',
      image_url: currentImage,
      isUser: true,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setAttachedImage(null)
    setLoading(true)

    try {
      const data = await chatService.sendMessage(
        text || 'Analyze attached image',
        webSearchEnabled,
        selectedPersona?.system_prompt,
        currentImage
      )

      const aiMsg = {
        id: Date.now() + 1,
        content: data.reply || data.response || 'No response received.',
        isUser: false,
        timestamp: data.chat?.timestamp || new Date().toISOString(),
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      const errMsg = err?.response?.data?.error || 'Failed to get a response.'
      toast.error(errMsg)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          content: `⚠️ ${errMsg}`,
          isUser: false,
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const regenerateLastMessage = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.isUser)
    if (lastUserMsg) {
      setInput(lastUserMsg.content)
      sendMessage()
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        content: `Chat reset. Active Persona: **${selectedPersona?.name || 'General Assistant'}**. What's next? 🤖`,
        isUser: false,
        timestamp: new Date().toISOString(),
      },
    ])
  }

  const shareChat = async () => {
    const shareable = messages.filter((m) => m.id !== 'welcome')
    if (shareable.length === 0) {
      toast.warning('No messages to share.')
      return
    }
    try {
      const apiMod = await import('../services/api')
      const res = await apiMod.default.post('/share/', {
        title: `AI Chat — ${new Date().toLocaleDateString()}`,
        messages: shareable,
      })
      const shareUrl = `${window.location.origin}/share/${res.data.share_id}`
      navigator.clipboard.writeText(shareUrl)
      toast.success(`Shareable link copied! 🔗`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to share conversation.')
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] glass-card border border-white/10 overflow-hidden shadow-glow-lg">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-6 py-3.5 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-lg shadow-glow">
            {selectedPersona?.icon || '🤖'}
          </div>
          <div>
            <p className="font-extrabold text-white text-sm flex items-center gap-2">
              {selectedPersona?.name || 'AI Assistant'} <Sparkles className="w-3.5 h-3.5 text-accent-400" />
            </p>
            <p className="text-[11px] text-slate-400 truncate max-w-xs">
              {selectedPersona?.description || 'General intelligent agent'}
            </p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Audio Speaking Waveform Indicator */}
          {speakingMsgContent && <VoiceWaveform />}

          {/* Persona Selector */}
          <select
            value={selectedPersona?.id || ''}
            onChange={(e) => {
              const val = e.target.value
              if (val === 'create_new') {
                setShowPersonaModal(true)
              } else {
                const found = personas.find((p) => String(p.id) === String(val))
                if (found) setSelectedPersona(found)
              }
            }}
            className="input-os text-xs py-1.5 px-3 rounded-xl cursor-pointer w-auto"
          >
            <optgroup label="Select Persona">
              {personas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.icon} {p.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Custom">
              <option value="create_new">➕ Create Custom Persona...</option>
            </optgroup>
          </select>

          {/* Web Search Grounding Toggle */}
          <button
            onClick={() => setWebSearchEnabled((prev) => !prev)}
            className={`btn-os-secondary text-xs px-3 py-1.5 gap-1.5 ${
              webSearchEnabled ? 'border-primary-500/80 bg-primary-500/20 text-white shadow-glow' : ''
            }`}
          >
            <Globe className={`w-3.5 h-3.5 ${webSearchEnabled ? 'text-primary-400 animate-spin' : ''}`} />
            <span>Search {webSearchEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Share */}
          <button
            onClick={shareChat}
            className="btn-os-ghost p-2 rounded-xl text-slate-300"
            title="Share Conversation"
            disabled={messages.length <= 1}
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Export */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu((p) => !p)}
              className="btn-os-ghost p-2 rounded-xl text-slate-300"
              title="Export Conversation"
              disabled={messages.length <= 1}
            >
              <Download className="w-4 h-4" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 z-50 glass-card border border-white/10 p-2 min-w-[160px] shadow-glow-lg animate-fade-in">
                <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Export Format</p>
                {[
                  { label: '📝 Markdown (.md)', fn: () => { exportAsMarkdown(messages, `Chat — ${new Date().toLocaleDateString()}`); setShowExportMenu(false) } },
                  { label: '📄 Text (.txt)', fn: () => { exportAsText(messages, `Chat — ${new Date().toLocaleDateString()}`); setShowExportMenu(false) } },
                  { label: '🖨️ PDF Document', fn: () => { exportAsPDF(messages, `Chat — ${new Date().toLocaleDateString()}`); setShowExportMenu(false) } },
                ].map(({ label, fn }) => (
                  <button
                    key={label}
                    onClick={fn}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-primary-500/20 hover:text-white rounded-lg transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear */}
          <button
            onClick={clearChat}
            className="btn-os-ghost p-2 rounded-xl text-slate-400 hover:text-red-400"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Stream Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            msg={msg}
            isUser={msg.isUser}
            onSpeak={handleSpeak}
            isSpeaking={speakingMsgContent === msg.content}
            onRegenerate={!msg.isUser ? regenerateLastMessage : undefined}
          />
        ))}

        {loading && <AIThinkingIndicator />}

        <div ref={bottomRef} />
      </div>

      {/* Input Dock */}
      <div className="p-4 border-t border-white/10 bg-slate-950/80 backdrop-blur-xl">
        {attachedImage && (
          <div className="mb-3 inline-flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-white/10">
            <img src={attachedImage} alt="Attachment" className="w-12 h-12 rounded-lg object-cover" />
            <span className="text-xs text-slate-300">Vision image attached</span>
            <button onClick={() => setAttachedImage(null)} className="text-slate-400 hover:text-red-400 ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <input
            type="file"
            ref={imageInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={loading}
            className="btn-os-secondary p-3 h-12 w-12 flex-shrink-0 rounded-xl"
            title="Attach image for vision analysis"
          >
            <ImageIcon className="w-5 h-5 text-slate-300" />
          </button>

          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={`Instruct ${selectedPersona?.name || 'Groq AI'}... (Enter to send, Shift+Enter for newline)`}
            rows={1}
            className="input-os resize-none min-h-[48px] py-3 overflow-y-auto transition-all duration-150"
            style={{ maxHeight: '240px' }}
            disabled={loading}
          />

          <button
            onClick={sendMessage}
            disabled={(!input.trim() && !attachedImage) || loading}
            className="btn-os-primary p-3 h-12 w-12 flex-shrink-0 rounded-xl"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Create Persona Modal */}
      {showPersonaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="glass-card border border-white/10 w-full max-w-md p-6 relative shadow-glow-lg">
            <button
              onClick={() => setShowPersonaModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-400" /> Create Custom Persona
            </h3>
            <form onSubmit={handleCreatePersona} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Name</label>
                <input
                  type="text"
                  placeholder="e.g. Python Specialist"
                  value={newPersonaName}
                  onChange={(e) => setNewPersonaName(e.target.value)}
                  className="input-os py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Icon (Emoji)</label>
                <input
                  type="text"
                  placeholder="🤖"
                  value={newPersonaIcon}
                  onChange={(e) => setNewPersonaIcon(e.target.value)}
                  className="input-os py-2 w-20 text-center"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">System Instruction Prompt</label>
                <textarea
                  placeholder="You are an expert Python specialist..."
                  value={newPersonaPrompt}
                  onChange={(e) => setNewPersonaPrompt(e.target.value)}
                  className="input-os py-2 h-24 resize-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPersonaModal(false)}
                  className="btn-os-ghost text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-os-primary text-xs px-5 py-2">
                  Save Persona
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
