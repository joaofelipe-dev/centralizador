import { FastifyInstance } from 'fastify'
import { UserController } from './user.controller.js'
import { UserService } from './user.service.js'
import { UserRepository } from './user.repository.js'
import { adminMiddleware } from '../../middlewares/auth.js'
import { createUserBody, updateUserBody, userSchema, userListSchema, uuidParam, errorResponse } from '../../lib/swagger-schemas.js'

export async function userRoutes(app: FastifyInstance) {
  const userRepository = new UserRepository()
  const userService = new UserService(userRepository)
  const userController = new UserController(userService)

  app.register(async (protectedApp) => {
    protectedApp.addHook('preHandler', adminMiddleware)
    
    protectedApp.post('/', {
      schema: {
        body: createUserBody,
        response: {
          201: userSchema,
          400: errorResponse[400],
          500: errorResponse[500]
        }
      }
    }, (request, reply) => userController.create(request, reply))

    protectedApp.get('/', {
      schema: {
        response: {
          200: userListSchema,
          500: errorResponse[500]
        }
      }
    }, (request, reply) => userController.list(request, reply))

    protectedApp.get('/:id', {
      schema: {
        params: uuidParam,
        response: {
          200: userSchema,
          404: errorResponse[404],
          500: errorResponse[500]
        }
      }
    }, (request, reply) => userController.findById(request, reply))

    protectedApp.patch('/:id', {
      schema: {
        params: uuidParam,
        body: updateUserBody,
        response: {
          200: userSchema,
          500: errorResponse[500]
        }
      }
    }, (request, reply) => userController.update(request, reply))

    protectedApp.delete('/:id', {
      schema: {
        params: uuidParam,
        response: {
          204: { type: 'null' },
          500: errorResponse[500]
        }
      }
    }, (request, reply) => userController.delete(request, reply))
  })
}
