import { ProductRepository } from './product.repository.js'
import { CreateProductInput, UpdateProductInput } from './product.schema.js'

export class ProductService {
  constructor(private productRepository: ProductRepository) {}

  async createProduct(data: CreateProductInput & { userId: string }) {
    return this.productRepository.create(data)
  }

  async listUserProducts(userId: string) {
    return this.productRepository.listByUser(userId)
  }

  async getProductById(id: string, userId: string) {
    const product = await this.productRepository.findById(id)

    if (!product) {
      throw new Error('Product not found')
    }

    if (product.userId !== userId) {
      throw new Error('Unauthorized')
    }

    return product
  }

  async updateProduct(id: string, userId: string, data: UpdateProductInput) {
    const product = await this.productRepository.findById(id)

    if (!product) {
      throw new Error('Product not found')
    }

    if (product.userId !== userId) {
      throw new Error('Unauthorized')
    }

    return this.productRepository.update(id, data)
  }

  async deleteProduct(id: string, userId: string) {
    const product = await this.productRepository.findById(id)

    if (!product) {
      throw new Error('Product not found')
    }

    if (product.userId !== userId) {
      throw new Error('Unauthorized')
    }

    return this.productRepository.delete(id)
  }
}
