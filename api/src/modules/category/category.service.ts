import { CategoryRepository } from './category.repository.js'
import { CreateCategoryInput } from './category.schema.js'

export class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

  async createCategory(data: CreateCategoryInput) {
    return this.categoryRepository.create(data)
  }

  async listCategories() {
    return this.categoryRepository.listAll()
  }

  async deleteCategory(id: string) {
    return this.categoryRepository.delete(id)
  }
}
