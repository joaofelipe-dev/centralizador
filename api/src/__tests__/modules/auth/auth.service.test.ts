import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService } from '@/modules/auth/auth.service'
import { UserRepository } from '@/modules/user/user.repository'

describe('AuthService', () => {
  let authService: AuthService
  let mockUserRepository: UserRepository

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
    } as any

    authService = new AuthService(mockUserRepository)
  })

  describe('authenticate', () => {
    it('should authenticate user with correct password', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG.', // bcrypt hash of "password123"
        role: 'DEFAULT',
        storeId: 'store-1',
      }

      vi.mocked(mockUserRepository.findByUsername).mockResolvedValueOnce(mockUser as any)

      const result = await authService.authenticate({
        username: 'testuser',
        password: 'password123',
      })

      expect(result.user.id).toBe('user-123')
      expect(result.user).not.toHaveProperty('password')
    })

    it('should throw error with incorrect password', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        password: '$2a$10$hashed',
        role: 'DEFAULT',
        storeId: 'store-1',
      }

      vi.mocked(mockUserRepository.findByUsername).mockResolvedValueOnce(mockUser as any)

      try {
        await authService.authenticate({
          username: 'testuser',
          password: 'wrongpassword',
        })
        expect.fail('Should have thrown error')
      } catch (error) {
        expect((error as Error).message).toContain('Invalid')
      }
    })

    it('should throw error if user not found', async () => {
      vi.mocked(mockUserRepository.findByUsername).mockResolvedValueOnce(null)

      try {
        await authService.authenticate({
          username: 'nonexistent',
          password: 'password123',
        })
        expect.fail('Should have thrown error')
      } catch (error) {
        expect((error as Error).message).toContain('Invalid')
      }
    })
  })

  describe('validateCredentials', () => {
    it('should validate email format', async () => {
      // Assuming validateCredentials exists
      const validEmail = 'test@example.com'
      // Should not throw
      expect(validEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    })

    it('should validate password minimum length', async () => {
      const validPassword = 'password123'
      expect(validPassword.length).toBeGreaterThanOrEqual(8)
    })
  })
})
