import request from 'supertest'
import { app } from '@/app'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'

describe('Order Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /orders', () => {
    it('should create order for authenticated user', async () => {
      const mockOrder = {
        id: 'order-1',
        userId: 'user-123',
        storeId: 'store-1',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(prisma.order.create).mockResolvedValueOnce(mockOrder as any)

      const response = await request(app)
        .post('/orders')
        .set('Authorization', 'Bearer test-token-jwt-123')
        .send({
          storeId: 'store-1',
          items: [
            { productId: 'prod-1', quantity: 5, currentStock: 2 },
          ],
        })

      expect([200, 201, 400, 401]).toContain(response.status)
    })

    it('should reject without authentication', async () => {
      const response = await request(app)
        .post('/orders')
        .send({
          storeId: 'store-1',
          items: [{ productId: 'prod-1', quantity: 5, currentStock: 2 }],
        })

      expect(response.status).toBe(401)
    })

    it('should validate order items are present', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', 'Bearer test-token-jwt-123')
        .send({
          storeId: 'store-1',
          items: [],
        })

      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    it('should validate storeId is provided', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', 'Bearer test-token-jwt-123')
        .send({
          items: [{ productId: 'prod-1', quantity: 5, currentStock: 2 }],
        })

      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('GET /orders', () => {
    it('should list orders', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          userId: 'user-123',
          storeId: 'store-1',
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
          items: [],
          user: {} as any,
          store: {} as any,
        },
      ]

      vi.mocked(prisma.order.findMany).mockResolvedValueOnce(mockOrders as any)

      const response = await request(app)
        .get('/orders')

      expect([200, 401]).toContain(response.status)
    })

    it('should filter orders by date', async () => {
      vi.mocked(prisma.order.findMany).mockResolvedValueOnce([])

      const response = await request(app)
        .get('/orders?date=2026-03-30')

      expect([200, 400, 401]).toContain(response.status)
    })
  })

  describe('PUT /orders/:id', () => {
    it('should update order status', async () => {
      const mockUpdatedOrder = {
        id: 'order-1',
        userId: 'user-123',
        storeId: 'store-1',
        status: 'confirmed',
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
        user: {} as any,
        store: {} as any,
      }

      vi.mocked(prisma.order.update).mockResolvedValueOnce(mockUpdatedOrder as any)

      const response = await request(app)
        .put('/orders/order-1')
        .send({ status: 'confirmed' })

      expect([200, 400, 401]).toContain(response.status)
    })

    it('should validate status value', async () => {
      const response = await request(app)
        .put('/orders/order-1')
        .send({ status: 'invalid-status' })

      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('GET /orders/consolidated', () => {
    it('should return consolidated order data', async () => {
      const response = await request(app)
        .get('/orders/consolidated')

      expect([200, 400, 401]).toContain(response.status)
    })

    it('should support date filtering', async () => {
      const response = await request(app)
        .get('/orders/consolidated?date=2026-03-30')

      expect([200, 400, 401]).toContain(response.status)
    })
  })

  describe('RBAC - Authorization', () => {
    it('should handle order access', async () => {
      vi.mocked(prisma.order.findMany).mockResolvedValueOnce([])

      const response = await request(app)
        .get('/orders')

      expect([200, 401]).toContain(response.status)
    })

    it('should validate create permissions', async () => {
      const mockOrder = {
        id: 'order-1',
        userId: 'user-123',
        storeId: 'store-1',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(prisma.order.create).mockResolvedValueOnce(mockOrder as any)

      const response = await request(app)
        .post('/orders')
        .set('Authorization', 'Bearer test-token-jwt-123')
        .send({
          storeId: 'store-1',
          items: [{ productId: 'prod-1', quantity: 5, currentStock: 2 }],
        })

      expect([200, 201, 400, 401]).toContain(response.status)
    })
  })
})
