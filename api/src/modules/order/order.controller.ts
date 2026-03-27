import { FastifyRequest, FastifyReply } from 'fastify'
import { OrderService } from './order.service.js'
import { createOrderSchema, updateOrderSchema } from './order.schema.js'

export class OrderController {
  constructor(private orderService: OrderService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = createOrderSchema.parse(request.body)
      const user = request.user as { sub: string, isAdmin: boolean }

      const order = await this.orderService.create(user.sub, user.isAdmin, data)
      return reply.status(201).send(order)
    } catch (err) {
      if (err instanceof Error && err.message.includes('Forbidden')) {
        return reply.status(403).send({ message: err.message })
      }
      throw err
    }
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const { date } = request.query as { date?: string }
    const orders = await this.orderService.list(date)
    return reply.send(orders)
  }

  async consolidated(request: FastifyRequest, reply: FastifyReply) {
    const { date } = request.query as { date?: string }
    const data = await this.orderService.getConsolidatedData(date)
    return reply.send(data)
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const data = updateOrderSchema.parse(request.body)
    const order = await this.orderService.update(id, data)
    return reply.send(order)
  }
}
