import { prisma } from '@/lib/prisma.js'

async function checkStores() {
  const stores = await prisma.store.findMany({ 
    select: { id: true, name: true, code: true } 
  })
  console.log(JSON.stringify(stores, null, 2))
  await prisma.$disconnect()
}

checkStores()
