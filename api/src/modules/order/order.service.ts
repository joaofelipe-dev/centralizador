import { OrderRepository } from './order.repository.js'
import { ProductRepository } from '../product/product.repository.js'
import { CreateOrderInput, UpdateOrderInput } from './order.schema.js'
import { UserRepository } from '../user/user.repository.js'
import { UserRole } from '../../middlewares/auth.js'
import { exportOrderToNetwork } from '../../lib/order-export.js'

export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private userRepository: UserRepository,
    private productRepository: ProductRepository
  ) { }

  async create(userId: string, role: UserRole, data: CreateOrderInput) {
    if (role === 'DEFAULT') {
      const user = await this.userRepository.findById(userId)
      const hasAccess = user?.stores.some(s => s.id === data.storeId)

      if (!hasAccess) {
        throw new Error('Forbidden: User does not have access to this store')
      }
    }

    const order = await this.orderRepository.create(userId, data)

    console.log(`[ORDER-SERVICE] Order created: ${order?.id}, store: ${order?.store?.name} (${order?.store?.code})`)
    console.log(`[ORDER-SERVICE] Order items count: ${order?.items?.length}`)

    if (order && order.store) {
      console.log(`[ORDER-SERVICE] Starting export for store: ${order.store.name}`)
      const exportResult = await exportOrderToNetwork(
        order,
        order.store.name || 'Loja',
        order.store.code || undefined
      )
      console.log(`[ORDER-SERVICE] Export result:`, exportResult)
      if (!exportResult.success) {
        console.error(`[ORDER-SERVICE] Failed to export order ${order.id}: ${exportResult.error}`)
      }
    } else {
      console.warn(`[ORDER-SERVICE] Order or store is null, skipping export`)
    }

    return order
  }

  async list(
    dateLabel?: string,
    statusFilter?: string,
    limit: number = 50,
    offset: number = 0,
    storeId?: string,
    startDate?: string,
    endDate?: string,
    userId?: string,
    userRole?: string
  ) {
    let allowedStoreIds: string | string[] | undefined = storeId

    // Aplicar segurança baseada no role
    if (userRole === 'DEFAULT') {
      const user = await this.userRepository.findById(userId!)
      const userStoreIds = user?.stores.map(s => s.id) || []

      if (userStoreIds.length === 0) {
        return { total: 0, limit, offset, data: [] }
      }

      if (storeId) {
        // Se pediu uma loja específica, verifica se tem acesso
        if (!userStoreIds.includes(storeId)) {
          return { total: 0, limit, offset, data: [] }
        }
        allowedStoreIds = storeId
      } else {
        // Se não pediu, mostra todas as suas lojas
        allowedStoreIds = userStoreIds
      }
    }

    return this.orderRepository.list(
      dateLabel,
      statusFilter,
      limit,
      offset,
      allowedStoreIds,
      startDate,
      endDate
    )
  }

  async getConsolidatedData(dateLabel?: string, startDate?: string, endDate?: string) {
    const rawItems = await this.orderRepository.getConsolidatedData(dateLabel, startDate, endDate)

    const allProducts = await this.productRepository.listAll()

    const products: Record<string, any> = {}
    const stores: Record<string, any> = {}
    const matrix: Record<string, Record<string, { quantity: number, currentStock: number }>> = {}

    allProducts.forEach((product: any) => {
      products[product.id] = {
        ...product,
        categoryName: product.category?.name || 'Outros',
      }
    })

    rawItems.forEach((item: any) => {
      const productId = item.productId
      const storeId = item.order.storeId
      const orderDate = item.order.orderDate

      if (!stores[storeId]) {
        stores[storeId] = {
          ...item.order.store,
          orderDate: orderDate ? new Date(orderDate).toISOString().split('T')[0] : '',
        }
      }

      if (!matrix[productId]) {
        matrix[productId] = {}
      }

      if (!matrix[productId][storeId]) {
        matrix[productId][storeId] = { quantity: 0, currentStock: 0 }
      }

      matrix[productId][storeId].quantity += item.quantity
      matrix[productId][storeId].currentStock += item.currentStock
    })

    return {
      products: Object.values(products),
      stores: Object.values(stores),
      matrix,
    }
  }

  async update(orderId: string, data: UpdateOrderInput, role: UserRole) {
    if (role !== 'SUPERVISOR' && role !== 'ADMIN') {
      throw new Error('Forbidden: Only supervisors and admins can modify orders')
    }
    return this.orderRepository.update(orderId, data)
  }

  async updateStatus(orderId: string, status: string, role: UserRole) {
    if (role !== 'SUPERVISOR' && role !== 'ADMIN') {
      throw new Error('Forbidden: Only supervisors and admins can change order status')
    }
    return this.orderRepository.update(orderId, { status })
  }

  async getDashboardData(params: {
    storeId?: string
    userId?: string
    status?: string
    startDate?: string
    endDate?: string
    sort?: string
    order?: 'asc' | 'desc',
    requestingUserId?: string,
    requestingUserRole?: string
  }) {
    // Usamos a lógica de listagem que já tem segurança
    return this.list(
      undefined, // dateLabel
      params.status,
      50, // limit
      0, // offset
      params.storeId,
      params.startDate,
      params.endDate,
      params.requestingUserId,
      params.requestingUserRole
    )
  }
}
