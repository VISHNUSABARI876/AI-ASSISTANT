import { useState, useEffect } from 'react'
import { fileService } from '../services/fileService'
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Download,
  Trash2,
  Clock,
  BookOpen,
  Cpu,
  HelpCircle,
  ArrowRight,
  FileCheck,
} from 'lucide-react'
import { toast } from 'react-toastify'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import MarkdownRenderer from '../components/UI/MarkdownRenderer'

export default function PDFSummarizePage() {
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState('')
  const [manualText, setManualText] = useState('')
  const [question, setQuestion] = useState('')
  const [mode, setMode] = useState('file') // 'file' | 'text' | 'qa'
  const [summary, setSummary] = useState('')
  const [qaSources, setQaSources] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fileService
      .listFiles()
      .then((data) => {
        setFiles(
          (data.files || []).filter(
            (f) =>
              f.filename.toLowerCase().endsWith('.pdf') ||
              f.filename.toLowerCase().endsWith('.txt')
          )
        )
      })
      .catch(() => {})
  }, [])

  const handleAction = async () => {
    if ((mode === 'file' || mode === 'qa') && !selectedFile) {
      toast.warning('Please select a file.')
      return
    }
    if (mode === 'text' && manualText.trim().length < 30) {
      toast.warning('Please enter at least 30 characters of text.')
      return
    }
    if (mode === 'qa' && !question.trim()) {
      toast.warning('Please enter a question.')
      return
    }

    setLoading(true)
    setSummary('')
    setQaSources([])
    setStats(null)

    try {
      if (mode === 'qa') {
        const data = await fileService.queryDocument(Number(selectedFile), question)
        setSummary(data.answer || '')
        setQaSources(data.sources || [])
        toast.success('Document answer generated!')
      } else {
        const data =
          mode === 'file'
            ? await fileService.summarizeFile(Number(selectedFile))
            : await fileService.summarizeText(manualText)
        setSummary(data.summary || '')
        setStats({ original: data.original_length, summary: data.summary_length })
        toast.success('Summary generated!')
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed.')
    } finally {
      setLoading(false)
    }
  }

  const copySummary = () => {
    navigator.clipboard.writeText(summary)
    setCopied(true)
    toast.success('Summary copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadSummary = () => {
    const blob = new Blob([summary], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `AI_Summary_${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const wordCount = summary ? summary.trim().split(/\s+/).length : 0
  const readTimeMin = Math.ceil(wordCount / 200)

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <FileText className="w-7 h-7 text-accent-400" /> Document Intelligence & Summarizer
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Vector RAG Document analysis, quick summarization, and interactive document Q&A
        </p>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex gap-2 flex-wrap bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 w-fit">
        <button
          onClick={() => setMode('file')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            mode === 'file'
              ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-glow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Document Summary
        </button>

        <button
          onClick={() => setMode('qa')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            mode === 'qa'
              ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-glow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" /> Document Q&A (RAG)
        </button>

        <button
          onClick={() => setMode('text')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            mode === 'text'
              ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-glow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> Paste Raw Text
        </button>
      </div>

      {/* Split Layout Container */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Side: Input & Document Selector */}
        <div className="glass-card border border-white/10 p-6 flex flex-col justify-between shadow-glow">
          <div className="space-y-4">
            <h2 className="font-bold text-white text-base flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary-400" />
              {mode === 'text' ? 'Raw Text Input' : 'Select Context Document'}
            </h2>

            {mode !== 'text' ? (
              files.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <FileText className="w-10 h-10 mx-auto text-slate-600 animate-pulse" />
                  <p className="text-sm font-semibold">No ingested documents found.</p>
                  <a href="/upload" className="text-xs text-primary-400 font-semibold underline">
                    Upload PDF or TXT document →
                  </a>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar pr-1">
                  {files.map((file) => (
                    <label
                      key={file.id}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selectedFile === String(file.id)
                          ? 'border-primary-500 bg-primary-500/15 shadow-glow text-white'
                          : 'border-white/5 bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="fileSelect"
                        value={file.id}
                        checked={selectedFile === String(file.id)}
                        onChange={(e) => setSelectedFile(e.target.value)}
                        className="text-primary-500"
                      />
                      <FileText className="w-4 h-4 text-accent-400 flex-shrink-0" />
                      <span className="text-xs font-semibold truncate">{file.filename}</span>
                    </label>
                  ))}
                </div>
              )
            ) : (
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Paste raw text here to analyze..."
                className="input-os h-64 resize-none text-xs leading-relaxed"
              />
            )}

            {mode === 'qa' && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Query Document
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. What are the key objectives mentioned in this document?"
                  className="input-os text-xs py-2.5"
                />
              </div>
            )}
          </div>

          <button
            onClick={handleAction}
            disabled={loading}
            className="btn-os-primary w-full py-3 mt-6 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-glow"
          >
            {loading ? (
              <LoadingSpinner size="sm" text="Processing..." />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {mode === 'qa' ? 'Ask RAG Document Engine' : 'Generate AI Summary'}
              </>
            )}
          </button>
        </div>

        {/* Right Side: AI Summary Output Editor */}
        <div className="glass-card border border-white/10 p-6 flex flex-col justify-between shadow-glow">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <h2 className="font-bold text-white text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-400" />
                {mode === 'qa' ? 'AI Answer' : 'AI Summary'}
              </h2>

              {summary && (
                <div className="flex items-center gap-2">
                  {/* Reading Metrics */}
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-white/5">
                    <Clock className="w-3 h-3 text-accent-400" /> ~{readTimeMin} min read ({wordCount} words)
                  </span>

                  <button onClick={copySummary} className="btn-os-ghost p-1.5 rounded-lg text-slate-300" title="Copy">
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button onClick={downloadSummary} className="btn-os-ghost p-1.5 rounded-lg text-slate-300" title="Download">
                    <Download className="w-4 h-4" />
                  </button>
                  <button onClick={() => setSummary('')} className="btn-os-ghost p-1.5 rounded-lg text-slate-400 hover:text-red-400" title="Clear">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {loading && (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" text={mode === 'qa' ? 'Retrieving vector chunks...' : 'Synthesizing key insights...'} />
              </div>
            )}

            {!loading && !summary && (
              <div className="text-center py-20 text-slate-400 space-y-2">
                <Sparkles className="w-10 h-10 mx-auto text-slate-600 animate-pulse" />
                <p className="text-sm font-semibold text-slate-300">
                  {mode === 'qa' ? 'Answers will generate here' : 'AI Summary will generate here'}
                </p>
                <p className="text-xs text-slate-500">Select input source and launch execution.</p>
              </div>
            )}

            {summary && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-white/10 text-xs leading-relaxed max-h-96 overflow-y-auto no-scrollbar">
                  <MarkdownRenderer content={summary} />
                </div>

                {/* Referenced Vector Sources */}
                {qaSources.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Vector Context Sources
                    </p>
                    <div className="space-y-1.5">
                      {qaSources.map((src) => (
                        <div key={src.chunk_id} className="p-2.5 rounded-lg bg-slate-900/80 border border-white/5 text-xs text-slate-300">
                          <span className="text-[10px] font-mono font-bold text-primary-400">Chunk #{src.chunk_id}</span>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{src.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
