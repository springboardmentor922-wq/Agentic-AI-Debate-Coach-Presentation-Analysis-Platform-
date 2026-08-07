import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

/**
 * Builds a URL for an authenticated audio file, for use in a plain
 * <audio> src attribute which can't send an Authorization
 * header. The token is passed as a query param and validated server-side
 * by app/routers/media.py's dedicated media auth dependency.
 */
export function mediaAudioUrl(presentationId) {
  const token = localStorage.getItem('access_token') || ''
  return `${api.defaults.baseURL}/media/audio/${presentationId}?token=${encodeURIComponent(token)}`
}

export default api
