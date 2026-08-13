import { describe, it, expect, beforeEach, vi } from 'vitest'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import api from './axios'

describe('api axios client', () => {
  let mock

  beforeEach(() => {
    localStorage.clear()
    mock = new MockAdapter(api)
  })

  it('attaches the stored access_token as a Bearer header on every request', async () => {
    localStorage.setItem('access_token', 'test-token-123')
    mock.onGet('/dashboard/summary').reply((config) => {
      expect(config.headers.Authorization).toBe('Bearer test-token-123')
      return [200, { ok: true }]
    })
    const res = await api.get('/dashboard/summary')
    expect(res.data.ok).toBe(true)
  })

  it('sends no Authorization header when logged out', async () => {
    mock.onGet('/dashboard/summary').reply((config) => {
      expect(config.headers.Authorization).toBeUndefined()
      return [200, { ok: true }]
    })
    await api.get('/dashboard/summary')
  })

  it('clears the stored session on a 401 response', async () => {
    localStorage.setItem('access_token', 'expired-token')
    localStorage.setItem('refresh_token', 'expired-refresh')
    localStorage.setItem('user', JSON.stringify({ id: '1', role: 'learner' }))
    mock.onGet('/dashboard/summary').reply(401, { detail: 'Token expired' })

    await expect(api.get('/dashboard/summary')).rejects.toBeTruthy()

    expect(localStorage.getItem('access_token')).toBeNull()
    expect(localStorage.getItem('refresh_token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })
})
