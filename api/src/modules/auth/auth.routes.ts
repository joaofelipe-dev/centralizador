import { FastifyInstance } from 'fastify'
import { AuthController } from './auth.controller.js'
import { AuthService } from './auth.service.js'
import { UserRepository } from '../user/user.repository.js'
import { UserService } from '../user/user.service.js'
import { authMiddleware } from '../../middlewares/auth.js'
import { loginBody, authResponse, userSchema, errorResponse } from '../../lib/swagger-schemas.js'

export async function authRoutes(app: FastifyInstance) {
  const userRepository = new UserRepository()
  const userService = new UserService(userRepository)
  const authService = new AuthService(userRepository)
  const authController = new AuthController(authService, userService)

  // Não existe cadastro autoatendido: contas são criadas por ADMIN em POST /users.
  app.post('/login', {
    schema: {
      security: [],
      body: loginBody,
      response: {
        200: authResponse,
        400: errorResponse[400],
        401: errorResponse[401],
        500: errorResponse[500]
      }
    }
  }, (request, reply) => authController.login(request, reply))

  // Sem autenticação de propósito: limpar o próprio cookie precisa funcionar
  // mesmo com o token já expirado.
  app.post('/logout', {
    schema: {
      security: [],
      response: {
        204: { type: 'null' }
      }
    }
  }, (request, reply) => authController.logout(request, reply))

  app.register(async (protectedApp) => {
    protectedApp.addHook('preHandler', authMiddleware)

    protectedApp.get('/me', {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              user: userSchema
            }
          },
          401: errorResponse[401],
          500: errorResponse[500]
        }
      }
    }, (request, reply) => authController.me(request, reply))
  })
}
