import { FastifyInstance } from 'fastify'
import { SaleController } from './sale.controller.js'
import { SaleService } from './sale.service.js'
import { SaleRepository } from './sale.repository.js'
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.js'

export async function saleRoutes(app: FastifyInstance) {
  const saleRepository = new SaleRepository()
  const saleService = new SaleService(saleRepository)
  const saleController = new SaleController(saleService)

  app.register(async (authApp) => {
    authApp.addHook('preHandler', authMiddleware)
    authApp.get('/', (request, reply) => saleController.list(request, reply))
    authApp.get('/:id', (request, reply) => saleController.getById(request, reply))
  })

  app.register(async (adminApp) => {
    adminApp.addHook('preHandler', adminMiddleware)
    adminApp.post('/', (request, reply) => saleController.create(request, reply))
  })
}
