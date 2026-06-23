import { FastifyInstance } from 'fastify'
import { PurchaseController } from './purchase.controller.js'
import { PurchaseService } from './purchase.service.js'
import { PurchaseRepository } from './purchase.repository.js'
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.js'
import { createPurchaseBody, purchaseQuerySchema, purchaseOrderSchema, purchaseListSchema, uuidParam, errorResponse } from '../../lib/swagger-schemas.js'

export async function purchaseRoutes(app: FastifyInstance) {
  const purchaseRepository = new PurchaseRepository()
  const purchaseService = new PurchaseService(purchaseRepository)
  const purchaseController = new PurchaseController(purchaseService)

  app.register(async (authApp) => {
    authApp.addHook('preHandler', authMiddleware)

    authApp.get('/', {
      schema: {
        querystring: purchaseQuerySchema,
        response: {
          200: purchaseListSchema,
          401: errorResponse[401],
          500: errorResponse[500]
        }
      }
    }, (request, reply) => purchaseController.list(request, reply))

    authApp.get('/:id', {
      schema: {
        params: uuidParam,
        response: {
          200: purchaseOrderSchema,
          401: errorResponse[401],
          404: errorResponse[404],
          500: errorResponse[500]
        }
      }
    }, (request, reply) => purchaseController.getById(request, reply))
  })

  app.register(async (adminApp) => {
    adminApp.addHook('preHandler', adminMiddleware)

    adminApp.post('/', {
      schema: {
        body: createPurchaseBody,
        response: {
          201: purchaseOrderSchema,
          400: errorResponse[400],
          401: errorResponse[401],
          500: errorResponse[500]
        }
      }
    }, (request, reply) => purchaseController.create(request, reply))

    adminApp.patch('/:id/receive', {
      schema: {
        params: uuidParam,
        response: {
          200: purchaseOrderSchema,
          400: errorResponse[400],
          401: errorResponse[401],
          404: errorResponse[404],
          500: errorResponse[500]
        }
      }
    }, (request, reply) => purchaseController.receive(request, reply))
  })
}
