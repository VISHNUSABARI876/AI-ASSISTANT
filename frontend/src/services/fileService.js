import api from './api'

export const fileService = {
  async uploadFile(file, onProgress) {
    const formData = new FormData()
    formData.append('file', file)
    const res = await api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(pct)
        }
      },
    })
    return res.data
  },

  async listFiles() {
    const res = await api.get('/files/')
    return res.data
  },

  async deleteFile(fileId) {
    const res = await api.delete(`/files/${fileId}`)
    return res.data
  },

  async summarizeFile(fileId) {
    const res = await api.post('/ai/summarize', { file_id: fileId })
    return res.data
  },

  async summarizeText(text) {
    const res = await api.post('/ai/summarize', { text })
    return res.data
  },

  async generateCode(prompt, language = 'python') {
    const res = await api.post('/ai/generate-code', { prompt, language })
    return res.data
  },

  async queryDocument(fileId, question) {
    const res = await api.post('/ai/query-doc', { file_id: fileId, question })
    return res.data
  },
}

