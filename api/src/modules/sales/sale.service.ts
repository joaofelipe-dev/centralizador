import { prisma } from '../../lib/prisma.js'
import { SaleRepository } from './sale.repository.js'
import type { CreateSaleInput } from './sale.schema.js'

export class SaleService {
  private repo: SaleRepository

  constructor(repo?: SaleRepository) {
    this.repo = repo || new SaleRepository()
  }

  async createSale(data: CreateSaleInput & { userId: string }) {
    const supplier = await prisma.supplier.findUnique({
      where: { id: data.supplierId }
    })
    if (!supplier) throw new Error('Supplier not found')

    const productIds = data.items.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    })
    if (products.length !== productIds.length) {
      throw new Error('One or more products not found')
    }

    for (const item of data.items) {
      const product = products.find(p => p.id === item.productId)
      if (!product || (product.stockCD ?? 0) < item.quantity) {
        throw new Error(`Insufficient stock for product ${product?.name || item.productId}`)
      }
    }

    return await prisma.$transaction(async (tx) => {
      const sale = await this.repo.create({ ...data, status: 'RECEIVED' }, tx)

      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockCD: { decrement: item.quantity } }
        })

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'EXIT',
            quantity: item.quantity,
            reason: 'Venda para fornecedor',
            userId: data.userId,
            purchaseOrderId: sale.id
          }
        })
      }

      return sale
    })
  }

  async listSales() {
    return this.repo.findMany()
  }

  async getSale(id: string) {
    const sale = await this.repo.findFirst({ id })
    if (!sale) throw new Error('Sale not found')
    return sale
  }
}
