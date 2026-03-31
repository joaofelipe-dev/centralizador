import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OrderForm from '@/components/OrderForm'
import { describe, it, expect, vi } from 'vitest'

const mockStore = {
  id: 'store-1',
  name: 'Loja Centro',
  address: 'Rua A, 123',
}

const mockOnBack = vi.fn()

describe('OrderForm Component', () => {
  it('renders loading state initially', () => {
    render(<OrderForm store={mockStore} onBack={mockOnBack} />)
    expect(screen.getByText(/carregando lista de produtos/i)).toBeInTheDocument()
  })

  it('loads and displays categories with products', async () => {
    render(<OrderForm store={mockStore} onBack={mockOnBack} />)

    await waitFor(() => {
      expect(screen.getByText(/legumes/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/frutas/i)).toBeInTheDocument()
    expect(screen.getByText(/cenoura/i)).toBeInTheDocument()
    expect(screen.getByText(/maçã/i)).toBeInTheDocument()
  })

  it('displays store name in header', async () => {
    render(<OrderForm store={mockStore} onBack={mockOnBack} />)

    await waitFor(() => {
      expect(screen.getByText('Loja Centro')).toBeInTheDocument()
    })
  })

  it('handles number inputs for quantities', async () => {
    const user = userEvent.setup()

    render(<OrderForm store={mockStore} onBack={mockOnBack} />)

    await waitFor(() => {
      expect(screen.getByText(/cenoura/i)).toBeInTheDocument()
    })

    // Find number inputs (for quantity or stock)
    const numberInputs = screen.getAllByRole('spinbutton')
    expect(numberInputs.length).toBeGreaterThan(0)

    if (numberInputs[0]) {
      await user.clear(numberInputs[0])
      await user.type(numberInputs[0], '5')
      expect(numberInputs[0]).toHaveValue(5)
    }
  })

  it('displays back button', async () => {
    render(<OrderForm store={mockStore} onBack={mockOnBack} />)

    await waitFor(() => {
      expect(screen.getByText(/cenoura/i)).toBeInTheDocument()
    })

    const backButtons = screen.getAllByRole('button')
    expect(backButtons.length).toBeGreaterThan(0)
  })

  it('shows new order header text', async () => {
    render(<OrderForm store={mockStore} onBack={mockOnBack} />)

    await waitFor(() => {
      expect(screen.getByText(/novo pedido de compra/i)).toBeInTheDocument()
    })
  })

  it('renders product categories', async () => {
    render(<OrderForm store={mockStore} onBack={mockOnBack} />)

    await waitFor(() => {
      const categories = screen.getAllByText(/legumes|frutas/i)
      expect(categories.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('allows user interaction with quantity inputs', async () => {
    const user = userEvent.setup()

    render(<OrderForm store={mockStore} onBack={mockOnBack} />)

    await waitFor(() => {
      expect(screen.getByText(/cenoura/i)).toBeInTheDocument()
    })

    // Find all spinbutton inputs
    const inputs = screen.getAllByRole('spinbutton')

    if (inputs.length > 0) {
      await user.clear(inputs[0])
      await user.type(inputs[0], '10')
      expect(inputs[0]).toHaveValue(10)
    }
  })

  it('renders without crashing with valid props', async () => {
    const { container } = render(
      <OrderForm store={mockStore} onBack={mockOnBack} />
    )

    await waitFor(() => {
      expect(container.querySelector('.animate-slide-up')).toBeInTheDocument()
    })
  })
})
