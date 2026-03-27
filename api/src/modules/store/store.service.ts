import { StoreRepository } from './store.repository.js'
import { CreateStoreInput, UpdateStoreInput } from './store.schema.js'

export class StoreService {
  constructor(private storeRepository: StoreRepository) {}

  async createStore(data: CreateStoreInput) {
    return this.storeRepository.create(data)
  }

  async getStoreById(id: string) {
    const store = await this.storeRepository.findById(id)
    if (!store) throw new Error('Store not found')
    return store
  }

  async listStores(userId: string, isAdmin: boolean) {
    if (isAdmin) {
      return this.storeRepository.listAll()
    }
    return this.storeRepository.findByUserId(userId)
  }

  async updateStore(id: string, data: UpdateStoreInput) {
    return this.storeRepository.update(id, data)
  }

  async deleteStore(id: string) {
    return this.storeRepository.delete(id)
  }
}
