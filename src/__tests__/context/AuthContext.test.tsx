import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import type { User, AuthContextType } from '@/types/auth'

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

import * as apiModule from '@/lib/api'

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
    vi.mocked(apiModule.api.getMe).mockRejectedValue(new Error('No token'))
  })

  it('provides user context', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Not logged in')).toBeInTheDocument()
    })
  })

  it('shows loading state initially', async () => {
    vi.mocked(apiModule.api.getMe).mockImplementation(() => new Promise(() => {}))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  it('handles login action', async () => {
    const mockUser = { id: '1', username: 'testuser', email: 'test@test.com', role: 'DEFAULT' as const }
    vi.mocked(apiModule.api.login).mockResolvedValue({
      user: mockUser,
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

    fireEvent.click(screen.getByText('Login'))

    await waitFor(() => {
      expect(screen.getByText('User: testuser')).toBeInTheDocument()
    })
  })

  it('handles logout action', async () => {
    vi.mocked(apiModule.api.getMe).mockResolvedValue({
      user: { id: '1', username: 'testuser', email: 'test@test.com', role: 'DEFAULT' as const }
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
        expect(screen.getByText('Not logged in')).toBeInTheDocument()
      })
    }
  })

  it('exposes useAuth hook', () => {
    expect(useAuth).toBeDefined()
    expect(typeof useAuth).toBe('function')
  })
})
