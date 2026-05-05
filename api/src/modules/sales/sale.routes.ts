import { FastifyInstance } from 'fastify'
import { createSale, listSales, getSale } from './sale.service.js'
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.js'

export async function saleRoutes(app: FastifyInstance) {
  app.post('/', {
    preHandler: [adminMiddleware],
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
                quantity: { type: 'number', minimum: 1 }
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

      const sale = await createSale({
        supplierId,
        userId: user.sub,
        items
      })

      return reply.status(201).send(sale)
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
      const sales = await listSales()
      return sales
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
      const sale = await getSale(id)
      return sale
    } catch (error) {
      request.log.error(error)
      reply.status(404).send({
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })
}
