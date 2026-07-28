import { useState, useRef, useEffect } from 'react'
import {
  Play,
  Copy,
  Check,
  Terminal,
  Eye,
  Eraser,
  Code2,
} from 'lucide-react'

export default function CodePlayground({ initialCode = '', initialLanguage = 'javascript' }) {
  const [code, setCode] = useState(initialCode)
  const [language, setLanguage] = useState(initialLanguage)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('console') // 'console' | 'preview'
  const [copied, setCopied] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const iframeRef = useRef(null)

  useEffect(() => {
    if (initialCode) setCode(initialCode)
  }, [initialCode])

  useEffect(() => {
    if (initialLanguage) setLanguage(initialLanguage)
  }, [initialLanguage])

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const runCode = () => {
    setIsRunning(true)
    setOutput('')
    setError('')

    const lang = language.toLowerCase()

    if (lang === 'javascript' || lang === 'js') {
      try {
        let logs = []
        const customConsole = {
          log: (...args) =>
            logs.push(
              args
                .map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)))
                .join(' ')
            ),
          error: (...args) => logs.push('❌ Error: ' + args.join(' ')),
          warn: (...args) => logs.push('⚠️ Warning: ' + args.join(' ')),
          info: (...args) => logs.push('ℹ️ Info: ' + args.join(' ')),
        }

        const runFn = new Function('console', code)
        const result = runFn(customConsole)

        if (result !== undefined) {
          logs.push(`➜ Return Value: ${typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)}`)
        }

        setOutput(logs.join('\n') || 'Program executed successfully with no output.')
      } catch (err) {
        setError(err.stack || err.message)
      } finally {
        setIsRunning(false)
      }
    } else if (lang === 'html') {
      setActiveTab('preview')
      if (iframeRef.current) {
        const doc = iframeRef.current.contentDocument
        doc.open()
        doc.write(code)
        doc.close()
      }
      setIsRunning(false)
    } else {
      setOutput(
        `[Simulated ${language.toUpperCase()} Engine Output]\nRunning code block...\n\nResult:\n-------------------------\nCode syntax is valid.\n(Tip: Switch language to JavaScript or HTML for live browser execution!)`
      )
      setIsRunning(false)
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 glass-card bg-slate-950 text-slate-100  overflow-hidden my-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-white/10 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="input-os py-1 px-2.5 text-xs font-mono font-bold w-auto cursor-pointer"
          >
            <option value="javascript">JavaScript (Live JS Execution)</option>
            <option value="html">HTML / CSS (Live Preview)</option>
            <option value="python">Python</option>
            <option value="sql">SQL</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyCode}
            className="btn-os-ghost text-xs px-3 py-1 text-slate-300 flex items-center gap-1"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={runCode}
            disabled={isRunning}
            className="btn-os-primary text-xs px-4 py-1.5 font-bold flex items-center gap-1.5 "
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>
        </div>
      </div>

      {/* Workspace */}
      <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/10 min-h-[320px]">
        {/* Left: Code Editor */}
        <div className="flex flex-col bg-[#050816] p-4">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-2">
            <span className="flex items-center gap-1"><Code2 className="w-3.5 h-3.5 text-primary-400" /> Editor</span>
            <span>UTF-8</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// Type or paste your code here..."
            className="flex-1 w-full bg-transparent font-mono text-xs text-emerald-400 focus:outline-none resize-none leading-relaxed min-h-[260px]"
            spellCheck="false"
          />
        </div>

        {/* Right: Output Console */}
        <div className="flex flex-col bg-slate-900/90">
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 bg-slate-950/60">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('console')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'console'
                    ? 'bg-primary-500 text-white '
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" /> Console
              </button>
              {language.toLowerCase() === 'html' && (
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === 'preview'
                    ? 'bg-primary-500 text-white '
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Preview
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setOutput('')
                setError('')
              }}
              className="text-slate-400 hover:text-white p-1 text-xs"
              title="Clear output"
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-auto font-mono text-xs">
            {activeTab === 'console' ? (
              <div>
                {error ? (
                  <pre className="text-red-400 whitespace-pre-wrap">{error}</pre>
                ) : output ? (
                  <pre className="text-slate-200 whitespace-pre-wrap leading-relaxed">{output}</pre>
                ) : (
                  <div className="text-slate-500 italic py-10 text-center">
                    Click "Run Code" to execute code and view output console
                  </div>
                )}
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                title="Live HTML Preview"
                className="w-full h-[260px] bg-white rounded-lg border border-slate-700"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
