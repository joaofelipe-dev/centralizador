import { prisma } from './lib/prisma.js'
import { exportOrderToNetwork } from './lib/order-export.js'

async function testExport() {
  console.log('=== Test Export Manual ===\n')

  try {
    const order = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: { include: { category: true } }
          }
        },
        store: true
      }
    })

    if (!order) {
      console.log('No orders found')
      return
    }

    console.log('Found order:', order.id)
    console.log('Store:', order.store.name, '(' + order.store.code + ')')
    console.log('Items:', order.items.length)

    console.log('\n--- Testing Export ---')
    const result = await exportOrderToNetwork(
      order, 
      order.store.name, 
      order.store.code || undefined
    )
    
    console.log('\nResult:', result)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testExport()
