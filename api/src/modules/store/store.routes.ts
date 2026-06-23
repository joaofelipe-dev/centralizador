import { FastifyInstance } from 'fastify'
import { StoreController } from './store.controller.js'
import { StoreService } from './store.service.js'
import { StoreRepository } from './store.repository.js'
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.js'
import { createStoreBody, updateStoreBody, storeSchema, storeListSchema, errorResponse } from '../../lib/swagger-schemas.js'

export async function storeRoutes(app: FastifyInstance) {
  const repository = new StoreRepository()
  const service = new StoreService(repository)
  const controller = new StoreController(service)

  app.get('/', {
    preHandler: [authMiddleware],
    schema: {
      response: {
        200: storeListSchema,
        401: errorResponse[401],
        500: errorResponse[500]
      }
    }
  }, controller.list.bind(controller))

  app.get('/:id', {
    preHandler: [authMiddleware],
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        200: storeSchema,
        401: errorResponse[401],
        404: errorResponse[404],
        500: errorResponse[500]
      }
    }
  }, controller.findById.bind(controller))

  app.register(async (adminApp) => {
    adminApp.addHook('preHandler', adminMiddleware)

    adminApp.post('/', {
      schema: {
        body: createStoreBody,
        response: {
          201: storeSchema,
          400: errorResponse[400],
          500: errorResponse[500]
        }
      }
    }, controller.create.bind(controller))

    adminApp.patch('/:id', {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          },
          required: ['id']
        },
        body: updateStoreBody,
        response: {
          200: storeSchema,
          400: errorResponse[400],
          500: errorResponse[500]
        }
      }
    }, controller.update.bind(controller))

    adminApp.delete('/:id', {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          },
          required: ['id']
        },
        response: {
          204: { type: 'null' },
          500: errorResponse[500]
        }
      }
    }, controller.delete.bind(controller))
  })
}
