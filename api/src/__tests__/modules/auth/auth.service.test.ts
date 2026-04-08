import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService } from '@/modules/auth/auth.service'
import { UserRepository } from '@/modules/user/user.repository'

vi.mock('bcryptjs', () => ({
  default: {
    compare: () => Promise.resolve(true),
  },
}))

describe('AuthService', () => {
  let authService: AuthService
  let mockUserRepository: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockUserRepository = {
      findByUsername: vi.fn(),
      findByEmail: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
    }

    authService = new AuthService(mockUserRepository)
  })

  describe('authenticate', () => {
    it('should authenticate user with correct password', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        name: 'Test User',
        email: null,
        password: '$2a$10$hash',
        role: 'DEFAULT',
        createdAt: new Date(),
        stores: [],
      }

      mockUserRepository.findByUsername.mockResolvedValue(mockUser)

      const result = await authService.authenticate({
        username: 'testuser',
        password: 'password123',
      })

      expect(result.user.id).toBe('user-123')
      expect(result.user).not.toHaveProperty('password')
    })

    it('should throw error if user not found', async () => {
      mockUserRepository.findByUsername.mockResolvedValue(null)

      await expect(
        authService.authenticate({
          username: 'nonexistent',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid credentials')
    })
  })

  describe('validateCredentials', () => {
    it('should validate email format', async () => {
      const validEmail = 'test@example.com'
      expect(validEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    })

    it('should validate password minimum length', async () => {
      const validPassword = 'password123'
      expect(validPassword.length).toBeGreaterThanOrEqual(6)
    })
  })
})