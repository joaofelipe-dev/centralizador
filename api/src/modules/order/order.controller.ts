import { FastifyRequest, FastifyReply } from 'fastify'
import { OrderService } from './order.service.js'
import { UserRole } from '../../middlewares/auth.js'
import { 
  createOrderSchema, 
  updateOrderSchema, 
  updateOrderStatusSchema, 
  listOrdersSchema 
} from './order.schema.js'

export class OrderController {
  constructor(private service: OrderService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as { sub: string, role: UserRole }
      const data = createOrderSchema.parse(request.body)
      const order = await this.service.create(
        user.sub,
        user.role,
        data
      )
      return reply.status(201).send(order)
    } catch (error: any) {
      if (error.message?.includes('Forbidden')) {
        return reply.status(403).send({ message: error.message })
      }
      throw error
    }
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as { sub: string, role: UserRole }
      const query = listOrdersSchema.parse(request.query)
      const orders = await this.service.list(
        query.date,
        query.status,
        query.limit,
        query.offset,
        query.storeId,
        query.startDate,
        query.endDate,
        user.sub,
        user.role
      )
      return reply.send(orders)
    } catch (error: any) {
      if (error.message?.includes('Forbidden')) {
        return reply.status(403).send({ message: error.message })
      }
      throw error
    }
  }

  async dashboard(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as { sub: string, role: UserRole }
      const query = request.query as any
      const storeId = query.storeId as string | undefined
      const userId = query.userId as string | undefined
      const status = query.status as string | undefined
      const startDate = query.startDate as string | undefined
      const endDate = query.endDate as string | undefined
      const sort = query.sort as string | undefined
      const order = query.order as 'asc' | 'desc' | undefined

      const data = await this.service.getDashboardData({
        storeId,
        userId,
        status,
        startDate,
        endDate,
        sort,
        order,
        requestingUserId: user.sub,
        requestingUserRole: user.role
      })
      return reply.send(data)
    } catch (error: any) {
      throw error
    }
  }

  async consolidated(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as any
      const date = query.date as string | undefined
      const startDate = query.startDate as string | undefined
      const endDate = query.endDate as string | undefined
      const data = await this.service.getConsolidatedData(date, startDate, endDate)
      return reply.send(data)
    } catch (error: any) {
      throw error
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const data = updateOrderSchema.parse(request.body)
      const user = request.user as { sub: string, role: UserRole }

      const order = await this.service.update(id, data, user.role)
      return reply.send(order)
    } catch (error: any) {
      if (error.message?.includes('Forbidden')) {
        return reply.status(403).send({ message: error.message })
      }
      throw error
    }
  }

  async updateStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const data = updateOrderStatusSchema.parse(request.body)
      const user = request.user as { sub: string, role: UserRole }

      const order = await this.service.updateStatus(id, data.status, user.role)
      return reply.send(order)
    } catch (error: any) {
      if (error.message?.includes('Forbidden')) {
        return reply.status(403).send({ message: error.message })
      }
      if (error.message === 'Order not found') {
        return reply.status(404).send({ message: error.message })
      }
      if (error.message === 'Order already approved') {
        return reply.status(409).send({ message: error.message })
      }
      throw error
    }
  }
}

