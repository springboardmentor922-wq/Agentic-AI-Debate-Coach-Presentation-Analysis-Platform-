import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import * as AuthContext from '../context/AuthContext'

/**
 * ProtectedRoute is the single gate every dashboard route passes through
 * (Learner/Coach/Educator/Admin). These tests mock useAuth() rather than
 * going through a real login flow, so they're fast and don't depend on the
 * backend — but they exercise the actual component and its actual routing
 * decisions, not a re-implementation of its logic.
 */
function renderWithAuth(authValue, allowedRoles) {
  vi.spyOn(AuthContext, 'useAuth').mockReturnValue(authValue)
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute allowedRoles={allowedRoles}>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  it('shows a loading spinner while auth state is resolving', () => {
    renderWithAuth({ user: null, loading: true })
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })

  it('redirects to /login when there is no authenticated user', () => {
    renderWithAuth({ user: null, loading: false })
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('renders the protected content for an allowed role', () => {
    renderWithAuth({ user: { id: '1', role: 'learner' }, loading: false }, ['learner'])
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to /unauthorized when the user role is not in allowedRoles', () => {
    renderWithAuth({ user: { id: '1', role: 'learner' }, loading: false }, ['administrator'])
    expect(screen.getByText('Unauthorized Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('allows access when no allowedRoles restriction is specified', () => {
    renderWithAuth({ user: { id: '1', role: 'educator' }, loading: false })
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it.each(['learner', 'debate_coach', 'educator', 'administrator'])(
    'allows the %s role through a route scoped to exactly that role',
    (role) => {
      renderWithAuth({ user: { id: '1', role }, loading: false }, [role])
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    }
  )
})
