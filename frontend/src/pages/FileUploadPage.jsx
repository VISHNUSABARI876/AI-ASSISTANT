import { useState, useEffect, useCallback, useRef } from 'react'
import { fileService } from '../services/fileService'
import {
  RiUploadCloud2Line, RiFilePdfLine, RiFileTextLine, RiDeleteBinLine,
  RiCheckLine, RiAlertLine, RiTimeLine,
} from 'react-icons/ri'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import { PageLoader } from '../components/UI/LoadingSpinner'

const FileIcon = ({ filename }) => {
  const ext = filename?.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return <RiFilePdfLine className="text-red-500 text-2xl" />
  return <RiFileTextLine className="text-blue-500 text-2xl" />
}

export default function FileUploadPage() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  const loadFiles = useCallback(async () => {
    try {
      const data = await fileService.listFiles()
      setFiles(data.files || [])
    } catch {
      toast.error('Failed to load files.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadFiles() }, [loadFiles])

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
    try {
      const data = await fileService.uploadFile(file, setProgress)
      toast.success(`"${file.name}" uploaded successfully!`)
      setFiles((prev) => [data.file, ...prev])
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
    if (!window.confirm(`Delete "${name}"?`)) return
    try {
      await fileService.deleteFile(id)
      setFiles((prev) => prev.filter((f) => f.id !== id))
      toast.success('File deleted.')
    } catch {
      toast.error('Failed to delete file.')
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="page-container py-8">
      <h1 className="page-title mb-1">File Upload</h1>
      <p className="page-subtitle mb-8">Upload PDF and TXT files for AI processing (max 16 MB)</p>

      {/* Drop zone */}
      <div
        id="file-drop-zone"
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer
          transition-all duration-200 mb-8
          ${dragOver
            ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}
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
        <RiUploadCloud2Line className={`text-6xl mx-auto mb-4 ${dragOver ? 'text-primary-500' : 'text-slate-400 dark:text-slate-500'}`} />
        <p className="text-slate-700 dark:text-slate-300 font-semibold text-lg">
          {uploading ? 'Uploading...' : 'Drop your file here'}
        </p>
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
          or <span className="text-primary-600 dark:text-primary-400 font-medium">click to browse</span> · PDF, TXT up to 16 MB
        </p>

        {/* Progress bar */}
        {uploading && (
          <div className="mt-6 mx-auto max-w-xs">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Uploading</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Files list */}
      <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
        Uploaded Files
        <span className="ml-2 text-sm font-normal text-slate-400">({files.length})</span>
      </h2>

      {files.length === 0 ? (
        <div className="card p-10 text-center">
          <RiUploadCloud2Line className="text-5xl text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No files uploaded yet.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {files.map((file) => (
            <div key={file.id} className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                <FileIcon filename={file.filename} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{file.filename}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                  <RiTimeLine className="text-xs" />
                  {file.uploaded_at ? format(new Date(file.uploaded_at), 'MMM d, yyyy · HH:mm') : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="badge badge-success">
                  <RiCheckLine className="mr-0.5" /> Ready
                </span>
                <button
                  onClick={() => handleDelete(file.id, file.filename)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Delete file"
                >
                  <RiDeleteBinLine className="text-sm" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
