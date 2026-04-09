import { prisma } from '@/lib/prisma.js'

async function checkOrders() {
  const orders = await prisma.order.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: {
            include: { category: true }
          }
        }
      }
    }
  })
  
  console.log(JSON.stringify(orders, null, 2))
  await prisma.$disconnect()
}

checkOrders()
