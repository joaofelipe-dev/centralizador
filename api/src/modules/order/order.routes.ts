import { FastifyInstance } from 'fastify'
import { OrderController } from './order.controller.js'
import { OrderService } from './order.service.js'
import { OrderRepository } from './order.repository.js'
import { UserRepository } from '../user/user.repository.js'
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.js'

export async function orderRoutes(app: FastifyInstance) {
  const repository = new OrderRepository()
  const userRepository = new UserRepository()
  const service = new OrderService(repository, userRepository)
  const controller = new OrderController(service)

  app.post('/', { preHandler: [authMiddleware] }, controller.create.bind(controller))
  app.get('/', { preHandler: [authMiddleware] }, controller.list.bind(controller))
  app.get('/consolidated', { preHandler: [adminMiddleware] }, controller.consolidated.bind(controller))
  app.put('/:id', { preHandler: [adminMiddleware] }, controller.update.bind(controller))
}
