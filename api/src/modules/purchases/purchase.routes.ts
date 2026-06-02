import { FastifyInstance } from 'fastify'
import { PurchaseController } from './purchase.controller.js'
import { PurchaseService } from './purchase.service.js'
import { PurchaseRepository } from './purchase.repository.js'
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.js'

export async function purchaseRoutes(app: FastifyInstance) {
  const purchaseRepository = new PurchaseRepository()
  const purchaseService = new PurchaseService(purchaseRepository)
  const purchaseController = new PurchaseController(purchaseService)

  app.register(async (authApp) => {
    authApp.addHook('preHandler', authMiddleware)

    authApp.get('/', (request, reply) => purchaseController.list(request, reply))
    authApp.get('/:id', (request, reply) => purchaseController.getById(request, reply))
  })

  app.register(async (adminApp) => {
    adminApp.addHook('preHandler', adminMiddleware)

    adminApp.post('/', (request, reply) => purchaseController.create(request, reply))
    adminApp.patch('/:id/receive', (request, reply) => purchaseController.receive(request, reply))
  })
}
