import { prisma } from '../../lib/prisma.js'
import { CreateProductInput, UpdateProductInput } from './product.schema'

export class ProductRepository {
  async create(data: CreateProductInput & { userId: string }) {
    return prisma.product.create({ data })
  }

  async findById(id: string) {
    return prisma.product.findUnique({ where: { id } })
  }

  async listByUser(userId: string) {
    return prisma.product.findMany({ where: { userId } })
  }

  async update(id: string, data: UpdateProductInput) {
    return prisma.product.update({
      where: { id },
      data,
    })
  }

  async delete(id: string) {
    return prisma.product.delete({ where: { id } })
  }
}
