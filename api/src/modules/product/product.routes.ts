import { FastifyInstance } from 'fastify'
import { ProductController } from './product.controller.js'
import { ProductService } from './product.service.js'
import { ProductRepository } from './product.repository.js'
import { authMiddleware } from '../../middlewares/auth.js'

export async function productRoutes(app: FastifyInstance) {
  const productRepository = new ProductRepository()
  const productService = new ProductService(productRepository)
  const productController = new ProductController(productService)

  app.addHook('preHandler', authMiddleware)

  app.post('/', (request, reply) => productController.create(request, reply))
  app.get('/', (request, reply) => productController.list(request, reply))
  app.patch('/:id', (request, reply) => productController.update(request, reply))
  app.delete('/:id', (request, reply) => productController.delete(request, reply))
}
