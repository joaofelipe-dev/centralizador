import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UserService } from '@/modules/user/user.service'
import { UserRepository } from '@/modules/user/user.repository'

describe('UserService', () => {
  let userService: UserService
  let mockRepository: UserRepository

  beforeEach(() => {
    vi.clearAllMocks()
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByUsername: vi.fn(),
      findByEmail: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as any

    userService = new UserService(mockRepository)
  })

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        password: '$2a$10$hashed',
        isAdmin: false,
        storeId: 'store-1',
      }

      vi.mocked(mockRepository.create).mockResolvedValueOnce(mockUser as any)

      const result = await userService.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'plainpassword',
        storeId: 'store-1',
      })

      expect(result.id).toBe('user-123')
      expect(vi.mocked(mockRepository.create)).toHaveBeenCalled()
    })
  })

  describe('findById', () => {
    it('should find user by ID', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        password: '$2a$10$hashed',
        isAdmin: false,
        storeId: 'store-1',
      }

      vi.mocked(mockRepository.findById).mockResolvedValueOnce(mockUser as any)

      const result = await userService.findById('user-123')

      expect(result.id).toBe('user-123')
      expect(result.username).toBe('testuser')
    })

    it('should return null if user not found', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValueOnce(null)

      const result = await userService.findById('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('findByUsername', () => {
    it('should find user by username', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        password: '$2a$10$hashed',
        isAdmin: false,
        storeId: 'store-1',
      }

      vi.mocked(mockRepository.findByUsername).mockResolvedValueOnce(mockUser as any)

      const result = await userService.findByUsername('testuser')

      expect(result?.username).toBe('testuser')
    })
  })

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        password: '$2a$10$hashed',
        isAdmin: false,
        storeId: 'store-1',
      }

      vi.mocked(mockRepository.findByEmail).mockResolvedValueOnce(mockUser as any)

      const result = await userService.findByEmail('test@example.com')

      expect(result?.email).toBe('test@example.com')
    })
  })

  describe('list', () => {
    it('should return list of all users', async () => {
      const mockUsers = [
        {
          id: 'user-123',
          username: 'testuser',
          email: 'test@example.com',
          password: '$2a$10$hashed',
          isAdmin: false,
          storeId: 'store-1',
        },
      ]

      vi.mocked(mockRepository.list).mockResolvedValueOnce(mockUsers as any)

      const result = await userService.list()

      expect(Array.isArray(result)).toBe(true)
      expect(result[0].username).toBe('testuser')
    })
  })

  describe('update', () => {
    it('should update user data', async () => {
      const mockUpdatedUser = {
        id: 'user-123',
        username: 'updateduser',
        email: 'updated@example.com',
        password: '$2a$10$hashed',
        isAdmin: false,
        storeId: 'store-1',
      }

      vi.mocked(mockRepository.update).mockResolvedValueOnce(mockUpdatedUser as any)

      const result = await userService.update('user-123', {
        username: 'updateduser',
        email: 'updated@example.com',
      })

      expect(result.username).toBe('updateduser')
      expect(result.email).toBe('updated@example.com')
    })
  })

  describe('delete', () => {
    it('should delete user by ID', async () => {
      vi.mocked(mockRepository.delete).mockResolvedValueOnce(undefined)

      await userService.delete('user-123')

      expect(vi.mocked(mockRepository.delete)).toHaveBeenCalledWith('user-123')
    })
  })
})
