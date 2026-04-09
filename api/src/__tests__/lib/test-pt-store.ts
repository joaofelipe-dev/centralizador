import { prisma } from '@/lib/prisma.js'
import { exportOrderToNetwork } from '@/lib/order-export.js'

async function testWithStoreCode() {
  console.log('=== Testing Export with Store Code ===\n')

  try {
    const store = await prisma.store.findFirst({ where: { code: 'PT' } })
    console.log('Store:', store)

    if (!store) {
      console.log('Store PT not found')
      return
    }

    const users = await prisma.user.findMany()
    const productList = await prisma.product.findMany({ take: 3 })

    const testOrder = await prisma.order.create({
      data: {
        storeId: store.id,
        userId: users[0].id,
        orderDate: new Date(),
        items: {
          create: productList.map(p => ({
            productId: p.id,
            quantity: 10,
            currentStock: 5,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: { include: { category: true } }
          },
        },
        store: true,
      },
    })

    console.log('\nOrder created:', testOrder.id)
    console.log('Store name:', testOrder.store.name)
    console.log('Store code:', testOrder.store.code)

    console.log('\n--- Testing Export ---')
    const exportResult = await exportOrderToNetwork(
      testOrder, 
      testOrder.store.name, 
      testOrder.store.code || undefined
    )
    console.log('Export result:', exportResult)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testWithStoreCode()
