import { FastifyInstance } from 'fastify'
import { StockCountController } from './stock-count.controller.js'
import { StockCountService } from './stock-count.service.js'
import { StockCountRepository } from './stock-count.repository.js'
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.js'

export async function stockCountRoutes(app: FastifyInstance) {
  const stockCountRepository = new StockCountRepository()
  const stockCountService = new StockCountService(stockCountRepository)
  const stockCountController = new StockCountController(stockCountService)

  app.register(async (authApp) => {
    authApp.addHook('preHandler', authMiddleware)

    authApp.post('/', (request, reply) => stockCountController.create(request, reply))
    authApp.get('/', (request, reply) => stockCountController.list(request, reply))
    authApp.get('/:id', (request, reply) => stockCountController.getById(request, reply))
    authApp.patch('/:id/items', (request, reply) => stockCountController.updateItems(request, reply))
  })

  app.register(async (adminApp) => {
    adminApp.addHook('preHandler', adminMiddleware)
    adminApp.post('/:id/close', (request, reply) => stockCountController.close(request, reply))
  })
}
