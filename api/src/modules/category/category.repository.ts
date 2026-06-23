import { prisma } from '../../lib/prisma.js'
import { CreateCategoryInput } from './category.schema.js'

export class CategoryRepository {
  async create(data: CreateCategoryInput) {
    return prisma.category.create({ data })
  }

  async listAll() {
    return prisma.category.findMany({
      orderBy: { name: 'desc' },
      include: {
        products: true,
      },
    })
  }

  async delete(id: string) {
    return prisma.category.delete({ where: { id } })
  }
}
