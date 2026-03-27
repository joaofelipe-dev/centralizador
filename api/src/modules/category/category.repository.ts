import { prisma } from '../../lib/prisma.js'
import { CreateCategoryInput, UpdateCategoryInput } from './category.schema.js'

export class CategoryRepository {
  async create(data: CreateCategoryInput) {
    return prisma.category.create({ data })
  }

  async findById(id: string) {
    return prisma.category.findUnique({ where: { id } })
  }

  async listAll() {
    return prisma.category.findMany({
      orderBy: { name: 'desc' },
      include: {
        products: true,
      },
    })
  }

  async update(id: string, data: UpdateCategoryInput) {
    return prisma.category.update({
      where: { id },
      data,
    })
  }

  async delete(id: string) {
    return prisma.category.delete({ where: { id } })
  }
}
