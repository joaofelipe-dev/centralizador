import { FastifyReply, FastifyRequest } from 'fastify'
import { MovementService } from './movement.service.js'
import { movementQuerySchema, createAdjustmentSchema } from './movement.schema.js'

export class MovementController {
  constructor(private movementService: MovementService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const filters = movementQuerySchema.parse(request.query)
    const { limit = 50, offset = 0 } = filters
    const result = await this.movementService.listMovements({ ...filters, limit, offset })
    return reply.send(result)
  }

  async createAdjustment(request: FastifyRequest, reply: FastifyReply) {
    const data = createAdjustmentSchema.parse(request.body)
    const user = request.user as { sub: string }
    const movement = await this.movementService.createAdjustment({ ...data, userId: user.sub })
    return reply.status(201).send(movement)
  }
}
