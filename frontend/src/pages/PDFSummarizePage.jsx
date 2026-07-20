import { useState, useEffect } from 'react'
import { fileService } from '../services/fileService'
import { RiFilePdfLine, RiSparklingLine, RiFileCopyLine, RiCheckLine } from 'react-icons/ri'
import { toast } from 'react-toastify'
import LoadingSpinner from '../components/UI/LoadingSpinner'

export default function PDFSummarizePage() {
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState('')
  const [manualText, setManualText] = useState('')
  const [mode, setMode] = useState('file') // 'file' | 'text'
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fileService.listFiles().then((data) => {
      setFiles((data.files || []).filter((f) => f.filename.toLowerCase().endsWith('.pdf') || f.filename.toLowerCase().endsWith('.txt')))
    }).catch(() => {})
  }, [])

  const handleSummarize = async () => {
    if (mode === 'file' && !selectedFile) { toast.warning('Please select a file.'); return }
    if (mode === 'text' && manualText.trim().length < 50) { toast.warning('Please enter at least 50 characters of text.'); return }

    setLoading(true)
    setSummary('')
    setStats(null)
    try {
      const data = mode === 'file'
        ? await fileService.summarizeFile(Number(selectedFile))
        : await fileService.summarizeText(manualText)
      setSummary(data.summary || '')
      setStats({ original: data.original_length, summary: data.summary_length })
      toast.success('Summary generated!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Summarization failed.')
    } finally {
      setLoading(false)
    }
  }

  const copySummary = () => {
    navigator.clipboard.writeText(summary)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="page-container py-8">
      <h1 className="page-title mb-1">PDF Summarizer</h1>
      <p className="page-subtitle mb-8">Extract key insights from documents using AI</p>

      {/* Mode tabs */}
      <div className="flex gap-2 mb-6">
        <button
          id="tab-file"
          onClick={() => setMode('file')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            mode === 'file'
              ? 'bg-primary-600 text-white shadow-glow'
              : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
          }`}
        >
          📁 From Uploaded File
        </button>
        <button
          id="tab-text"
          onClick={() => setMode('text')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            mode === 'text'
              ? 'bg-primary-600 text-white shadow-glow'
              : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
          }`}
        >
          ✏️ Paste Text
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="card p-6">
          <h2 className="font-bold text-slate-800 dark:text-white mb-4">
            {mode === 'file' ? 'Select Document' : 'Enter Text'}
          </h2>

          {mode === 'file' ? (
            files.length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                <RiFilePdfLine className="text-4xl mx-auto mb-2" />
                <p className="text-sm">No files uploaded yet.</p>
                <a href="/upload" className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline mt-1 inline-block">
                  Upload a file →
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                {files.map((file) => (
                  <label
                    key={file.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedFile === String(file.id)
                        ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="fileSelect"
                      value={file.id}
                      checked={selectedFile === String(file.id)}
                      onChange={(e) => setSelectedFile(e.target.value)}
                      className="text-primary-600"
                    />
                    <RiFilePdfLine className="text-red-400 text-lg flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{file.filename}</span>
                  </label>
                ))}
              </div>
            )
          ) : (
            <textarea
              id="manual-text-input"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Paste your text here to summarize (minimum 50 characters)..."
              className="input min-h-[220px] resize-y font-sans text-sm leading-relaxed"
            />
          )}

          <button
            id="summarize-btn"
            onClick={handleSummarize}
            disabled={loading}
            className="btn-primary w-full mt-6 py-3 gap-2"
          >
            {loading ? (
              <><LoadingSpinner size="sm" /> Summarizing...</>
            ) : (
              <><RiSparklingLine /> Summarize with AI</>
            )}
          </button>
        </div>

        {/* Output */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 dark:text-white">AI Summary</h2>
            {summary && (
              <button onClick={copySummary} className="btn-ghost text-xs gap-1.5">
                {copied ? <RiCheckLine className="text-green-500" /> : <RiFileCopyLine />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-16">
              <LoadingSpinner size="lg" text="Generating summary..." />
            </div>
          )}

          {!loading && !summary && (
            <div className="text-center py-16 text-slate-400 dark:text-slate-500">
              <RiSparklingLine className="text-5xl mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">Summary will appear here</p>
              <p className="text-xs mt-1">Select a file or paste text, then click Summarize</p>
            </div>
          )}

          {summary && (
            <div className="animate-fade-in">
              <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-2xl p-5">
                <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed">{summary}</p>
              </div>
              {stats && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-slate-800 dark:text-white">{stats.original?.toLocaleString()}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Original chars</p>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-slate-800 dark:text-white">{stats.summary?.toLocaleString()}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Summary chars</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
