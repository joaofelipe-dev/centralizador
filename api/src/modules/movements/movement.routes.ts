import { FastifyInstance } from 'fastify'
import { MovementController } from './movement.controller.js'
import { MovementService } from './movement.service.js'
import { MovementRepository } from './movement.repository.js'
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.js'
import { movementQuerySchema, createAdjustmentBody, movementSchema, movementListSchema, errorResponse } from '../../lib/swagger-schemas.js'

export async function movementRoutes(app: FastifyInstance) {
  const movementRepository = new MovementRepository()
  const movementService = new MovementService(movementRepository)
  const movementController = new MovementController(movementService)

  app.register(async (authApp) => {
    authApp.addHook('preHandler', authMiddleware)

    authApp.get('/', {
      schema: {
        querystring: movementQuerySchema,
        response: {
          200: movementListSchema,
          401: errorResponse[401],
          500: errorResponse[500]
        }
      }
    }, (request, reply) => movementController.list(request, reply))
  })

  app.register(async (adminApp) => {
    adminApp.addHook('preHandler', adminMiddleware)

    adminApp.post('/adjust', {
      schema: {
        body: createAdjustmentBody,
        response: {
          201: movementSchema,
          400: errorResponse[400],
          401: errorResponse[401],
          500: errorResponse[500]
        }
      }
    }, (request, reply) => movementController.createAdjustment(request, reply))
  })
}
