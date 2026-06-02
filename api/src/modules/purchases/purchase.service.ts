import { prisma } from '../../lib/prisma.js'
import { PurchaseRepository } from './purchase.repository.js'
import type { CreatePurchaseInput } from './purchase.schema.js'

export class PurchaseService {
  private repo: PurchaseRepository

  constructor(repo?: PurchaseRepository) {
    this.repo = repo || new PurchaseRepository()
  }

  async createPurchase(data: CreatePurchaseInput & { userId: string }) {
    const supplier = await prisma.supplier.findUnique({
      where: { id: data.supplierId }
    })
    if (!supplier) throw new Error('Supplier not found')

    const productIds = data.items.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    })
    if (products.length !== productIds.length) {
      throw new Error('One or more products not found')
    }

    return this.repo.create(data)
  }

  async listPurchases(filters: {
    status?: string
    supplierId?: string
    startDate?: string
    endDate?: string
    limit: number
    offset: number
  }) {
    const [purchases, total] = await this.repo.findMany(filters)
    return { total, limit: filters.limit, offset: filters.offset, data: purchases }
  }

  async getPurchaseById(id: string) {
    const purchase = await this.repo.findById(id)
    if (!purchase) throw new Error('Purchase order not found')
    return purchase
  }

  async receivePurchase(id: string, userId: string) {
    const purchase = await this.repo.findById(id)
    if (!purchase) throw new Error('Purchase order not found')
    if (purchase.status === 'RECEIVED') throw new Error('Purchase order already received')

    return await prisma.$transaction(async (tx) => {
      for (const item of purchase.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockCD: { increment: item.quantity } }
        })

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'ENTRY',
            quantity: item.quantity,
            reason: `Purchase order ${purchase.id}`,
            userId,
            purchaseOrderId: purchase.id
          }
        })
      }

      return this.repo.updateStatus(id, 'RECEIVED')
    })
  }
}
