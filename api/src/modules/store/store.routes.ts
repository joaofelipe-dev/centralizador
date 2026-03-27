import { FastifyInstance } from 'fastify'
import { StoreController } from './store.controller.js'
import { StoreService } from './store.service.js'
import { StoreRepository } from './store.repository.js'
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.js'

export async function storeRoutes(app: FastifyInstance) {
  const repository = new StoreRepository()
  const service = new StoreService(repository)
  const controller = new StoreController(service)

  // Authenticated read (Will be filtered in controller)
  app.get('/', { preHandler: [authMiddleware] }, controller.list.bind(controller))
  app.get('/:id', { preHandler: [authMiddleware] }, controller.findById.bind(controller))

  // Admin only mutations
  app.register(async (adminApp) => {
    adminApp.addHook('preHandler', adminMiddleware)
    adminApp.post('/', controller.create.bind(controller))
    adminApp.patch('/:id', controller.update.bind(controller))
    adminApp.delete('/:id', controller.delete.bind(controller))
  })
}
