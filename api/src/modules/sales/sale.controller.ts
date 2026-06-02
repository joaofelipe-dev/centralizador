import { FastifyReply, FastifyRequest } from 'fastify'
import { SaleService } from './sale.service.js'
import { createSaleSchema, saleParamsSchema } from './sale.schema.js'

export class SaleController {
  constructor(private saleService: SaleService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = createSaleSchema.parse(request.body)
    const user = request.user as { sub: string }
    const sale = await this.saleService.createSale({ ...data, userId: user.sub })
    return reply.status(201).send(sale)
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const sales = await this.saleService.listSales()
    return reply.send(sales)
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = saleParamsSchema.parse(request.params)
    const sale = await this.saleService.getSale(id)
    return reply.send(sale)
  }
}
