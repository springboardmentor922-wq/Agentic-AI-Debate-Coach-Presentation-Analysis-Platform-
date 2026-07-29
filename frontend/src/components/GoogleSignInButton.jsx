import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

let gsiScriptPromise = null
function loadGoogleScript() {
  if (gsiScriptPromise) return gsiScriptPromise
  gsiScriptPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve()
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = resolve
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
    document.head.appendChild(script)
  })
  return gsiScriptPromise
}

/**
 * Renders Google's official "Continue with Google" button using Google
 * Identity Services. On success, sends the returned ID token ("credential")
 * to POST /api/v1/auth/google-login, then redirects based on the user's
 * role. Existing JWT auth (email/password) is completely untouched by this.
 */
export default function GoogleSignInButton({ onError, homePathByRole = { learner: '/learner' } }) {
  const buttonRef = useRef(null)
  const { googleLogin, setUser } = useAuth()
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    let cancelled = false

    const handleCredentialResponse = async (response) => {
      try {
        const user = await googleLogin(response.credential)
        const dest = homePathByRole[user.role] || '/'
        navigate(dest)
      } catch (err) {
        onError?.(err.response?.data?.detail || 'Google sign-in failed. Please try again.')
      }
    }

    loadGoogleScript()
      .then(() => {
        if (cancelled || !window.google?.accounts?.id) return
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        })
        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            width: 320,
            text: 'continue_with',
            shape: 'pill',
          })
        }
        setReady(true)
      })
      .catch(() => onError?.('Could not load Google sign-in. Check your connection and try again.'))

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!GOOGLE_CLIENT_ID) return null

  return (
    <div className="flex w-full justify-center">
      <div ref={buttonRef} className={ready ? '' : 'h-10 w-full animate-pulse rounded-full bg-black/5 dark:bg-white/10'} />
    </div>
  )
}
