import { prisma } from '../../lib/prisma.js'

export class StockCountService {
  async createStockCount(userId: string) {
    const activeProducts = await prisma.product.findMany({
      where: { stockCD: { not: null } }
    })

    const stockCount = await prisma.stockCount.create({
      data: {
        userId,
        status: 'OPEN',
        items: {
          create: activeProducts.map(product => ({
            productId: product.id,
            systemQty: product.stockCD || 0,
            physicalQty: 0,
            divergence: 0
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: { id: true, name: true, username: true }
        }
      }
    })

    return stockCount
  }

  async listStockCounts(filters?: {
    status?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }) {
    const where: any = {}

    if (filters?.status) {
      where.status = filters.status
    }
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {}
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate)
      }
    }

    const limit = filters?.limit || 50
    const offset = filters?.offset || 0

    const [stockCounts, total] = await Promise.all([
      prisma.stockCount.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, username: true }
          },
          _count: {
            select: { items: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.stockCount.count({ where })
    ])

    return {
      total,
      limit,
      offset,
      data: stockCounts
    }
  }

  async getStockCountById(id: string) {
    const stockCount = await prisma.stockCount.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: { id: true, name: true, username: true }
        }
      }
    })

    if (!stockCount) {
      throw new Error('Stock count not found')
    }

    return stockCount
  }

  async updateCountItem(stockCountId: string, productId: string, physicalQty: number) {
    const stockCount = await prisma.stockCount.findUnique({
      where: { id: stockCountId }
    })

    if (!stockCount) {
      throw new Error('Stock count not found')
    }

    if (stockCount.status === 'CLOSED') {
      throw new Error('Cannot update items of a closed stock count')
    }

    const item = await prisma.stockCountItem.findUnique({
      where: {
        stockCountId_productId: {
          stockCountId,
          productId
        }
      }
    })

    if (!item) {
      throw new Error('Stock count item not found')
    }

    const divergence = physicalQty - item.systemQty

    const updatedItem = await prisma.stockCountItem.update({
      where: {
        stockCountId_productId: {
          stockCountId,
          productId
        }
      },
      data: {
        physicalQty,
        divergence
      },
      include: {
        product: true
      }
    })

    return updatedItem
  }

  async closeStockCount(id: string, userId: string) {
    const stockCount = await prisma.stockCount.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    if (!stockCount) {
      throw new Error('Stock count not found')
    }

    if (stockCount.status === 'CLOSED') {
      throw new Error('Stock count is already closed')
    }

    return await prisma.$transaction(async (tx) => {
      for (const item of stockCount.items) {
        if (item.divergence !== 0) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockCD: {
                increment: item.divergence
              }
            }
          })

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              type: 'ADJUST',
              quantity: item.divergence,
              reason: 'Ajuste após contagem física',
              userId
            }
          })
        }
      }

      const updatedStockCount = await tx.stockCount.update({
        where: { id },
        data: { status: 'CLOSED' },
        include: {
          items: {
            include: {
              product: true
            }
          },
          user: {
            select: { id: true, name: true, username: true }
          }
        }
      })

      return updatedStockCount
    })
  }
}
