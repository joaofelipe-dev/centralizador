import { FastifyRequest, FastifyReply } from 'fastify'
import { OrderService } from './order.service.js'
import { createOrderSchema, updateOrderSchema, updateOrderStatusSchema } from './order.schema.js'
import { UserRole } from '../../middlewares/auth.js'

export class OrderController {
  constructor(private orderService: OrderService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = createOrderSchema.parse(request.body)
      const user = request.user as { sub: string, role: UserRole }

      const order = await this.orderService.create(user.sub, user.role, data)
      return reply.status(201).send(order)
    } catch (err) {
      if (err instanceof Error && err.message.includes('Forbidden')) {
        return reply.status(403).send({ message: err.message })
      }
      throw err
    }
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const { date, status } = request.query as { date?: string, status?: string }
    const orders = await this.orderService.list(date, status)
    return reply.send(orders)
  }

  async consolidated(request: FastifyRequest, reply: FastifyReply) {
    const { date, startDate, endDate } = request.query as { date?: string, startDate?: string, endDate?: string }
    const data = await this.orderService.getConsolidatedData(date, startDate, endDate)
    return reply.send(data)
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const data = updateOrderSchema.parse(request.body)
    const user = request.user as { sub: string, role: UserRole }
    
    const order = await this.orderService.update(id, data, user.role)
    return reply.send(order)
  }

  async updateStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const data = updateOrderStatusSchema.parse(request.body)
    const user = request.user as { sub: string, role: UserRole }
    
    const order = await this.orderService.updateStatus(id, data.status, user.role)
    return reply.send(order)
  }
}
