import { useState } from 'react'
import {
  Code,
  Send,
  Copy,
  Check,
  Trash2,
  Sparkles,
  Play,
  Terminal,
  Download,
} from 'lucide-react'
import api from '../services/api'
import CodePlayground from '../components/CodePlayground'
import { toast } from 'react-toastify'

const LANGUAGE_OPTIONS = [
  'Python',
  'JavaScript',
  'TypeScript',
  'Java',
  'C++',
  'C#',
  'Go',
  'Rust',
  'SQL',
  'Bash',
]

function extractCode(raw) {
  if (!raw) return ''
  const fenceMatch = raw.match(/```[\w]*\n?([\s\S]*?)```/)
  if (fenceMatch) return fenceMatch[1]
  return raw.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '')
}

export default function CodeGenPage() {
  const [prompt, setPrompt] = useState('')
  const [language, setLanguage] = useState('Python')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setResult('')
    setError('')

    try {
      const res = await api.post('/ai/generate-code', {
        prompt: prompt.trim(),
        language: language.toLowerCase(),
      })
      const raw = res.data?.code || ''
      setResult(extractCode(raw))
      toast.success('Code generated successfully!')
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to generate code.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    toast.success('Code copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadCode = () => {
    const extMap = { Python: 'py', JavaScript: 'js', TypeScript: 'ts', Java: 'java', 'C++': 'cpp', 'C#': 'cs', Go: 'go', Rust: 'rs', SQL: 'sql', Bash: 'sh' }
    const ext = extMap[language] || 'txt'
    const blob = new Blob([result], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `generated_code.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClear = () => {
    setPrompt('')
    setResult('')
    setError('')
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <Code className="w-7 h-7 text-primary-400" /> Code Generator
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Instruct the AI to generate production-ready code with interactive sandbox execution
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-6">
          {/* Language bar */}
          <div className="glass-card border border-white/10 p-5 space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Target Programming Language
            </label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    language === lang
                      ? 'bg-primary-500 text-white '
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Editor */}
          <div className="glass-card border border-white/10 p-5 space-y-4">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Code Prompt Instructions
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleGenerate()
              }}
              placeholder="Describe the logic, algorithm, or component you want to build... (Ctrl+Enter to generate)"
              className="input-os resize-none text-xs leading-relaxed"
            />

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                  className="btn-os-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2 "
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-accent-400" />
                  )}
                  {loading ? 'Synthesizing...' : 'Generate Code'}
                </button>
                <button
                  onClick={handleClear}
                  className="btn-os-ghost text-xs text-slate-400 hover:text-red-400 flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" /> Clear
                </button>
              </div>

              <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                Ctrl + Enter to compile
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="glass-card border border-red-500/40 bg-red-500/10 p-4 text-xs text-red-300">
              <p>{error}</p>
            </div>
          )}

          {/* Interactive Code Playground & Output */}
          {result && (
            <div className="space-y-3 animate-slide-up">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" /> Interactive Execution Sandbox
                </h2>
                <div className="flex items-center gap-2">
                  <button onClick={handleCopy} className="btn-os-ghost p-1.5 text-xs" title="Copy">
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button onClick={handleDownloadCode} className="btn-os-ghost p-1.5 text-xs" title="Download">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <CodePlayground initialCode={result} initialLanguage={language} />
            </div>
          )}
        </div>


      </div>
    </div>
  )
}
