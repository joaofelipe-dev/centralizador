import { FastifyInstance } from 'fastify'
import { UserController } from './user.controller.js'
import { UserService } from './user.service.js'
import { UserRepository } from './user.repository.js'
import { authMiddleware } from '../../middlewares/auth.js'

export async function userRoutes(app: FastifyInstance) {
  const userRepository = new UserRepository()
  const userService = new UserService(userRepository)
  const userController = new UserController(userService)

  // Public
  app.post('/', (request, reply) => userController.create(request, reply))

  // Protected
  app.register(async (protectedApp) => {
    protectedApp.addHook('preHandler', authMiddleware)
    
    protectedApp.get('/', (request, reply) => userController.list(request, reply))
    protectedApp.get('/:id', (request, reply) => userController.findById(request, reply))
    protectedApp.patch('/:id', (request, reply) => userController.update(request, reply))
    protectedApp.delete('/:id', (request, reply) => userController.delete(request, reply))
  })
}
