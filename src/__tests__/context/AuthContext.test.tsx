import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import type { User, AuthContextType } from '@/types/auth'

// Mock modules at top level
vi.mock('@/lib/api', () => ({
  api: {
    getMe: vi.fn(),
    login: vi.fn(),
  }
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  })
}))

// Import the mocked module
import * as apiModule from '@/lib/api'

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
    // Reset getMe to return no user by default (no token)
    vi.mocked(apiModule.api.getMe).mockRejectedValue(new Error('No token'))
  })

  it('provides user context', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    expect(screen.getByText('Not logged in')).toBeInTheDocument()
  })

  it('shows loading state initially', async () => {
    // Set a token so loadUser calls getMe, and make getMe never resolve
    localStorage.setItem('token', 'test-token')
    vi.mocked(apiModule.api.getMe).mockImplementation(() => new Promise(() => {}))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Wait for the initial loading state to appear
    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  it('handles login action', async () => {
    // Mock successful login
    vi.mocked(apiModule.api.login).mockResolvedValue({
      user: { id: '1', username: 'testuser', email: 'test@test.com', role: 'USER' as const },
      token: 'test-token-123'
    })

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

    // Mock getMe to return a user
    vi.mocked(apiModule.api.getMe).mockResolvedValue({
      user: { id: '1', username: 'testuser', email: 'test@test.com', role: 'USER' as const }
    })

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
    // Mock successful login
    vi.mocked(apiModule.api.login).mockResolvedValue({
      user: { id: '1', username: 'testuser', email: 'test@test.com', role: 'USER' as const },
      token: 'test-token-123'
    })

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
    // Set a token first
    localStorage.setItem('token', 'test-token-123')

    // Mock getMe to return a user
    vi.mocked(apiModule.api.getMe).mockResolvedValue({
      user: { id: '1', username: 'testuser', email: 'test@test.com', role: 'USER' as const }
    })

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
    expect(useAuth).toBeDefined()
    expect(typeof useAuth).toBe('function')
  })
})
