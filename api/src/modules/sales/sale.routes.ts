import { FastifyInstance } from 'fastify'
import { SaleController } from './sale.controller.js'
import { SaleService } from './sale.service.js'
import { SaleRepository } from './sale.repository.js'
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.js'
import { createSaleBody, saleSchema, saleListSchema, uuidParam, errorResponse } from '../../lib/swagger-schemas.js'

export async function saleRoutes(app: FastifyInstance) {
  const saleRepository = new SaleRepository()
  const saleService = new SaleService(saleRepository)
  const saleController = new SaleController(saleService)

  app.register(async (authApp) => {
    authApp.addHook('preHandler', authMiddleware)

    authApp.get('/', {
      schema: {
        response: {
          200: saleListSchema,
          401: errorResponse[401],
          500: errorResponse[500]
        }
      }
    }, (request, reply) => saleController.list(request, reply))

    authApp.get('/:id', {
      schema: {
        params: uuidParam,
        response: {
          200: saleSchema,
          401: errorResponse[401],
          404: errorResponse[404],
          500: errorResponse[500]
        }
      }
    }, (request, reply) => saleController.getById(request, reply))
  })

  app.register(async (adminApp) => {
    adminApp.addHook('preHandler', adminMiddleware)

    adminApp.post('/', {
      schema: {
        body: createSaleBody,
        response: {
          201: saleSchema,
          400: errorResponse[400],
          401: errorResponse[401],
          500: errorResponse[500]
        }
      }
    }, (request, reply) => saleController.create(request, reply))
  })
}
