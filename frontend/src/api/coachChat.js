import api from './axios'

const API_BASE = api.defaults.baseURL

export const coachChatApi = {
  listSessions: () => api.get('/coach-chat/sessions').then((r) => r.data),
  createSession: (pageKey, title) =>
    api.post('/coach-chat/sessions', { page_key: pageKey, title }).then((r) => r.data),
  deleteSession: (sessionId) => api.delete(`/coach-chat/sessions/${sessionId}`),
  getMessages: (sessionId) => api.get(`/coach-chat/sessions/${sessionId}/messages`).then((r) => r.data),
  sendMessage: (sessionId, text, pageKey, argumentText) =>
    api
      .post(`/coach-chat/sessions/${sessionId}/messages`, {
        text,
        page_key: pageKey,
        argument_text: argumentText || null,
      })
      .then((r) => r.data),
  sendQuickMessage: (text, pageKey, argumentText) =>
    api
      .post('/coach-chat/message', { text, page_key: pageKey, argument_text: argumentText || null })
      .then((r) => r.data),
  setFeedback: (sessionId, messageId, liked) =>
    api
      .patch(`/coach-chat/sessions/${sessionId}/messages/${messageId}/feedback`, { liked })
      .then((r) => r.data),

  /**
   * Real token-by-token streaming via Server-Sent Events. Calls `onChunk`
   * for each piece of text as it arrives and `onDone` once with the final
   * persisted user + assistant messages. Falls back to the caller catching
   * the rejected promise (widget then retries with sendMessage/sendQuickMessage).
   */
  async streamMessage(sessionId, text, pageKey, argumentText, { onChunk, onUserMessage, onDone, signal }) {
    const token = localStorage.getItem('access_token')
    const res = await fetch(`${API_BASE}/coach-chat/sessions/${sessionId}/messages/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ text, page_key: pageKey, argument_text: argumentText || null }),
      signal,
    })
    if (!res.ok || !res.body) throw new Error('Streaming request failed')

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const parts = buffer.split('\n\n')
      buffer = parts.pop()
      for (const part of parts) {
        if (!part.startsWith('data: ')) continue
        const event = JSON.parse(part.slice(6))
        if (event.type === 'user_message') onUserMessage?.(event.message)
        else if (event.type === 'chunk') onChunk?.(event.text)
        else if (event.type === 'done') onDone?.(event.message)
      }
    }
  },
}

export default coachChatApi
