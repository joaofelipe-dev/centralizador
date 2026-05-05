import { prisma } from '../../lib/prisma.js'

export class MovementService {
  async listMovements(filters?: {
    type?: string
    productId?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }) {
    const where: any = {}

    if (filters?.type) {
      where.type = filters.type
    }
    if (filters?.productId) {
      where.productId = filters.productId
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

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          product: {
            select: { id: true, name: true }
          },
          user: {
            select: { id: true, name: true, username: true }
          },
          order: {
            select: { id: true, status: true }
          },
          purchaseOrder: {
            select: { id: true, status: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.stockMovement.count({ where })
    ])

    return {
      total,
      limit,
      offset,
      data: movements
    }
  }

  async createAdjustment(data: {
    productId: string
    quantity: number
    reason: string
    userId: string
  }) {
    const { productId, quantity, reason, userId } = data

    const product = await prisma.product.findUnique({
      where: { id: productId }
    })
    if (!product) {
      throw new Error('Product not found')
    }

    return await prisma.$transaction(async (tx) => {
      const movement = await tx.stockMovement.create({
        data: {
          productId,
          type: 'ADJUST',
          quantity,
          reason,
          userId
        },
        include: {
          product: {
            select: { id: true, name: true }
          },
          user: {
            select: { id: true, name: true }
          }
        }
      })

      await tx.product.update({
        where: { id: productId },
        data: {
          stockCD: {
            increment: quantity
          }
        }
      })

      return movement
    })
  }
}
