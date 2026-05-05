import { prisma } from '../../lib/prisma.js'

export class PurchaseService {
  async createPurchase(data: {
    supplierId: string
    userId: string
    items: { productId: string; quantity: number; unitCost?: number }[]
  }) {
    const { supplierId, userId, items } = data

    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId }
    })
    if (!supplier) {
      throw new Error('Supplier not found')
    }

    const productIds = items.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    })
    if (products.length !== productIds.length) {
      throw new Error('One or more products not found')
    }

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        supplierId,
        userId,
        status: 'DRAFT',
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        supplier: true,
        user: true
      }
    })

    return purchaseOrder
  }

  async listPurchases(filters?: {
    status?: string
    supplierId?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }) {
    const where: any = {}

    if (filters?.status) {
      where.status = filters.status
    }
    if (filters?.supplierId) {
      where.supplierId = filters.supplierId
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

    const [purchases, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          supplier: true,
          user: {
            select: { id: true, name: true, username: true }
          },
          items: {
            include: {
              product: true
            }
          },
          _count: {
            select: { items: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.purchaseOrder.count({ where })
    ])

    return {
      total,
      limit,
      offset,
      data: purchases
    }
  }

  async getPurchaseById(id: string) {
    const purchase = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        user: {
          select: { id: true, name: true, username: true }
        },
        items: {
          include: {
            product: true
          }
        },
        movements: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        }
      }
    })

    if (!purchase) {
      throw new Error('Purchase order not found')
    }

    return purchase
  }

  async receivePurchase(id: string, userId: string) {
    const purchase = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    if (!purchase) {
      throw new Error('Purchase order not found')
    }

    if (purchase.status === 'RECEIVED') {
      throw new Error('Purchase order already received')
    }

    return await prisma.$transaction(async (tx) => {
      for (const item of purchase.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockCD: {
              increment: item.quantity
            }
          }
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

      const updatedPurchase = await tx.purchaseOrder.update({
        where: { id },
        data: { status: 'RECEIVED' },
        include: {
          supplier: true,
          user: {
            select: { id: true, name: true, username: true }
          },
          items: {
            include: {
              product: true
            }
          }
        }
      })

      return updatedPurchase
    })
  }
}
