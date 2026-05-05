import { FastifyInstance } from 'fastify'
import { MovementService } from './movement.service.js'
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.js'

export async function movementRoutes(app: FastifyInstance) {
  const movementService = new MovementService()

  app.get('/', {
    preHandler: [authMiddleware]
  }, async (request, reply) => {
    try {
      const {
        type,
        productId,
        startDate,
        endDate,
        limit,
        offset
      } = request.query as any

      const result = await movementService.listMovements({
        type,
        productId,
        startDate,
        endDate,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined
      })

      return result
    } catch (error) {
      request.log.error(error)
      reply.status(500).send({
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  app.post('/adjust', {
    preHandler: [adminMiddleware],
    schema: {
      body: {
        type: 'object',
        required: ['productId', 'quantity', 'reason'],
        properties: {
          productId: { type: 'string' },
          quantity: { type: 'number' },
          reason: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { productId, quantity, reason } = request.body as any
      const user = request.user as { sub: string }

      const movement = await movementService.createAdjustment({
        productId,
        quantity,
        reason,
        userId: user.sub
      })

      return reply.status(201).send(movement)
    } catch (error) {
      request.log.error(error)
      reply.status(400).send({
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })
}
