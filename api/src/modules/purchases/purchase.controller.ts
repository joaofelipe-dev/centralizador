import { FastifyReply, FastifyRequest } from 'fastify'
import { PurchaseService } from './purchase.service.js'
import { createPurchaseSchema, purchaseQuerySchema, purchaseParamsSchema } from './purchase.schema.js'
import { z } from 'zod'

export class PurchaseController {
  constructor(private purchaseService: PurchaseService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = createPurchaseSchema.parse(request.body)
    const user = request.user as { sub: string }
    const purchase = await this.purchaseService.createPurchase({ ...data, userId: user.sub })
    return reply.status(201).send(purchase)
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const filters = purchaseQuerySchema.parse(request.query)
    const { limit = 50, offset = 0 } = filters
    const result = await this.purchaseService.listPurchases({ ...filters, limit, offset })
    return reply.send(result)
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = purchaseParamsSchema.parse(request.params)
    const purchase = await this.purchaseService.getPurchaseById(id)
    return reply.send(purchase)
  }

  async receive(request: FastifyRequest, reply: FastifyReply) {
    const { id } = purchaseParamsSchema.parse(request.params)
    const user = request.user as { sub: string }
    const purchase = await this.purchaseService.receivePurchase(id, user.sub)
    return reply.send(purchase)
  }
}
