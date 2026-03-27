import { FastifyInstance } from 'fastify'
import { CategoryController } from './category.controller.js'
import { CategoryService } from './category.service.js'
import { CategoryRepository } from './category.repository.js'
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.js'

export async function categoryRoutes(app: FastifyInstance) {
  const repository = new CategoryRepository()
  const service = new CategoryService(repository)
  const controller = new CategoryController(service)

  // Public/Authenticated read
  app.get('/', { preHandler: [authMiddleware] }, controller.list.bind(controller))

  // Admin only mutations
  app.register(async (adminApp: FastifyInstance) => {
    adminApp.addHook('preHandler', adminMiddleware)
    adminApp.post('/', controller.create.bind(controller))
    adminApp.delete('/:id', controller.delete.bind(controller))
  })
}
