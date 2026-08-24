import { OrderRepository } from './order.repository.js'
import { ProductRepository } from '../product/product.repository.js'
import { CreateOrderInput, UpdateOrderInput } from './order.schema.js'
import { UserRepository } from '../user/user.repository.js'
import { UserRole } from '../../middlewares/auth.js'
import { exportOrderToNetwork } from '../../lib/order-export.js'
import { prisma } from '../../lib/prisma.js'

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

    if (order && order.store) {
      exportOrderToNetwork(order, order.store.name || 'Loja', order.store.code || undefined)
        .catch(err => console.error('[ORDER-EXPORT] Async export failed:', err))
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

    const order = await this.orderRepository.findById(orderId)
    if (!order) {
      throw new Error('Order not found')
    }

    if (status !== 'APPROVED') {
      return this.orderRepository.update(orderId, { status })
    }

    // Aprovar baixa o estoque do CD, então mudança de status e movimentos precisam
    // cair na mesma transação. O updateMany condicional garante que apenas uma
    // requisição consiga sair de "não aprovado" — um duplo-clique ou um retry não
    // debita o estoque duas vezes.
    return prisma.$transaction(async (tx) => {
      const claimed = await tx.order.updateMany({
        where: { id: orderId, status: { not: 'APPROVED' } },
        data: { status: 'APPROVED' },
      })

      if (claimed.count === 0) {
        throw new Error('Order already approved')
      }

      for (const item of order.items) {
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'EXIT',
            quantity: item.quantity,
            reason: `Order ${order.id} approved`,
            userId: order.userId,
            orderId: order.id,
          },
        })

        await tx.product.update({
          where: { id: item.productId },
          data: { stockCD: { decrement: item.quantity } },
        })
      }

      return tx.order.findUniqueOrThrow({
        where: { id: orderId },
        include: {
          items: { include: { product: true } },
          store: true,
          user: { select: { id: true, name: true, username: true } },
        },
      })
    })
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
