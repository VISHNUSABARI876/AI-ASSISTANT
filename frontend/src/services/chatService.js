import api from './api'

export const chatService = {
  async sendMessage(message, enableWebSearch = false, systemPrompt = null, imageUrl = null) {
    const res = await api.post('/chat/', {
      message,
      enable_web_search: enableWebSearch,
      system_prompt: systemPrompt,
      image_url: imageUrl,
    })
    return res.data
  },

  async streamMessage(message, onChunk, onDone, onError, signal, enableWebSearch = false, systemPrompt = null, imageUrl = null) {
    try {
      const baseURL = import.meta.env.VITE_API_URL || '/api'
      const token = localStorage.getItem('ai_token')
      const url = `${baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL}/chat/stream`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message,
          enable_web_search: enableWebSearch,
          system_prompt: systemPrompt,
          image_url: imageUrl,
        }),
        signal,
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || `HTTP error! status: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (trimmed.startsWith('data: ')) {
            const jsonStr = trimmed.substring(6)
            try {
              const parsed = JSON.parse(jsonStr)
              if (parsed.chunk && onChunk) {
                onChunk(parsed.chunk)
              }
              if (parsed.done && onDone) {
                onDone(parsed.chat)
              }
            } catch (e) {
              console.error('Error parsing SSE data line:', e)
            }
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError' && onError) {
        onError(err)
      }
    }
  },


  async getHistory(page = 1, perPage = 20) {
    const res = await api.get('/chat/history', { params: { page, per_page: perPage } })
    return res.data
  },

  async searchHistory(query) {
    const res = await api.get('/chat/history/search', { params: { q: query } })
    return res.data
  },

  async deleteChat(chatId) {
    const res = await api.delete(`/chat/history/${chatId}`)
    return res.data
  },

  async downloadHistory(format = 'json') {
    const res = await api.get('/chat/history/download', {
      params: { format },
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `chat_history.${format}`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  async getPersonas() {
    const res = await api.get('/personas/')
    return res.data
  },

  async createPersona(data) {
    const res = await api.post('/personas/', data)
    return res.data
  },

  async deletePersona(personaId) {
    const res = await api.delete(`/personas/${personaId}`)
    return res.data
  },
}

