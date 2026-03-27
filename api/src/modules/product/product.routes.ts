import { FastifyInstance } from 'fastify'
import { ProductController } from './product.controller.js'
import { ProductService } from './product.service.js'
import { ProductRepository } from './product.repository.js'
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.js'

export async function productRoutes(app: FastifyInstance) {
  const productRepository = new ProductRepository()
  const productService = new ProductService(productRepository)
  const productController = new ProductController(productService)

  // Rotas de leitura (Authenticated)
  app.register(async (authApp) => {
    authApp.addHook('preHandler', authMiddleware)
    authApp.get('/', (request, reply) => productController.list(request, reply))
  })

  // Rotas de criação, edição e exclusão (Admin only)
  app.register(async (adminApp) => {
    adminApp.addHook('preHandler', adminMiddleware)
    
    adminApp.post('/', (request, reply) => productController.create(request, reply))
    adminApp.patch('/:id', (request, reply) => productController.update(request, reply))
    adminApp.delete('/:id', (request, reply) => productController.delete(request, reply))
  })
}
