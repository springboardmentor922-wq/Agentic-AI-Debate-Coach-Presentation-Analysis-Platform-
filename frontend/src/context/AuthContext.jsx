import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoading(false)
      return
    }
    // Always re-verify against the backend so a stale/mock localStorage
    // value can never keep showing on screen.
    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data)
        localStorage.setItem('user', JSON.stringify(res.data))
      })
      .catch(() => {
        setUser(null)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password, expectedRole) => {
    const res = await api.post('/auth/login', { email, password, expected_role: expectedRole })
    persistSession(res.data)
    return res.data.user
  }

  // Registration no longer logs the user in directly — the backend creates
  // an unverified account and emails a 6-digit OTP. Nothing is persisted
  // here; the caller navigates to the OTP screen with the returned email.
  const register = async (payload) => {
    const res = await api.post('/auth/register', payload)
    return res.data
  }

  const verifyEmailOtp = async (email, otp) => {
    const res = await api.post('/auth/verify-email-otp', { email, otp })
    persistSession(res.data)
    return res.data.user
  }

  const resendEmailOtp = async (email) => {
    const res = await api.post('/auth/resend-email-otp', { email })
    return res.data
  }

  const googleLogin = async (credential) => {
    const res = await api.post('/auth/google-login', { credential })
    persistSession(res.data)
    return res.data.user
  }

  const persistSession = (data) => {
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, login, register, verifyEmailOtp, resendEmailOtp, googleLogin, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
