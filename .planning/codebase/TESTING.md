# Testing Approach

This document outlines the testing approach and patterns used across the Centralizador project.

## Table of Contents

- [Test Locations](#test-locations)
- [Test Frameworks](#test-frameworks)
- [Frontend Testing](#frontend-testing)
- [Backend Testing](#backend-testing)
- [Mock Approaches](#mock-approaches)
- [Key Test Files and Patterns](#key-test-files-and-patterns)

---

## Test Locations

The project follows a co-located testing pattern where tests are placed alongside the code they test:

`
centralizador/
├── src/
│   ├── __tests__/              # Frontend tests
│   │   └── setup.ts            # Frontend test setup
│   ├── __mocks__/              # Frontend mock handlers
│   │   └── handlers.ts         # MSW handlers for API mocking
│   └── components/            # Component files (tests can go here or in __tests__)
├── api/
│   └── src/
│       └── __tests__/          # Backend tests
│           ├── setup.ts        # Backend test setup
│           ├── modules/        # Service and route tests
│           │   ├── auth/
│           │   │   ├── auth.service.test.ts
│           │   │   └── auth.routes.test.ts
│           │   ├── user/
│           │   │   └── user.service.test.ts
│           │   └── order/
│           │       ├── order.service.test.ts
│           │       └── order.routes.test.ts
│           ├── middlewares/
│           │   └── auth.test.ts
│           └── lib/            # Library and utility tests
│               └── order-export.test.ts
`

---

## Test Frameworks

### Frontend (Next.js)

| Package | Version | Purpose |
|---------|---------|---------|
| itest | ^1.0.4 | Test runner and assertion library |
| @testing-library/react | ^15.0.7 | React component testing utilities |
| @testing-library/jest-dom | ^6.1.5 | Jest DOM matchers |
| @testing-library/user-event | ^14.5.1 | User event simulation |
| msw | ^2.0.11 | API mocking (MSW) |
| happy-dom | ^12.10.3 | DOM implementation for Node.js |

### Backend (Fastify)

| Package | Version | Purpose |
|---------|---------|---------|
| itest | ^1.0.4 | Test runner and assertion library |
| supertest | ^6.3.3 | HTTP testing for Express/Fastify |
| @types/supertest | ^6.0.2 | TypeScript types for supertest |

---

## Frontend Testing

### Configuration

Frontend Vitest configuration (itest.config.ts):

`	ypescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
})
`

### Test Setup

Frontend setup file (src/__tests__/setup.ts):

`	ypescript
import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { handlers } from '../__mocks__/handlers'

// Setup MSW server
export const server = setupServer(...handlers)

// Start server before all tests
beforeAll(() => server.listen())

// Reset handlers after each test
afterEach(() => {
  cleanup()
  server.resetHandlers()
})

// Clean up after all tests
afterAll(() => server.close())

// Mock next/router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))
`

### Running Frontend Tests

`ash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
`

---

## Backend Testing

### Configuration

Backend Vitest configuration (pi/vitest.config.ts):

`	ypescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
})
`

### Test Setup

Backend setup file (pi/src/__tests__/setup.ts):

`	ypescript
import { vi, beforeEach, afterEach } from 'vitest'
import { prisma } from '@/lib/prisma'

// Mock Prisma globally
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    order: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    store: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    orderItem: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

// Global test utilities
beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.clearAllMocks()
})
`

### Running Backend Tests

`ash
cd api

# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
`

---

## Mock Approaches

### Frontend: MSW (Mock Service Worker)

The frontend uses MSW to intercept network requests and return mock responses.

#### Handler File Structure (src/__mocks__/handlers.ts)

`	ypescript
import { http, HttpResponse } from 'msw'

const API_URL = 'http://192.168.0.129:3333'

export const handlers = [
  // Auth endpoints
  http.post(${API_URL}/auth/login, async ({ request }) => {
    const body = await request.json() as any
    
    if (body.username === 'testuser' && body.password === 'password123') {
      return HttpResponse.json({
        user: {
          id: 'user-123',
          username: 'testuser',
          email: 'test@example.com',
          isAdmin: false,
          storeId: 'store-1',
        },
        token: 'test-jwt-token-123',
      })
    }
    
    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    )
  }),

  http.post(${API_URL}/auth/register, async ({ request }) => {
    const body = await request.json() as any
    
    if (!body.email?.includes('@')) {
      return HttpResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      )
    }

    if (!body.password || body.password.length < 8) {
      return HttpResponse.json(
        { message: 'Password too short' },
        { status: 400 }
      )
    }

    return HttpResponse.json({
      user: {
        id: 'user-new-123',
        username: body.username,
        email: body.email,
        isAdmin: false,
        storeId: null,
      },
      token: 'test-jwt-token-new',
    }, { status: 201 })
  }),

  http.get(${API_URL}/auth/me, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      user: {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        isAdmin: false,
        storeId: 'store-1',
      },
    })
  }),

  // Categories endpoints
  http.get(${API_URL}/categories, () => {
    return HttpResponse.json([
      {
        id: 'cat-1',
        name: 'Legumes',
        products: [
          { id: 'prod-1', name: 'Cenoura', categoryId: 'cat-1' },
          { id: 'prod-2', name: 'Batata', categoryId: 'cat-1' },
        ],
      },
    ])
  }),

  // Orders endpoints
  http.post(${API_URL}/orders, async ({ request }) => {
    const body = await request.json() as any
    const authHeader = request.headers.get('Authorization')

    if (!authHeader) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!body.storeId || !body.items || body.items.length === 0) {
      return HttpResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    return HttpResponse.json({
      id: 'order-new-1',
      userId: 'user-123',
      storeId: body.storeId,
      status: 'pending',
      items: body.items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { status: 201 })
  }),

  // ... more handlers
]
`

### Backend: Prisma Mock

The backend mocks the Prisma client to avoid actual database operations during tests.

`	ypescript
// In setup.ts
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    // ... other models
  },
}))
`

---

## Key Test Files and Patterns

### Frontend Test Patterns

#### Testing Components

Example test pattern for a React component:

`	ypescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
`

#### Testing with MSW

`	ypescript
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  http.get('/api/data', () => {
    return HttpResponse.json({ data: 'test' })
  })
)

describe('API Integration', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('fetches data correctly', async () => {
    render(<MyComponent />)
    await waitFor(() => {
      expect(screen.getByText('test')).toBeInTheDocument()
    })
  })
})
`

### Backend Test Patterns

#### Service Tests

Example service test pattern:

`	ypescript
// api/src/__tests__/modules/order/order.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('OrderService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Order Creation', () => {
    it('should handle order creation', async () => {
      const orderData = {
        storeId: 'store-1',
        items: [{ productId: 'prod-1', quantity: 5, currentStock: 2 }],
      }

      expect(orderData.storeId).toBe('store-1')
      expect(orderData.items.length).toBe(1)
      expect(orderData.items[0].quantity).toBe(5)
    })

    it('should require items array', () => {
      const hasItems = (data: any) => Array.isArray(data.items) && data.items.length > 0

      expect(hasItems({ items: [{ productId: 'prod-1', quantity: 5, currentStock: 2 }] })).toBe(true)
      expect(hasItems({ items: [] })).toBe(false)
    })
  })
})
`

#### Route Tests (Integration Tests)

Example route test pattern:

`	ypescript
// api/src/__tests__/modules/order/order.routes.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    order: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    product: { findMany: vi.fn(), findUnique: vi.fn() },
    store: { findMany: vi.fn(), findUnique: vi.fn() },
  },
}))

describe('Order Routes (Integration Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /orders', () => {
    it('should have orders endpoint defined', async () => {
      const { app } = await import('@/app')
      expect(app).toBeDefined()
    })
  })

  describe('GET /orders', () => {
    it('should have orders list endpoint defined', async () => {
      const { app } = await import('@/app')
      expect(app).toBeDefined()
    })
  })
})
`

#### Middleware Tests

Example middleware test pattern:

`	ypescript
// api/src/__tests__/middlewares/auth.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authMiddleware } from '@/middlewares/auth'

describe('Auth Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should validate JWT token', () => {
    // Test implementation
  })

  it('should reject invalid tokens', () => {
    // Test implementation
  })
})
`

---

## Best Practices

### General

1. **Test File Naming**: Use .test.ts or .test.tsx extension
2. **Descriptive Test Names**: Name tests after the behavior they verify
3. **AAA Pattern**: Arrange, Act, Assert - structure tests clearly
4. **One Assertion Per Test**: Prefer focused tests over monolithic ones

### Frontend

1. **Use Testing Library**: Prefer @testing-library/react over shallow rendering
2. **Test User Interactions**: Use @testing-library/user-event for realistic interactions
3. **Mock External Dependencies**: Use MSW for API calls, vi.mock for modules

### Backend

1. **Mock Database**: Always mock Prisma to avoid test pollution
2. **Test Boundaries**: Test service logic separately from route handlers
3. **Clear Mocks**: Use meaningful mock data that reflects real scenarios

---

## CI/CD Integration

Both frontend and backend tests can be run together:

`ash
# Root package.json scripts
{
   scripts: {
    test: vitest,
    test:ui: vitest --ui,
    test:coverage: vitest --coverage
  }
}
`

For more detailed information, see [CONVENTIONS.md](./CONVENTIONS.md).