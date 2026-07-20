import { useState } from 'react'
import {
  RiCodeSSlashLine,
  RiSendPlaneLine,
  RiFileCopyLine,
  RiCheckLine,
  RiDeleteBinLine,
  RiLightbulbLine,
} from 'react-icons/ri'
import api from '../services/api'

const LANGUAGE_OPTIONS = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Rust', 'SQL', 'Bash',
]

const EXAMPLE_PROMPTS = [
  'Write a Python function to sort a list of dictionaries by a key',
  'Create a React hook for fetching data with loading and error states',
  'Write a SQL query to find duplicate rows in a table',
  'Implement a binary search algorithm in JavaScript',
]

/** Strip markdown fenced code blocks (```lang ... ```) and return only the code inside. */
function extractCode(raw) {
  if (!raw) return ''
  // Match ```<lang>\n<code>\n``` or just ``` ... ```
  const fenceMatch = raw.match(/```[\w]*\n?([\s\S]*?)```/)
  if (fenceMatch) return fenceMatch[1]
  // Fallback: remove any leading/trailing fence lines
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
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to generate code.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setPrompt('')
    setResult('')
    setError('')
  }

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-rose-500 flex items-center justify-center">
            <RiCodeSSlashLine className="text-white text-xl" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Code Generator</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 ml-13">
          Describe what you need and get AI-generated code instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Language selector */}
          <div className="card p-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Language
            </label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    language === lang
                      ? 'bg-rose-500 text-white shadow'
                      : 'bg-slate-100 dark:bg-dark-600 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt input */}
          <div className="card p-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Describe your code
            </label>
            <textarea
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleGenerate()
              }}
              placeholder="e.g. Write a function that reverses a string without using built-in methods..."
              className="w-full bg-slate-50 dark:bg-dark-700 border border-slate-200 dark:border-dark-500 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
            />
            <div className="flex gap-3 mt-3">
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
              >
                {loading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" />
                ) : (
                  <RiSendPlaneLine />
                )}
                {loading ? 'Generating…' : 'Generate Code'}
              </button>
              <button
                onClick={handleClear}
                className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-rose-500 text-sm font-medium transition-colors"
              >
                <RiDeleteBinLine /> Clear
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="card p-4 border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Output */}
          {result && (
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Generated {language} Code
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-rose-500 transition-colors"
                >
                  {copied ? <RiCheckLine className="text-green-500" /> : <RiFileCopyLine />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="bg-slate-900 dark:bg-dark-900 text-green-400 text-sm rounded-xl p-4 overflow-auto max-h-[500px] font-mono leading-relaxed">
                <code style={{ whiteSpace: 'pre', tabSize: 4 }}>{result}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Right panel – example prompts */}
        <div className="space-y-4">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <RiLightbulbLine className="text-amber-500" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Example Prompts</span>
            </div>
            <ul className="space-y-2">
              {EXAMPLE_PROMPTS.map((ex) => (
                <li key={ex}>
                  <button
                    onClick={() => setPrompt(ex)}
                    className="w-full text-left text-xs text-slate-600 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 bg-slate-50 dark:bg-dark-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg px-3 py-2 transition-colors"
                  >
                    {ex}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-4 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border-rose-100 dark:border-rose-800">
            <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 mb-1">Pro Tip</p>
            <p className="text-xs text-rose-600 dark:text-rose-300 leading-relaxed">
              Be specific about inputs, outputs, and edge cases for better results.
              Press <kbd className="bg-rose-100 dark:bg-rose-900/40 px-1 rounded text-rose-700 dark:text-rose-300">Ctrl+Enter</kbd> to generate.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
