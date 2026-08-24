import { prisma } from '../../lib/prisma.js'
import { StockCountRepository } from './stock-count.repository.js'

export class StockCountService {
  private repo: StockCountRepository

  constructor(repo?: StockCountRepository) {
    this.repo = repo || new StockCountRepository()
  }

  async createStockCount(userId: string) {
    return this.repo.create({ userId, status: 'OPEN' })
  }

  async listStockCounts(filters: {
    status?: string
    startDate?: string
    endDate?: string
    limit: number
    offset: number
  }) {
    const [stockCounts, total] = await this.repo.findMany(filters)
    return { total, limit: filters.limit, offset: filters.offset, data: stockCounts }
  }

  async getStockCountById(id: string) {
    const stockCount = await this.repo.findById(id)
    if (!stockCount) throw new Error('Stock count not found')
    return stockCount
  }

  async updateCountItems(stockCountId: string, items: { productId: string; physicalQty: number }[]) {
    const stockCount = await this.repo.findById(stockCountId)
    if (!stockCount) throw new Error('Stock count not found')
    if (stockCount.status === 'CLOSED') throw new Error('Cannot update items of a closed stock count')

    const results = []
    for (const item of items) {
      const existingItem = stockCount.items.find(i => i.productId === item.productId)
      if (!existingItem) throw new Error(`Stock count item for product ${item.productId} not found`)

      const divergence = item.physicalQty - existingItem.systemQty
      const updated = await this.repo.updateItem(stockCountId, item.productId, item.physicalQty, divergence)
      results.push(updated)
    }

    return results
  }

  async closeStockCount(id: string, userId: string) {
    const stockCount = await this.repo.findById(id)
    if (!stockCount) throw new Error('Stock count not found')
    if (stockCount.status === 'CLOSED') throw new Error('Stock count is already closed')

    return await prisma.$transaction(async (tx) => {
      for (const item of stockCount.items) {
        if (item.divergence !== 0) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockCD: { increment: item.divergence } },
          })

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              type: 'ADJUST',
              quantity: item.divergence,
              reason: 'Ajuste após contagem física',
              userId,
            },
          })
        }
      }

      return this.repo.updateStatus(id, 'CLOSED', tx)
    })
  }
}
