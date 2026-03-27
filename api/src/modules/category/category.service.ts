import { CategoryRepository } from './category.repository.js'
import { CreateCategoryInput, UpdateCategoryInput } from './category.schema.js'

export class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

  async createCategory(data: CreateCategoryInput) {
    return this.categoryRepository.create(data)
  }

  async listCategories() {
    return this.categoryRepository.listAll()
  }

  async getCategoryById(id: string) {
    const category = await this.categoryRepository.findById(id)
    if (!category) {
      throw new Error('Category not found')
    }
    return category
  }

  async updateCategory(id: string, data: UpdateCategoryInput) {
    return this.categoryRepository.update(id, data)
  }

  async deleteCategory(id: string) {
    return this.categoryRepository.delete(id)
  }
}
