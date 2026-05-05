import { FastifyInstance } from 'fastify'
import { PurchaseService } from './purchase.service.js'
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.js'

export async function purchaseRoutes(app: FastifyInstance) {
  const purchaseService = new PurchaseService()

  app.post('/', {
    preHandler: [authMiddleware],
    schema: {
      body: {
        type: 'object',
        required: ['supplierId', 'items'],
        properties: {
          supplierId: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              required: ['productId', 'quantity'],
              properties: {
                productId: { type: 'string' },
                quantity: { type: 'number', minimum: 1 },
                unitCost: { type: 'number', minimum: 0 }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { supplierId, items } = request.body as any
      const user = request.user as { sub: string }

      const purchase = await purchaseService.createPurchase({
        supplierId,
        userId: user.sub,
        items
      })

      return reply.status(201).send(purchase)
    } catch (error) {
      request.log.error(error)
      reply.status(400).send({
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  app.get('/', {
    preHandler: [authMiddleware]
  }, async (request, reply) => {
    try {
      const {
        status,
        supplierId,
        startDate,
        endDate,
        limit,
        offset
      } = request.query as any

      const result = await purchaseService.listPurchases({
        status,
        supplierId,
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

  app.get('/:id', {
    preHandler: [authMiddleware]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const purchase = await purchaseService.getPurchaseById(id)
      return purchase
    } catch (error) {
      request.log.error(error)
      reply.status(404).send({
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  app.patch('/:id/receive', {
    preHandler: [adminMiddleware],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const user = request.user as { sub: string }

      const purchase = await purchaseService.receivePurchase(id, user.sub)
      return purchase
    } catch (error) {
      request.log.error(error)
      reply.status(400).send({
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })
}
