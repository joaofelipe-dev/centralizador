import { prisma } from '../../lib/prisma.js'
import { MovementRepository } from './movement.repository.js'
import type { CreateAdjustmentInput } from './movement.schema.js'

export class MovementService {
  private repo: MovementRepository

  constructor(repo?: MovementRepository) {
    this.repo = repo || new MovementRepository()
  }

  async listMovements(filters: {
    type?: string
    productId?: string
    startDate?: string
    endDate?: string
    limit: number
    offset: number
  }) {
    const [movements, total] = await this.repo.findMany(filters)
    return { total, limit: filters.limit, offset: filters.offset, data: movements }
  }

  async createAdjustment(data: CreateAdjustmentInput & { userId: string }) {
    const product = await prisma.product.findUnique({ where: { id: data.productId } })
    if (!product) throw new Error('Product not found')

    return await prisma.$transaction(async (tx) => {
      const movement = await this.repo.create(data)

      await tx.product.update({
        where: { id: data.productId },
        data: { stockCD: { increment: data.quantity } },
      })

      return movement
    })
  }
}
