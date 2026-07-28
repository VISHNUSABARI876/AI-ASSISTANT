import { useState, useEffect, useCallback, useRef } from 'react'
import { fileService } from '../services/fileService'
import {
  UploadCloud,
  FileText,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  FileCheck,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import { PageLoader } from '../components/UI/LoadingSpinner'

export default function FileUploadPage() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const inputRef = useRef(null)

  const loadFiles = useCallback(async () => {
    try {
      const data = await fileService.listFiles()
      setFiles(data.files || [])
    } catch {
      toast.error('Failed to load file vault.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  const handleUpload = async (file) => {
    if (!file) return
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['pdf', 'txt'].includes(ext)) {
      toast.error('Only PDF and TXT files are supported.')
      return
    }
    if (file.size > 16 * 1024 * 1024) {
      toast.error('File size must be under 16 MB.')
      return
    }

    setUploading(true)
    setProgress(0)
    setUploadSuccess(false)

    try {
      const data = await fileService.uploadFile(file, setProgress)
      setUploadSuccess(true)
      toast.success(`"${file.name}" ingested successfully!`)
      setFiles((prev) => [data.file, ...prev])
      setTimeout(() => setUploadSuccess(false), 3000)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed.')
    } finally {
      setUploading(false)
      setProgress(0)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleFileInput = (e) => handleUpload(e.target.files[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleUpload(e.dataTransfer.files[0])
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove file "${name}" from vault?`)) return
    try {
      await fileService.deleteFile(id)
      setFiles((prev) => prev.filter((f) => f.id !== id))
      toast.success('File removed.')
    } catch {
      toast.error('Failed to delete file.')
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <UploadCloud className="w-7 h-7 text-primary-400" /> Document Ingestion Hub
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload PDF and TXT documents into the AI context engine (Max 16 MB per file)
        </p>
      </div>

      {/* Drag & Drop Zone */}
      <div
        id="file-drop-zone"
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`
          relative glass-card border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center cursor-pointer
          transition-all duration-300 overflow-hidden group
          ${
            dragOver
              ? 'border-primary-400 bg-primary-500/10 scale-[1.01]'
              : 'border-white/20 hover:border-primary-400/60 hover:bg-slate-900/60'
          }
          ${uploading ? 'pointer-events-none' : ''}
        `}
      >
        <input
          ref={inputRef}
          id="file-upload-input"
          type="file"
          accept=".pdf,.txt"
          className="hidden"
          onChange={handleFileInput}
          disabled={uploading}
        />

        {/* Ambient Gradient Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/10 via-accent-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
          {uploadSuccess ? (
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center animate-bounce ">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center  group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8 animate-pulse" />
            </div>
          )}

          <div>
            <p className="text-lg font-bold text-white">
              {uploading ? 'Processing File...' : uploadSuccess ? 'Ingestion Complete!' : 'Drag & Drop Document Here'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              or <span className="text-primary-400 font-semibold underline">Browse local files</span> (PDF, TXT supported)
            </p>
          </div>

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="w-full max-w-xs space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>Ingesting</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 via-accent-500 to-secondary-400 rounded-full transition-all duration-300 "
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Uploaded Documents List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center justify-between">
          <span>Ingested Documents</span>
          <span className="text-xs font-mono text-primary-400 bg-primary-500/10 px-2.5 py-1 rounded-full border border-primary-500/20">
            {files.length} Saved
          </span>
        </h2>

        {files.length === 0 ? (
          <div className="glass-card p-10 text-center text-slate-400 space-y-2">
            <FileText className="w-10 h-10 mx-auto text-slate-600 animate-pulse" />
            <p className="font-semibold text-slate-300">No documents ingested yet.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="glass-card p-4 flex items-center justify-between gap-4 hover:border-primary-500/40 group transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-400 border border-primary-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{file.filename}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {file.uploaded_at ? format(new Date(file.uploaded_at), 'MMM d, yyyy · HH:mm') : 'Saved'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    <FileCheck className="w-3.5 h-3.5" /> Ingested
                  </span>
                  <button
                    onClick={() => handleDelete(file.id, file.filename)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
