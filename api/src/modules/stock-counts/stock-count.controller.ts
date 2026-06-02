import { FastifyReply, FastifyRequest } from 'fastify'
import { StockCountService } from './stock-count.service.js'
import { stockCountQuerySchema, stockCountParamsSchema, updateItemsSchema } from './stock-count.schema.js'

export class StockCountController {
  constructor(private stockCountService: StockCountService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user as { sub: string }
    const stockCount = await this.stockCountService.createStockCount(user.sub)
    return reply.status(201).send(stockCount)
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const filters = stockCountQuerySchema.parse(request.query)
    const { limit = 50, offset = 0 } = filters
    const result = await this.stockCountService.listStockCounts({ ...filters, limit, offset })
    return reply.send(result)
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = stockCountParamsSchema.parse(request.params)
    const stockCount = await this.stockCountService.getStockCountById(id)
    return reply.send(stockCount)
  }

  async updateItems(request: FastifyRequest, reply: FastifyReply) {
    const { id } = stockCountParamsSchema.parse(request.params)
    const { items } = updateItemsSchema.parse(request.body)
    const results = await this.stockCountService.updateCountItems(id, items)
    return reply.send(results)
  }

  async close(request: FastifyRequest, reply: FastifyReply) {
    const { id } = stockCountParamsSchema.parse(request.params)
    const user = request.user as { sub: string }
    const stockCount = await this.stockCountService.closeStockCount(id, user.sub)
    return reply.send(stockCount)
  }
}
