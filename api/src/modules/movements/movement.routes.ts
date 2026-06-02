import { FastifyInstance } from 'fastify'
import { MovementController } from './movement.controller.js'
import { MovementService } from './movement.service.js'
import { MovementRepository } from './movement.repository.js'
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.js'

export async function movementRoutes(app: FastifyInstance) {
  const movementRepository = new MovementRepository()
  const movementService = new MovementService(movementRepository)
  const movementController = new MovementController(movementService)

  app.register(async (authApp) => {
    authApp.addHook('preHandler', authMiddleware)
    authApp.get('/', (request, reply) => movementController.list(request, reply))
  })

  app.register(async (adminApp) => {
    adminApp.addHook('preHandler', adminMiddleware)
    adminApp.post('/adjust', (request, reply) => movementController.createAdjustment(request, reply))
  })
}
