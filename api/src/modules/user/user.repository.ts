import { prisma } from '../../lib/prisma.js'
import { CreateUserInput, UpdateUserInput } from './user.schema'

export class UserRepository {
  async create(data: CreateUserInput) {
    const { storeIds, ...userData } = data
    return prisma.user.create({
      data: {
        ...userData,
        stores: {
          connect: storeIds.map((id: string) => ({ id })),
        },
      },
      include: { stores: true },
    })
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { stores: true },
    })
  }

  async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      include: { stores: true },
    })
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ 
      where: { email },
      include: { stores: true },
    })
  }

  async list() {
    return prisma.user.findMany({
      include: { stores: true },
    })
  }

  async update(id: string, data: UpdateUserInput) {
    const { storeIds, ...updateData } = data
    
    return prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        ...(storeIds && {
          stores: {
            set: storeIds.map((sid: string) => ({ id: sid })),
          },
        }),
      },
      include: { stores: true },
    })
  }

  async delete(id: string) {
    return prisma.user.delete({ where: { id } })
  }
}
