import { FastifyInstance } from 'fastify'
import { OrderController } from './order.controller.js'
import { OrderService } from './order.service.js'
import { OrderRepository } from './order.repository.js'
import { UserRepository } from '../user/user.repository.js'
import { ProductRepository } from '../product/product.repository.js'
import { authMiddleware, supervisorMiddleware } from '../../middlewares/auth.js'
import { createOrderBody, updateOrderBody, updateOrderStatusBody, listOrdersQuery, orderSchema, orderListSchema, orderDashboardSchema, orderConsolidatedSchema, uuidParam, errorResponse } from '../../lib/swagger-schemas.js'

export async function orderRoutes(app: FastifyInstance) {
  const repository = new OrderRepository()
  const userRepository = new UserRepository()
  const productRepository = new ProductRepository()
  const service = new OrderService(repository, userRepository, productRepository)
  const controller = new OrderController(service)

  app.post('/', {
    preHandler: [authMiddleware],
    schema: {
      body: createOrderBody,
      response: {
        201: orderSchema,
        400: errorResponse[400],
        403: errorResponse[403],
        500: errorResponse[500]
      }
    }
  }, controller.create.bind(controller))

  app.get('/', {
    preHandler: [authMiddleware],
    schema: {
      querystring: listOrdersQuery,
      response: {
        200: orderListSchema,
        403: errorResponse[403],
        500: errorResponse[500]
      }
    }
  }, controller.list.bind(controller))

  app.get('/consolidated', {
    preHandler: [supervisorMiddleware],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          date: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' }
        }
      },
      response: {
        200: orderConsolidatedSchema,
        500: errorResponse[500]
      }
    }
  }, controller.consolidated.bind(controller))

  app.get('/dashboard', {
    preHandler: [authMiddleware],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          storeId: { type: 'string' },
          userId: { type: 'string' },
          status: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          sort: { type: 'string' },
          order: { type: 'string', enum: ['asc', 'desc'] }
        }
      },
      response: {
        200: orderDashboardSchema,
        500: errorResponse[500]
      }
    }
  }, controller.dashboard.bind(controller))

  app.put('/:id', {
    preHandler: [supervisorMiddleware],
    schema: {
      params: uuidParam,
      body: updateOrderBody,
      response: {
        200: orderSchema,
        400: errorResponse[400],
        403: errorResponse[403],
        500: errorResponse[500]
      }
    }
  }, controller.update.bind(controller))

  app.patch('/:id/status', {
    preHandler: [supervisorMiddleware],
    schema: {
      params: uuidParam,
      body: updateOrderStatusBody,
      response: {
        200: orderSchema,
        400: errorResponse[400],
        403: errorResponse[403],
        500: errorResponse[500]
      }
    }
  }, controller.updateStatus.bind(controller))
}
