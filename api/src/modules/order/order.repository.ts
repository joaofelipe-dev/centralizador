import { prisma } from '../../lib/prisma.js'
import { CreateOrderInput } from './order.schema.js'

export class OrderRepository {
  async create(userId: string, data: CreateOrderInput) {
    const orderDate = data.orderDate 
      ? new Date(data.orderDate)
      : new Date(Date.now() + 24 * 60 * 60 * 1000)

    return prisma.order.create({
      data: {
        userId,
        storeId: data.storeId,
        orderDate,
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

  async list(dateLabel?: string, statusFilter?: string) {
    const where: any = {}

    if (dateLabel) {
      where.createdAt = {
        gte: new Date(`${dateLabel}T00:00:00Z`),
        lte: new Date(`${dateLabel}T23:59:59Z`),
      }
    }

    if (statusFilter) {
      where.status = statusFilter
    }

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

  async getConsolidatedData(dateLabel?: string, startDate?: string, endDate?: string) {
    let where = {}
    
    if (dateLabel) {
      where = {
        orderDate: {
          gte: new Date(`${dateLabel}T00:00:00Z`),
          lte: new Date(`${dateLabel}T23:59:59Z`),
        }
      }
    } else if (startDate && endDate) {
      where = {
        orderDate: {
          gte: new Date(`${startDate}T00:00:00Z`),
          lte: new Date(`${endDate}T23:59:59Z`),
        }
      }
    } else if (startDate) {
      where = {
        orderDate: {
          gte: new Date(`${startDate}T00:00:00Z`),
        }
      }
    }

    const items = await prisma.orderItem.findMany({
      where: {
        order: where
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
        order: {
          include: {
            store: true,
          },
        },
      },
    })

    return items
  }

  async update(id: string, data: { 
    items?: { productId: string, quantity: number, currentStock: number }[], 
    status?: string 
  }) {
    return prisma.$transaction(async (tx) => {
      const updateData: any = {}

      if (data.status) {
        updateData.status = data.status
      }

      if (data.items) {
        await tx.orderItem.deleteMany({
          where: { orderId: id }
        })
        
        updateData.items = {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            currentStock: item.currentStock,
          })),
        }
      }

      return tx.order.update({
        where: { id },
        data: updateData,
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
      })
    })
  }
}
