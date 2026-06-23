import { FastifyInstance } from 'fastify'
import { CategoryController } from './category.controller.js'
import { CategoryService } from './category.service.js'
import { CategoryRepository } from './category.repository.js'
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.js'
import { createCategoryBody, categorySchema, categoryListSchema, uuidParam, errorResponse } from '../../lib/swagger-schemas.js'

export async function categoryRoutes(app: FastifyInstance) {
  const repository = new CategoryRepository()
  const service = new CategoryService(repository)
  const controller = new CategoryController(service)

  app.get('/', {
    preHandler: [authMiddleware],
    schema: {
      response: {
        200: categoryListSchema,
        401: errorResponse[401],
        500: errorResponse[500]
      }
    }
  }, controller.list.bind(controller))

  app.register(async (adminApp: FastifyInstance) => {
    adminApp.addHook('preHandler', adminMiddleware)

    adminApp.post('/', {
      schema: {
        body: createCategoryBody,
        response: {
          201: categorySchema,
          400: errorResponse[400],
          500: errorResponse[500]
        }
      }
    }, controller.create.bind(controller))

    adminApp.delete('/:id', {
      schema: {
        params: uuidParam,
        response: {
          204: { type: 'null' },
          500: errorResponse[500]
        }
      }
    }, controller.delete.bind(controller))
  })
}
