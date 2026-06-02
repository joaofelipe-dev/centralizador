import { prisma } from '../../lib/prisma.js'

export class StockCountRepository {
  async create(data: { userId: string; status: string }) {
    const activeProducts = await prisma.product.findMany({
      where: { stockCD: { not: null } }
    })

    return prisma.stockCount.create({
      data: {
        userId: data.userId,
        status: data.status,
        items: {
          create: activeProducts.map(product => ({
            productId: product.id,
            systemQty: product.stockCD || 0,
            physicalQty: 0,
            divergence: 0,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, username: true } },
      },
    })
  }

  async findMany(filters: {
    status?: string
    startDate?: string
    endDate?: string
    limit: number
    offset: number
  }) {
    const where: Record<string, unknown> = {}
    if (filters.status) where.status = filters.status
    if (filters.startDate || filters.endDate) {
      where.createdAt = {}
      if (filters.startDate) (where.createdAt as Record<string, unknown>).gte = new Date(filters.startDate)
      if (filters.endDate) (where.createdAt as Record<string, unknown>).lte = new Date(filters.endDate)
    }

    return Promise.all([
      prisma.stockCount.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, username: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: filters.limit,
        skip: filters.offset,
      }),
      prisma.stockCount.count({ where }),
    ])
  }

  async findById(id: string) {
    return prisma.stockCount.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, username: true } },
      },
    })
  }

  async updateItem(stockCountId: string, productId: string, physicalQty: number, divergence: number) {
    const existing = await prisma.stockCountItem.findFirst({
      where: { stockCountId, productId }
    })
    if (!existing) throw new Error('Stock count item not found')

    return prisma.stockCountItem.update({
      where: { id: existing.id },
      data: { physicalQty, divergence },
    })
  }

  async updateStatus(id: string, status: string) {
    return prisma.stockCount.update({
      where: { id },
      data: { status },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, username: true } },
      },
    })
  }
}
