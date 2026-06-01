import { prisma } from '../../lib/prisma.js'

export async function createSale(data: {
  supplierId: string
  userId: string
  items: { productId: string; quantity: number }[]
}) {
  const { supplierId, userId, items } = data

  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId }
  })
  if (!supplier) {
    throw new Error('Supplier not found')
  }

  const productIds = items.map(item => item.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } }
  })
  if (products.length !== productIds.length) {
    throw new Error('One or more products not found')
  }

  for (const item of items) {
    const product = products.find(p => p.id === item.productId)
    if (!product || (product.stockCD ?? 0) < item.quantity) {
      throw new Error(`Insufficient stock for product ${product?.name || item.productId}`)
    }
  }

  const sale = await prisma.$transaction(async (tx) => {
    const purchaseOrder = await tx.purchaseOrder.create({
      data: {
        supplierId,
        userId,
        type: 'SALE',
        status: 'RECEIVED',
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        supplier: true,
        user: true
      }
    })

    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stockCD: {
            decrement: item.quantity
          }
        }
      })

      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          type: 'EXIT',
          quantity: item.quantity,
          reason: 'Venda para fornecedor',
          userId,
          purchaseOrderId: purchaseOrder.id
        }
      })
    }

    return purchaseOrder
  })

  return sale
}

export async function listSales() {
  const sales = await prisma.purchaseOrder.findMany({
    where: { type: 'SALE' },
    include: {
      supplier: true,
      user: {
        select: { id: true, name: true, username: true }
      },
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return sales
}

export async function getSale(id: string) {
  const sale = await prisma.purchaseOrder.findFirst({
    where: { id, type: 'SALE' },
    include: {
      supplier: true,
      user: {
        select: { id: true, name: true, username: true }
      },
      items: {
        include: {
          product: true
        }
      }
    }
  })

  if (!sale) {
    throw new Error('Sale not found')
  }

  return sale
}
