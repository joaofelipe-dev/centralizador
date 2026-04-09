import { prisma } from '@/lib/prisma.js'
import { exportOrderToNetwork } from '@/lib/order-export.js'

async function testFullFlow() {
  console.log('=== Testing Full Order Export Flow ===\n')

  try {
    const stores = await prisma.store.findMany()
    console.log('Stores in DB:', stores.length)

    if (stores.length === 0) {
      console.log('No stores found. Creating test store...')
      const newStore = await prisma.store.create({
        data: {
          name: 'Loja Teste Export',
          address: 'Rua Teste, 123',
          code: 'TE',
        },
      })
      console.log('Created store:', newStore)
    }

    const users = await prisma.user.findMany()
    console.log('Users in DB:', users.length)

    if (users.length === 0) {
      console.log('No users found. Cannot create test order.')
      return
    }

    const products = await prisma.product.findMany()
    console.log('Products in DB:', products.length)

    if (products.length === 0) {
      console.log('No products. Creating test product...')
      const category = await prisma.category.create({
        data: { name: 'Test Category' },
      })
      const newProduct = await prisma.product.create({
        data: {
          name: 'Cenoura Teste',
          price: 5.0,
          stock: 10,
          categoryId: category.id,
          userId: users[0].id,
        },
      })
      console.log('Created product:', newProduct)
    }

    const store = stores[0] || (await prisma.store.findFirst())
    const productList = await prisma.product.findMany()

    if (!store || productList.length === 0) {
      console.log('Cannot create order without store and products')
      return
    }

    const testOrder = await prisma.order.create({
      data: {
        storeId: store.id,
        userId: users[0].id,
        orderDate: new Date(),
        items: {
          create: productList.slice(0, 3).map(p => ({
            productId: p.id,
            quantity: Math.floor(Math.random() * 20) + 1,
            currentStock: p.stock,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        store: true,
      },
    })

    console.log('\nCreated order:', testOrder.id)
    console.log('Order items:', testOrder.items.length)

    console.log('\n--- Testing Export ---')
    const exportResult = await exportOrderToNetwork(testOrder, testOrder.store.name)

    console.log('\nExport result:', exportResult)

    if (exportResult.success) {
      console.log('\n✅ SUCCESS: Order exported to network')
      console.log('   Filepath:', exportResult.filepath)
    } else {
      console.log('\n❌ FAILED: Order export failed')
      console.log('   Error:', exportResult.error)
    }

    await prisma.order.delete({ where: { id: testOrder.id } })
    console.log('\nTest order cleaned up')

  } catch (error) {
    console.error('Error during test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testFullFlow()
