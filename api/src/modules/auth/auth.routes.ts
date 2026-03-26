import { FastifyInstance } from 'fastify'
import { AuthController } from './auth.controller.js'
import { AuthService } from './auth.service.js'
import { UserRepository } from '../user/user.repository.js'
import { UserService } from '../user/user.service.js'
import { authMiddleware } from '../../middlewares/auth.js'

export async function authRoutes(app: FastifyInstance) {
  const userRepository = new UserRepository()
  const userService = new UserService(userRepository)
  const authService = new AuthService(userRepository)
  const authController = new AuthController(authService, userService)

  app.post('/register', (request, reply) => authController.register(request, reply))
  app.post('/login', (request, reply) => authController.login(request, reply))

  app.register(async (protectedApp) => {
    protectedApp.addHook('preHandler', authMiddleware)

    protectedApp.get('/me', (request, reply) => authController.me(request, reply))
  })
}
