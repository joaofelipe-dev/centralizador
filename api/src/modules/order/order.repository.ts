import { prisma } from '../../lib/prisma.js'
import { CreateOrderInput } from './order.schema.js'

export class OrderRepository {
  async create(userId: string, data: CreateOrderInput) {
    return prisma.order.create({
      data: {
        userId,
        storeId: data.storeId,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            currentStock: item.currentStock,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        store: true,
      },
    })
  }

  async list(dateLabel?: string) {
    const where = dateLabel ? {
      createdAt: {
        gte: new Date(`${dateLabel}T00:00:00Z`),
        lte: new Date(`${dateLabel}T23:59:59Z`),
      }
    } : {}

    return prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        store: true,
        user: {
          select: {
            name: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async getConsolidatedData(dateLabel?: string) {
    const where = dateLabel ? {
      createdAt: {
        gte: new Date(`${dateLabel}T00:00:00Z`),
        lte: new Date(`${dateLabel}T23:59:59Z`),
      }
    } : {}

    const items = await prisma.orderItem.findMany({
      where: {
        order: where
      },
      include: {
        product: true,
        order: {
          include: {
            store: true,
          },
        },
      },
    })

    return items
  }

  async update(id: string, data: { items: { productId: string, quantity: number, currentStock: number }[] }) {
    return prisma.$transaction(async (tx) => {
      // Delete existing items
      await tx.orderItem.deleteMany({
        where: { orderId: id }
      })

      // Create new items
      return tx.order.update({
        where: { id },
        data: {
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              currentStock: item.currentStock,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          store: true,
        },
      })
    })
  }
}
