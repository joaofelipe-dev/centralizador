import { OrderRepository } from './order.repository.js'
import { CreateOrderInput } from './order.schema.js'
import { UserRepository } from '../user/user.repository.js'

export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private userRepository: UserRepository
  ) {}

  async create(userId: string, isAdmin: boolean, data: CreateOrderInput) {
    // RBAC: Standard users can only place orders for stores they are linked to
    if (!isAdmin) {
      const user = await this.userRepository.findById(userId)
      const hasAccess = user?.stores.some(s => s.id === data.storeId)
      
      if (!hasAccess) {
        throw new Error('Forbidden: User does not have access to this store')
      }
    }

    return this.orderRepository.create(userId, data)
  }

  async list(dateLabel?: string) {
    return this.orderRepository.list(dateLabel)
  }

  async getConsolidatedData(dateLabel?: string) {
    const rawItems = await this.orderRepository.getConsolidatedData(dateLabel)
    
    // Grouping by Product and Store
    const products: Record<string, any> = {}
    const stores: Record<string, any> = {}
    const matrix: Record<string, Record<string, { quantity: number, currentStock: number }>> = {}

    rawItems.forEach((item: any) => {
      const productId = item.productId
      const storeId = item.order.storeId

      if (!products[productId]) {
        products[productId] = item.product
      }
      if (!stores[storeId]) {
        stores[storeId] = item.order.store
      }

      if (!matrix[productId]) {
        matrix[productId] = {}
      }

      if (!matrix[productId][storeId]) {
        matrix[productId][storeId] = { quantity: 0, currentStock: 0 }
      }

      // We sum the quantities but for currentStock we take the latest reported
      matrix[productId][storeId].quantity += item.quantity
      matrix[productId][storeId].currentStock = item.currentStock
    })

    return {
      products: Object.values(products),
      stores: Object.values(stores),
      matrix,
    }
  }

  async update(orderId: string, data: any) {
    return this.orderRepository.update(orderId, data)
  }
}
