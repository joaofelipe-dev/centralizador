import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/Button/Button'

describe('Button Component', () => {
  it('renders with text content', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(onClick).toHaveBeenCalled()
  })

  it('renders as button element', () => {
    render(<Button>Default</Button>)
    const button = screen.getByText('Default')
    expect(button.tagName).toBe('BUTTON')
  })

  it('accepts disabled prop', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByText('Disabled')
    expect(button).toBeDisabled()
  })

  it('renders with custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    const button = screen.getByText('Custom')
    expect(button).toHaveClass('custom-class')
  })

  it('renders children correctly', () => {
    render(
      <Button>
        <span data-testid="icon">Icon</span>
        <span data-testid="text">Text</span>
      </Button>
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByTestId('text')).toBeInTheDocument()
  })
})
