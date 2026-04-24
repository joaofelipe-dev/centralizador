import { FastifyInstance } from 'fastify'
import { OrderController } from './order.controller.js'
import { OrderService } from './order.service.js'
import { OrderRepository } from './order.repository.js'
import { UserRepository } from '../user/user.repository.js'
import { ProductRepository } from '../product/product.repository.js'
import { authMiddleware, supervisorMiddleware, supervisorOnlyMiddleware } from '../../middlewares/auth.js'

export async function orderRoutes(app: FastifyInstance) {
  const repository = new OrderRepository()
  const userRepository = new UserRepository()
  const productRepository = new ProductRepository()
  const service = new OrderService(repository, userRepository, productRepository)
  const controller = new OrderController(service)

  app.post('/', { preHandler: [authMiddleware] }, controller.create.bind(controller))
  app.get('/', { preHandler: [authMiddleware] }, controller.list.bind(controller))
  app.get('/consolidated', { preHandler: [supervisorMiddleware] }, controller.consolidated.bind(controller))
  app.get('/dashboard', { preHandler: [authMiddleware] }, controller.dashboard.bind(controller))
  app.put('/:id', { preHandler: [supervisorMiddleware] }, controller.update.bind(controller))
  app.patch('/:id/status', { preHandler: [supervisorMiddleware] }, controller.updateStatus.bind(controller))
}
