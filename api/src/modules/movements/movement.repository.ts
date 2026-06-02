import { prisma } from '../../lib/prisma.js'
import type { CreateAdjustmentInput } from './movement.schema.js'

export class MovementRepository {
  async findMany(filters: {
    type?: string
    productId?: string
    startDate?: string
    endDate?: string
    limit: number
    offset: number
  }) {
    const where: Record<string, unknown> = {}
    if (filters.type) where.type = filters.type
    if (filters.productId) where.productId = filters.productId
    if (filters.startDate || filters.endDate) {
      where.createdAt = {}
      if (filters.startDate) (where.createdAt as Record<string, unknown>).gte = new Date(filters.startDate)
      if (filters.endDate) (where.createdAt as Record<string, unknown>).lte = new Date(filters.endDate)
    }

    return Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          product: { select: { id: true, name: true } },
          user: { select: { id: true, name: true, username: true } },
          order: { select: { id: true, status: true } },
          purchaseOrder: { select: { id: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: filters.limit,
        skip: filters.offset,
      }),
      prisma.stockMovement.count({ where }),
    ])
  }

  async create(data: CreateAdjustmentInput & { userId: string }) {
    return prisma.stockMovement.create({
      data: {
        productId: data.productId,
        type: 'ADJUST',
        quantity: data.quantity,
        reason: data.reason,
        userId: data.userId,
      },
      include: {
        product: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
      },
    })
  }
}
