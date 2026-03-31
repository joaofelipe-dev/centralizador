import { http, HttpResponse } from 'msw'

const API_URL = 'http://192.168.0.129:3333'

export const handlers = [
  // Auth endpoints
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
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

  http.post(`${API_URL}/auth/register`, async ({ request }) => {
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

  http.get(`${API_URL}/auth/me`, ({ request }) => {
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
  http.get(`${API_URL}/categories`, () => {
    return HttpResponse.json([
      {
        id: 'cat-1',
        name: 'Legumes',
        products: [
          {
            id: 'prod-1',
            name: 'Cenoura',
            categoryId: 'cat-1',
          },
          {
            id: 'prod-2',
            name: 'Batata',
            categoryId: 'cat-1',
          },
        ],
      },
      {
        id: 'cat-2',
        name: 'Frutas',
        products: [
          {
            id: 'prod-3',
            name: 'Maçã',
            categoryId: 'cat-2',
          },
        ],
      },
    ])
  }),

  // Orders endpoints
  http.post(`${API_URL}/orders`, async ({ request }) => {
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

  http.get(`${API_URL}/orders`, () => {
    return HttpResponse.json([
      {
        id: 'order-1',
        userId: 'user-123',
        storeId: 'store-1',
        status: 'pending',
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ])
  }),

  http.put(`${API_URL}/orders/:id`, async ({ request, params }) => {
    const body = await request.json() as any
    const { id } = params

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled']
    if (body.status && !validStatuses.includes(body.status)) {
      return HttpResponse.json(
        { message: 'Invalid status' },
        { status: 400 }
      )
    }

    return HttpResponse.json({
      id,
      userId: 'user-123',
      storeId: 'store-1',
      status: body.status || 'pending',
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }),

  http.get(`${API_URL}/orders/consolidated`, () => {
    return HttpResponse.json({
      products: [
        { id: 'prod-1', name: 'Cenoura' },
        { id: 'prod-2', name: 'Batata' },
      ],
      stores: [
        { id: 'store-1', name: 'Loja Centro' },
      ],
      matrix: [[5, 3], [10, 7]],
    })
  }),

  // Stores endpoints
  http.get(`${API_URL}/stores`, () => {
    return HttpResponse.json([
      {
        id: 'store-1',
        name: 'Loja Centro',
        address: 'Rua Principal, 123',
      },
      {
        id: 'store-2',
        name: 'Loja Norte',
        address: 'Avenida Norte, 456',
      },
    ])
  }),
]
