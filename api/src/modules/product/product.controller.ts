import { FastifyReply, FastifyRequest } from 'fastify'
import { ProductService } from './product.service.js'
import { createProductSchema, updateProductSchema } from './product.schema.js'
import { z } from 'zod'

export class ProductController {
  constructor(private productService: ProductService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = createProductSchema.parse(request.body)
    const userId = request.user && typeof request.user === 'object' && 'sub' in request.user
      ? String((request.user as any).sub)
      : null

    if (!userId) {
      request.log.warn('Tentativa de criar produto sem usuário autenticado')
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    const product = await this.productService.createProduct({
      ...data,
      userId,
    })

    return reply.status(201).send(product)
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user && typeof request.user === 'object' && 'sub' in request.user
      ? String((request.user as any).sub)
      : null

    if (!userId) {
      request.log.warn('Tentativa de listar produtos sem usuário autenticado')
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    const products = await this.productService.listUserProducts(userId)
    return reply.status(200).send(products)
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
    const data = updateProductSchema.parse(request.body)
    const userId = request.user && typeof request.user === 'object' && 'sub' in request.user
      ? String((request.user as any).sub)
      : null

    if (!userId) {
      request.log.warn('Tentativa de atualizar produto sem usuário autenticado')
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    const product = await this.productService.updateProduct(id, userId, data)
    return reply.status(200).send(product)
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
    const userId = request.user && typeof request.user === 'object' && 'sub' in request.user
      ? String((request.user as any).sub)
      : null

    if (!userId) {
      request.log.warn('Tentativa de excluir produto sem usuário autenticado')
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    await this.productService.deleteProduct(id, userId)
    return reply.status(204).send()
  }
}
