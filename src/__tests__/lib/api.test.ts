import { describe, it, expect, vi } from 'vitest'
import { api } from '@/lib/api'
import type { ApiInterface } from '@/lib/api'

describe('API Client', () => {
  describe('Auth Methods', () => {
    it('should export login method', () => {
      expect(typeof api.login).toBe('function')
    })

    it('should export register method', () => {
      expect(typeof api.register).toBe('function')
    })

    it('should export getMe method', () => {
      expect(typeof api.getMe).toBe('function')
    })
  })

  describe('Order Methods', () => {
    it('should export createOrder method', () => {
      expect(typeof api.createOrder).toBe('function')
    })

    it('should export getOrders method', () => {
      expect(typeof api.getOrders).toBe('function')
    })

    it('should export updateOrder method', () => {
      expect(typeof api.updateOrder).toBe('function')
    })

    it('should export getConsolidatedOrders method', () => {
      expect(typeof api.getConsolidatedOrders).toBe('function')
    })
  })

  describe('Product Methods', () => {
    it('should export getProducts method', () => {
      expect(typeof api.getProducts).toBe('function')
    })

    it('should export createProduct method', () => {
      expect(typeof api.createProduct).toBe('function')
    })

    it('should export updateProduct method', () => {
      expect(typeof api.updateProduct).toBe('function')
    })

    it('should export deleteProduct method', () => {
      expect(typeof api.deleteProduct).toBe('function')
    })
  })

  describe('User Methods', () => {
    it('should export getUsers method', () => {
      expect(typeof api.getUsers).toBe('function')
    })

    it('should export createUser method', () => {
      expect(typeof api.createUser).toBe('function')
    })

    it('should export updateUser method', () => {
      expect(typeof api.updateUser).toBe('function')
    })

    it('should export deleteUser method', () => {
      expect(typeof api.deleteUser).toBe('function')
    })
  })

  describe('Store Methods', () => {
    it('should export getStores method', () => {
      expect(typeof api.getStores).toBe('function')
    })

    it('should export getCategories method', () => {
      expect(typeof api.getCategories).toBe('function')
    })
  })
})
