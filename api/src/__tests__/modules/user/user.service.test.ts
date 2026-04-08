import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UserService } from '@/modules/user/user.service'
import { UserRepository } from '@/modules/user/user.repository'
import bcrypt from 'bcryptjs'

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(() => Promise.resolve('$2a$10$hashed')),
  },
}))

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

  describe('createUser', () => {
    it('should create a new user with hashed password', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        password: '$2a$10$hashed',
        role: 'DEFAULT',
        storeId: 'store-1',
        stores: [],
      }

      mockRepository.create = vi.fn().mockResolvedValue(mockUser)

      const result = await userService.createUser({
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: 'plainpassword',
        storeIds: ['store-1'],
        role: 'DEFAULT',
      })

      expect(result.id).toBe('user-123')
      expect(mockRepository.create).toHaveBeenCalled()
    })
  })

  describe('getUserById', () => {
    it('should find user by ID', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        password: '$2a$10$hashed',
        role: 'DEFAULT',
        storeId: 'store-1',
        stores: [],
      }

      mockRepository.findById = vi.fn().mockResolvedValue(mockUser)

      const result = await userService.getUserById('user-123')

      expect(result.id).toBe('user-123')
      expect(result.username).toBe('testuser')
    })

    it('should throw error if user not found', async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(null)

      await expect(userService.getUserById('nonexistent')).rejects.toThrow('User not found')
    })
  })

  describe('getUserByUsername', () => {
    it('should find user by username', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        password: '$2a$10$hashed',
        role: 'DEFAULT',
        storeId: 'store-1',
        stores: [],
      }

      mockRepository.findByUsername = vi.fn().mockResolvedValue(mockUser)

      const result = await userService.getUserByUsername('testuser')

      expect(result?.username).toBe('testuser')
    })
  })

  describe('getUserByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        password: '$2a$10$hashed',
        role: 'DEFAULT',
        storeId: 'store-1',
        stores: [],
      }

      mockRepository.findByEmail = vi.fn().mockResolvedValue(mockUser)

      const result = await userService.getUserByEmail('test@example.com')

      expect(result?.email).toBe('test@example.com')
    })
  })

  describe('listUsers', () => {
    it('should return list of all users', async () => {
      const mockUsers = [
        {
          id: 'user-123',
          username: 'testuser',
          email: 'test@example.com',
          password: '$2a$10$hashed',
          role: 'DEFAULT',
          storeId: 'store-1',
          stores: [],
        },
      ]

      mockRepository.list = vi.fn().mockResolvedValue(mockUsers)

      const result = await userService.listUsers()

      expect(Array.isArray(result)).toBe(true)
      expect(result[0].username).toBe('testuser')
    })
  })

  describe('updateUser', () => {
    it('should update user data', async () => {
      const mockUpdatedUser = {
        id: 'user-123',
        username: 'updateduser',
        email: 'updated@example.com',
        password: '$2a$10$hashed',
        role: 'DEFAULT',
        storeId: 'store-1',
        stores: [],
      }

      mockRepository.findById = vi.fn().mockResolvedValue(mockUpdatedUser)
      mockRepository.update = vi.fn().mockResolvedValue(mockUpdatedUser)

      const result = await userService.updateUser('user-123', {
        username: 'updateduser',
        email: 'updated@example.com',
      })

      expect(result.username).toBe('updateduser')
      expect(result.email).toBe('updated@example.com')
    })
  })

  describe('deleteUser', () => {
    it('should delete user by ID', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        password: '$2a$10$hashed',
        role: 'DEFAULT',
        storeId: 'store-1',
        stores: [],
      }

      mockRepository.findById = vi.fn().mockResolvedValue(mockUser)
      mockRepository.delete = vi.fn().mockResolvedValue(undefined)

      await userService.deleteUser('user-123')

      expect(mockRepository.delete).toHaveBeenCalledWith('user-123')
    })
  })
})