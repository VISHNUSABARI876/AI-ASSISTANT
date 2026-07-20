import api from './api'

export const chatService = {
  async sendMessage(message) {
    console.log("Sending message:", message);

    const res = await api.post("/chat/", { message });

    console.log("Response:", res);

    return res.data;
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
}
