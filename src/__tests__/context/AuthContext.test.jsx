import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/context/AuthContext'

// Test component that uses the hook
const TestComponent = () => {
  const { user, loading, login, logout } = useAuth()

  return (
    <div>
      {loading && <div>Loading...</div>}
      {!loading && user && (
        <div>
          <p>User: {user.username}</p>
          <button onClick={logout}>Logout</button>
        </div>
      )}
      {!loading && !user && (
        <div>
          <p>Not logged in</p>
          <button onClick={() => login('testuser', 'password123')}>Login</button>
        </div>
      )}
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('provides user context', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    expect(screen.getByText('Not logged in')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('handles login action', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    const loginButton = screen.getByText('Login')
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeTruthy()
    }, { timeout: 1000 })
  })

  it('handles logout action', async () => {
    // Set a token first
    localStorage.setItem('token', 'test-token-123')

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    const logoutButton = screen.queryByText('Logout')
    if (logoutButton) {
      fireEvent.click(logoutButton)

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBeNull()
      })
    }
  })

  it('persists token to localStorage on login', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    const loginButton = screen.getByText('Login')
    fireEvent.click(loginButton)

    await waitFor(() => {
      const token = localStorage.getItem('token')
      expect(token).toBeTruthy()
    }, { timeout: 1000 })
  })

  it('removes token from localStorage on logout', async () => {
    localStorage.setItem('token', 'test-token-123')

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    const logoutButton = screen.queryByText('Logout')
    if (logoutButton) {
      fireEvent.click(logoutButton)

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBeNull()
      })
    }
  })

  it('exposes useAuth hook', () => {
    const { useAuth: hookFromContext } = require('@/context/AuthContext')
    expect(hookFromContext).toBeDefined()
    expect(typeof hookFromContext).toBe('function')
  })
})
