import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OrderForm from '@/components/OrderForm'
import type { Store, Category } from '@/types/product'

// Mock modules at top level
vi.mock('@/lib/api', () => ({
  api: {
    getCategories: vi.fn(),
    createOrder: vi.fn(),
  }
}))

// Import the mocked module
import * as apiModule from '@/lib/api'

const mockStore: Store = {
  id: 1,
  name: 'Loja Centro',
  address: 'Rua A, 123',
}

const mockOnBack = vi.fn()

const mockCategories: Category[] = [
  {
    id: 1,
    name: 'Legumes',
    products: [
      { id: 1, name: 'Cenoura', categoryId: 1, stockCD: 100 },
      { id: 2, name: 'Batata', categoryId: 1, stockCD: 50 },
    ]
  },
  {
    id: 2,
    name: 'Frutas',
    products: [
      { id: 3, name: 'Maçã', categoryId: 2, stockCD: 80 },
      { id: 4, name: 'Banana', categoryId: 2, stockCD: 60 },
    ]
  }
]

describe('OrderForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Setup default mock implementation
    vi.mocked(apiModule.api.getCategories).mockResolvedValue(mockCategories)
  })

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
      expect(screen.getByText(/pedido de compras/i)).toBeInTheDocument()
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
