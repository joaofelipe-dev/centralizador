import { FastifyInstance } from 'fastify'
import { ProductController } from './product.controller.js'
import { ProductService } from './product.service.js'
import { ProductRepository } from './product.repository.js'
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.js'
import { createProductBody, updateProductBody, productSchema, productListSchema, uuidParam, errorResponse } from '../../lib/swagger-schemas.js'

export async function productRoutes(app: FastifyInstance) {
  const productRepository = new ProductRepository()
  const productService = new ProductService(productRepository)
  const productController = new ProductController(productService)

  app.register(async (authApp) => {
    authApp.addHook('preHandler', authMiddleware)

    authApp.get('/', {
      schema: {
        response: {
          200: productListSchema,
          401: errorResponse[401],
          500: errorResponse[500]
        }
      }
    }, (request, reply) => productController.list(request, reply))
  })

  app.register(async (adminApp) => {
    adminApp.addHook('preHandler', adminMiddleware)
    
    adminApp.post('/', {
      schema: {
        body: createProductBody,
        response: {
          201: productSchema,
          400: errorResponse[400],
          401: errorResponse[401],
          500: errorResponse[500]
        }
      }
    }, (request, reply) => productController.create(request, reply))

    adminApp.patch('/:id', {
      schema: {
        params: uuidParam,
        body: updateProductBody,
        response: {
          200: productSchema,
          400: errorResponse[400],
          401: errorResponse[401],
          500: errorResponse[500]
        }
      }
    }, (request, reply) => productController.update(request, reply))

    adminApp.delete('/:id', {
      schema: {
        params: uuidParam,
        response: {
          204: { type: 'null' },
          401: errorResponse[401],
          500: errorResponse[500]
        }
      }
    }, (request, reply) => productController.delete(request, reply))
  })
}
