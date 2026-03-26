import { prisma } from '../../lib/prisma.js'
import { CreateUserInput, UpdateUserInput } from './user.schema'

export class UserRepository {
  async create(data: CreateUserInput) {
    const storesJson = JSON.stringify(data.stores)
    return prisma.user.create({
      data: {
        ...data,
        stores: storesJson,
      },
    })
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        isAdmin: true,
        stores: true,
        createdAt: true,
      },
    })
    if (user) {
      return {
        ...user,
        stores: JSON.parse(user.stores || '[]'),
      }
    }
    return null
  }

  async findByUsername(username: string) {
    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    })
    if (user) {
      return {
        ...user,
        stores: JSON.parse(user.stores || '[]'),
      }
    }
    return null
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  }

  async list() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        isAdmin: true,
        stores: true,
        createdAt: true,
      },
    })
    return users.map((u) => ({
      ...u,
      stores: JSON.parse(u.stores || '[]'),
    }))
  }

  async update(id: string, data: UpdateUserInput) {
    const updateData: any = { ...data }
    if (data.stores) {
      updateData.stores = JSON.stringify(data.stores)
    }
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        isAdmin: true,
        stores: true,
        createdAt: true,
      },
    })
    return {
      ...user,
      stores: JSON.parse(user.stores || '[]'),
    }
  }

  async delete(id: string) {
    return prisma.user.delete({ where: { id } })
  }
}
