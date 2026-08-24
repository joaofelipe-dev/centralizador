import { prisma, type DbClient } from '../../lib/prisma.js'
import type { CreatePurchaseInput } from './purchase.schema.js'

export class PurchaseRepository {
  async create(data: CreatePurchaseInput & { userId: string }) {
    return prisma.purchaseOrder.create({
      data: {
        supplierId: data.supplierId,
        userId: data.userId,
        status: 'DRAFT',
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        supplier: true,
        user: true,
      },
    })
  }

  async findById(id: string) {
    return prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        user: { select: { id: true, name: true, username: true } },
        items: { include: { product: true } },
        movements: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    })
  }

  async findMany(filters: {
    status?: string
    supplierId?: string
    startDate?: string
    endDate?: string
    limit: number
    offset: number
  }) {
    const where: Record<string, unknown> = {}
    if (filters.status) where.status = filters.status
    if (filters.supplierId) where.supplierId = filters.supplierId
    if (filters.startDate || filters.endDate) {
      where.createdAt = {}
      if (filters.startDate) (where.createdAt as Record<string, unknown>).gte = new Date(filters.startDate)
      if (filters.endDate) (where.createdAt as Record<string, unknown>).lte = new Date(filters.endDate)
    }

    return Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          supplier: true,
          user: { select: { id: true, name: true, username: true } },
          items: { include: { product: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: filters.limit,
        skip: filters.offset,
      }),
      prisma.purchaseOrder.count({ where }),
    ])
  }

  async updateStatus(id: string, status: string, db: DbClient = prisma) {
    return db.purchaseOrder.update({
      where: { id },
      data: { status },
      include: {
        supplier: true,
        user: { select: { id: true, name: true, username: true } },
        items: { include: { product: true } },
      },
    })
  }
}
