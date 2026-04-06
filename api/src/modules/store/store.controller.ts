import { FastifyReply, FastifyRequest } from 'fastify'
import { StoreService } from './store.service.js'
import { createStoreSchema, updateStoreSchema } from './store.schema.js'
import { z } from 'zod'
import { UserRole } from '../../middlewares/auth.js'

export class StoreController {
  constructor(private storeService: StoreService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = createStoreSchema.parse(request.body)
    const store = await this.storeService.createStore(data)
    return reply.status(201).send(store)
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user as { sub: string, role: UserRole }
    const stores = await this.storeService.listStores(user.sub, user.role)
    return reply.status(200).send(stores)
  }

  async findById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = z.object({ id: z.string() }).parse(request.params)
    const store = await this.storeService.getStoreById(id)
    return reply.status(200).send(store)
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = z.object({ id: z.string() }).parse(request.params)
    const data = updateStoreSchema.parse(request.body)
    const store = await this.storeService.updateStore(id, data)
    return reply.status(200).send(store)
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = z.object({ id: z.string() }).parse(request.params)
    await this.storeService.deleteStore(id)
    return reply.status(204).send()
  }
}
