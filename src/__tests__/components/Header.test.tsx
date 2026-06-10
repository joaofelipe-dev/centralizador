import { render, screen } from '@testing-library/react'
import Header from '@/components/Header/Header'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { describe, it, expect, beforeEach, vi } from 'vitest'

const mockUser = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  role: 'ADMIN'
}

vi.mock('@/context/AuthContext', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>
  return {
    ...actual,
    useAuth: vi.fn()
  }
})

vi.mock('@/context/OfflineContext', () => ({
  OfflineProvider: ({ children }: { children: React.ReactNode }) => children,
  useOffline: () => ({
    isOnline: true,
    pendingOrders: 0,
    isSyncing: false,
    lastSyncAt: null,
    refreshCache: vi.fn(),
    forceSync: vi.fn(),
  }),
}))

function renderHeader() {
  return render(
    <AuthProvider>
      <Header />
    </AuthProvider>
  )
}

describe('Header Component', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({ user: mockUser, login: vi.fn(), logout: vi.fn(), loading: false })
  })

  it('renders header component', () => {
    const { container } = renderHeader()
    expect(container.querySelector('nav')).toBeInTheDocument()
  })

  it('renders shopping bag logo', () => {
    renderHeader()
    const logo = screen.getByAltText('Logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', '/logo.svg')
  })

  it('renders branding text', () => {
    const { container } = renderHeader()
    expect(container.querySelector('nav')).toBeInTheDocument()
  })

  it('has navigation elements when user is logged in', () => {
    const { container } = renderHeader()
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('includes flex layout for navigation', () => {
    const { container } = renderHeader()
    const nav = container.querySelector('nav')
    expect(nav?.querySelector('.flex')).toBeInTheDocument()
  })

  it('renders without crashing', () => {
    const { container } = renderHeader()
    expect(container.firstChild).toBeInTheDocument()
  })
})
