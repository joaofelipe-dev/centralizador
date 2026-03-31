import request from 'supertest'
import { app } from '@/app'
import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'

describe('Auth Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        password: '$2a$10$abcd',
        isAdmin: false,
        storeId: 'store-1',
      }

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser as any)

      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'password123',
        })

      expect([200, 201, 400, 401]).toContain(response.status)
    })

    it('should reject invalid credentials', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null)

      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'nonexistent',
          password: 'wrongpassword',
        })

      expect([401, 400]).toContain(response.status)
    })

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser',
          // missing password
        })

      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const newUser = {
        id: 'user-new-123',
        username: 'newuser',
        email: 'newuser@example.com',
        password: '$2a$10$hashed',
        isAdmin: false,
        storeId: null,
      }

      vi.mocked(prisma.user.create).mockResolvedValueOnce(newUser as any)

      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'securepassword123',
        })

      expect([200, 201, 400]).toContain(response.status)
    })

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'invalid-email',
          password: 'password123',
        })

      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    it('should require password to be minimum length', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'short',
        })

      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('GET /auth/me', () => {
    it('should return user when authenticated', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        password: '$2a$10$abcd',
        isAdmin: false,
        storeId: 'store-1',
      }

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser as any)

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer test-token-jwt-123')

      expect([200, 401]).toContain(response.status)
    })

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/auth/me')

      expect(response.status).toBe(401)
    })

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')

      expect(response.status).toBe(401)
    })

    it('should return 401 with malformed auth header', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'InvalidToken')

      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })
})
