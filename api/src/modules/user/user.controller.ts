import { FastifyReply, FastifyRequest } from 'fastify'
import { UserService } from './user.service.js'
import { createUserSchema, updateUserSchema } from './user.schema.js'
import { z } from 'zod'

export class UserController {
  constructor(private userService: UserService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = createUserSchema.parse(request.body)
    const user = await this.userService.createUser(data)
    return reply.status(201).send(user)
  }

  async findById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
      const user = await this.userService.getUserById(id)
      return reply.status(200).send(user)
    } catch (err) {
      request.log.error({ err }, 'Erro ao buscar usuário por ID')
      if (err instanceof Error && err.message === 'User not found') {
        return reply.status(404).send({ message: err.message })
      }
      return reply.status(500).send({ message: 'Internal server error.' })
    }
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await this.userService.listUsers()
      return reply.status(200).send(users)
    } catch (err) {
      request.log.error({ err }, 'Erro ao listar usuários')
      return reply.status(500).send({ message: 'Internal server error.' })
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
    const data = updateUserSchema.parse(request.body)
    const user = await this.userService.updateUser(id, data)
    return reply.status(200).send(user)
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
    await this.userService.deleteUser(id)
    return reply.status(204).send()
  }
}
