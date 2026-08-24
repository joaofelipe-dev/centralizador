import { prisma, type DbClient } from '../../lib/prisma.js'
import type { CreateSaleInput } from './sale.schema.js'

export class SaleRepository {
  async create(data: CreateSaleInput & { userId: string; status: string }, db: DbClient = prisma) {
    return db.purchaseOrder.create({
      data: {
        supplierId: data.supplierId,
        userId: data.userId,
        type: 'SALE',
        status: data.status,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
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

  async findMany(where: Record<string, unknown> = {}) {
    return prisma.purchaseOrder.findMany({
      where: { type: 'SALE', ...where },
      include: {
        supplier: true,
        user: { select: { id: true, name: true, username: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findFirst(where: Record<string, unknown>) {
    return prisma.purchaseOrder.findFirst({
      where: { type: 'SALE', ...where },
      include: {
        supplier: true,
        user: { select: { id: true, name: true, username: true } },
        items: { include: { product: true } },
      },
    })
  }
}
