import { prisma } from '../../lib/prisma.js'
import { CreateProductInput, UpdateProductInput } from './product.schema'

export class ProductRepository {
  async create(data: CreateProductInput & { userId: string }) {
    return prisma.product.create({ data })
  }

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: { category: true }
    })
  }

  async listByUser(userId: string) {
    return prisma.product.findMany({
      include: { category: true },
      orderBy: { name: 'asc' }
    })
  }

  async listAll() {
    return prisma.product.findMany({
      include: { category: true },
      orderBy: { name: 'asc' }
    })
  }

  async update(id: string, data: UpdateProductInput) {
    return prisma.product.update({
      where: { id },
      data,
      include: { category: true }
    })
  }

  async delete(id: string) {
    return prisma.product.delete({ where: { id } })
  }
}
