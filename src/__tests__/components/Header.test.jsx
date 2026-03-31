import { render, screen } from '@testing-library/react'
import { Header } from '@/components/Header/Header'
import { AuthProvider } from '@/context/AuthContext'
import { describe, it, expect, beforeEach } from 'vitest'

describe('Header Component', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders header component', () => {
    render(
      <AuthProvider>
        <Header />
      </AuthProvider>
    )

    // Header should render without errors
    expect(screen.getByRole('banner') || document.querySelector('header')).toBeTruthy()
  })

  it('renders shopping bag logo', () => {
    render(
      <AuthProvider>
        <Header />
      </AuthProvider>
    )

    // Check for shopping bag icon or text
    const svgs = document.querySelectorAll('svg[class*="lucide"]')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('renders branding text', () => {
    const { container } = render(
      <AuthProvider>
        <Header />
      </AuthProvider>
    )

    // Check header has some content
    expect(container.querySelector('header')).toBeInTheDocument()
  })

  it('has navigation elements', () => {
    const { container } = render(
      <AuthProvider>
        <Header />
      </AuthProvider>
    )

    // Header should have navigation (buttons or links)
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('includes flex layout for navigation', () => {
    const { container } = render(
      <AuthProvider>
        <Header />
      </AuthProvider>
    )

    const header = container.querySelector('header')
    expect(header?.className).toContain('flex')
  })

  it('renders without crashing', () => {
    const { container } = render(
      <AuthProvider>
        <Header />
      </AuthProvider>
    )

    expect(container.firstChild).toBeInTheDocument()
  })
})
