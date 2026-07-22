/**
 * exportUtils.js
 * Multi-format chat export — Markdown, Plain Text, JSON, PDF (via print).
 */

/**
 * Trigger a browser file download with the given content.
 */
function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 150)
}

/**
 * Export messages as a Markdown file.
 * @param {Array} messages - Array of { content, isUser, timestamp, image_url }
 * @param {string} title - Chat title for the document header
 */
export function exportAsMarkdown(messages, title = 'AI Conversation') {
  const now = new Date().toLocaleString()
  const lines = [
    `# ${title}`,
    ``,
    `> Exported on ${now} from AI Assistant`,
    ``,
    `---`,
    ``,
  ]

  const filtered = messages.filter((m) => m.id !== 'welcome' && m.content)
  for (const msg of filtered) {
    const role = msg.isUser ? '**You**' : '**AI Assistant**'
    const time = msg.timestamp ? `*(${new Date(msg.timestamp).toLocaleTimeString()})*` : ''
    lines.push(`### ${role} ${time}`)
    lines.push(``)
    if (msg.image_url) {
      lines.push(`![Attached Image](${msg.image_url})`)
      lines.push(``)
    }
    lines.push(msg.content)
    lines.push(``)
    lines.push(`---`)
    lines.push(``)
  }

  const safeName = title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  downloadBlob(lines.join('\n'), `${safeName}_${Date.now()}.md`, 'text/markdown')
}

/**
 * Export messages as a plain text file.
 */
export function exportAsText(messages, title = 'AI Conversation') {
  const now = new Date().toLocaleString()
  const lines = [
    `${title}`,
    `Exported: ${now}`,
    `${'='.repeat(60)}`,
    ``,
  ]

  const filtered = messages.filter((m) => m.id !== 'welcome' && m.content)
  for (const msg of filtered) {
    const role = msg.isUser ? 'YOU' : 'AI ASSISTANT'
    const time = msg.timestamp ? ` [${new Date(msg.timestamp).toLocaleTimeString()}]` : ''
    lines.push(`${role}${time}:`)
    lines.push(msg.content)
    lines.push(``)
    lines.push(`${'-'.repeat(40)}`)
    lines.push(``)
  }

  const safeName = title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  downloadBlob(lines.join('\n'), `${safeName}_${Date.now()}.txt`, 'text/plain')
}

/**
 * Export messages as JSON.
 */
export function exportAsJSON(messages, title = 'AI Conversation') {
  const filtered = messages.filter((m) => m.id !== 'welcome')
  const payload = {
    title,
    exported_at: new Date().toISOString(),
    message_count: filtered.length,
    messages: filtered.map((m) => ({
      role: m.isUser ? 'user' : 'assistant',
      content: m.content,
      image_url: m.image_url || null,
      timestamp: m.timestamp || null,
    })),
  }
  const safeName = title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  downloadBlob(JSON.stringify(payload, null, 2), `${safeName}_${Date.now()}.json`, 'application/json')
}

/**
 * Export messages as CSV (useful for chat history bulk export).
 */
export function exportAsCSV(chats) {
  const header = 'id,timestamp,message,response\n'
  const rows = chats
    .map((c) => {
      const esc = (s) => `"${String(s || '').replace(/"/g, '""')}"`
      return [c.id, c.timestamp, esc(c.message), esc(c.response)].join(',')
    })
    .join('\n')
  downloadBlob(header + rows, `chat_history_${Date.now()}.csv`, 'text/csv')
}

/**
 * Open a print-friendly view and trigger browser PDF save dialog.
 * Works by injecting a styled print window.
 */
export function exportAsPDF(messages, title = 'AI Conversation') {
  const filtered = messages.filter((m) => m.id !== 'welcome' && m.content)
  const now = new Date().toLocaleString()

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 13px;
      line-height: 1.6;
      color: #1e293b;
      max-width: 750px;
      margin: 0 auto;
      padding: 40px 32px;
    }
    .header {
      border-bottom: 2px solid #6366f1;
      padding-bottom: 12px;
      margin-bottom: 24px;
    }
    .header h1 { font-size: 20px; color: #4f46e5; }
    .header p { font-size: 11px; color: #64748b; margin-top: 4px; }
    .message { margin-bottom: 20px; page-break-inside: avoid; }
    .message-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .badge {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 12px;
      text-transform: uppercase;
    }
    .badge-user { background: #e0e7ff; color: #4338ca; }
    .badge-ai { background: #d1fae5; color: #047857; }
    .time { font-size: 10px; color: #94a3b8; }
    .content {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 16px;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .content-user { background: #eef2ff; border-color: #c7d2fe; }
    img { max-width: 280px; border-radius: 6px; margin-bottom: 8px; }
    .footer {
      margin-top: 32px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: 10px;
      color: #94a3b8;
      text-align: center;
    }
    @media print {
      body { padding: 20px; }
      .message { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🤖 ${title}</h1>
    <p>Exported from AI Assistant · ${now}</p>
  </div>
  ${filtered.map((msg) => `
    <div class="message">
      <div class="message-header">
        <span class="badge ${msg.isUser ? 'badge-user' : 'badge-ai'}">
          ${msg.isUser ? 'You' : 'AI Assistant'}
        </span>
        ${msg.timestamp ? `<span class="time">${new Date(msg.timestamp).toLocaleTimeString()}</span>` : ''}
      </div>
      ${msg.image_url ? `<img src="${msg.image_url}" alt="Attached image" />` : ''}
      <div class="content ${msg.isUser ? 'content-user' : ''}">${msg.content}</div>
    </div>
  `).join('')}
  <div class="footer">AI Assistant · ${now}</div>
</body>
</html>`

  const win = window.open('', '_blank', 'width=800,height=700')
  if (!win) {
    alert('Please allow popups to export as PDF.')
    return
  }
  win.document.write(html)
  win.document.close()
  win.onload = () => {
    win.focus()
    win.print()
  }
}
