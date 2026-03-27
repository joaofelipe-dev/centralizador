import { FastifyReply, FastifyRequest } from 'fastify'
import { CategoryService } from './category.service.js'
import { createCategorySchema, updateCategorySchema } from './category.schema.js'

export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = createCategorySchema.parse(request.body)
    const category = await this.categoryService.createCategory(data)
    return reply.status(201).send(category)
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const categories = await this.categoryService.listCategories()
    return reply.send(categories)
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    await this.categoryService.deleteCategory(id)
    return reply.status(204).send()
  }
}
