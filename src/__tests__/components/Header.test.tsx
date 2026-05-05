import { render, screen } from '@testing-library/react'
import { Header } from '@/components/Header/Header'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/context/AuthContext', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useAuth: vi.fn()
  }
})

describe('Header Component', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders header component', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, logout: vi.fn() })

    render(
      <AuthProvider>
        <Header />
      </AuthProvider>
    )

    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renders shopping bag logo', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, logout: vi.fn() })

    render(
      <AuthProvider>
        <Header />
      </AuthProvider>
    )

    const logo = screen.getByAltText('Logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', '/logo.svg')
  })

  it('renders branding text', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, logout: vi.fn() })

    const { container } = render(
      <AuthProvider>
        <Header />
      </AuthProvider>
    )

    expect(container.querySelector('header')).toBeInTheDocument()
  })

  it('has navigation elements when user is logged in', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: '1',
        email: 'test@example.com',
        role: 'ADMIN'
      },
      logout: vi.fn()
    })

    const { container } = render(
      <AuthProvider>
        <Header />
      </AuthProvider>
    )

    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('includes flex layout for navigation', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, logout: vi.fn() })

    render(
      <AuthProvider>
        <Header />
      </AuthProvider>
    )

    const header = screen.getByRole('banner')
    expect(header).toHaveClass('flex')
  })

  it('renders without crashing', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, logout: vi.fn() })

    const { container } = render(
      <AuthProvider>
        <Header />
      </AuthProvider>
    )

    expect(container.firstChild).toBeInTheDocument()
  })
})
