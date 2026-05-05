import { FastifyInstance } from 'fastify'
import { StockCountService } from './stock-count.service.js'
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.js'

export async function stockCountRoutes(app: FastifyInstance) {
  const stockCountService = new StockCountService()

  app.post('/', {
    preHandler: [authMiddleware],
    schema: {
      body: {
        type: 'object',
        properties: {}
      }
    }
  }, async (request, reply) => {
    try {
      const user = request.user as { sub: string }

      const stockCount = await stockCountService.createStockCount(user.sub)

      return reply.status(201).send(stockCount)
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
        startDate,
        endDate,
        limit,
        offset
      } = request.query as any

      const result = await stockCountService.listStockCounts({
        status,
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
      const stockCount = await stockCountService.getStockCountById(id)
      return stockCount
    } catch (error) {
      request.log.error(error)
      reply.status(404).send({
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  app.patch('/:id/items', {
    preHandler: [authMiddleware],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['items'],
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              required: ['productId', 'physicalQty'],
              properties: {
                productId: { type: 'string' },
                physicalQty: { type: 'number', minimum: 0 }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const { items } = request.body as { items: { productId: string; physicalQty: number }[] }

      const results = []
      for (const item of items) {
        const updatedItem = await stockCountService.updateCountItem(
          id,
          item.productId,
          item.physicalQty
        )
        results.push(updatedItem)
      }

      return results
    } catch (error) {
      request.log.error(error)
      reply.status(400).send({
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  app.post('/:id/close', {
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

      const stockCount = await stockCountService.closeStockCount(id, user.sub)
      return stockCount
    } catch (error) {
      request.log.error(error)
      reply.status(400).send({
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })
}
