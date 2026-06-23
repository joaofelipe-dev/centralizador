import { FastifyInstance } from 'fastify'
import { StockCountController } from './stock-count.controller.js'
import { StockCountService } from './stock-count.service.js'
import { StockCountRepository } from './stock-count.repository.js'
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.js'
import { stockCountQuerySchema, updateItemsBody, stockCountSchema, stockCountListSchema, uuidParam, errorResponse } from '../../lib/swagger-schemas.js'

export async function stockCountRoutes(app: FastifyInstance) {
  const stockCountRepository = new StockCountRepository()
  const stockCountService = new StockCountService(stockCountRepository)
  const stockCountController = new StockCountController(stockCountService)

  app.register(async (authApp) => {
    authApp.addHook('preHandler', authMiddleware)

    authApp.post('/', {
      schema: {
        response: {
          201: stockCountSchema,
          401: errorResponse[401],
          500: errorResponse[500]
        }
      }
    }, (request, reply) => stockCountController.create(request, reply))

    authApp.get('/', {
      schema: {
        querystring: stockCountQuerySchema,
        response: {
          200: stockCountListSchema,
          401: errorResponse[401],
          500: errorResponse[500]
        }
      }
    }, (request, reply) => stockCountController.list(request, reply))

    authApp.get('/:id', {
      schema: {
        params: uuidParam,
        response: {
          200: stockCountSchema,
          401: errorResponse[401],
          404: errorResponse[404],
          500: errorResponse[500]
        }
      }
    }, (request, reply) => stockCountController.getById(request, reply))

    authApp.patch('/:id/items', {
      schema: {
        params: uuidParam,
        body: updateItemsBody,
        response: {
          200: stockCountSchema,
          400: errorResponse[400],
          401: errorResponse[401],
          500: errorResponse[500]
        }
      }
    }, (request, reply) => stockCountController.updateItems(request, reply))
  })

  app.register(async (adminApp) => {
    adminApp.addHook('preHandler', adminMiddleware)

    adminApp.post('/:id/close', {
      schema: {
        params: uuidParam,
        response: {
          200: stockCountSchema,
          401: errorResponse[401],
          500: errorResponse[500]
        }
      }
    }, (request, reply) => stockCountController.close(request, reply))
  })
}
