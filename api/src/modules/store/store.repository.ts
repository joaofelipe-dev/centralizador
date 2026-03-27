import { prisma } from '../../lib/prisma.js'
import { CreateStoreInput, UpdateStoreInput } from './store.schema.js'

export class StoreRepository {
  async create(data: CreateStoreInput) {
    return prisma.store.create({ data })
  }

  async findById(id: string) {
    return prisma.store.findUnique({ where: { id } })
  }

  async listAll() {
    return prisma.store.findMany({
      orderBy: { name: 'asc' },
    })
  }

  async findByUserId(userId: string) {
    return prisma.store.findMany({
      where: {
        users: {
          some: {
            id: userId,
          },
        },
      },
      orderBy: { name: 'asc' },
    })
  }

  async update(id: string, data: UpdateStoreInput) {
    return prisma.store.update({
      where: { id },
      data,
    })
  }

  async delete(id: string) {
    return prisma.store.delete({ where: { id } })
  }
}
