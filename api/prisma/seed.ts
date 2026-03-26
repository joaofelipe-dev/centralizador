import { prisma } from '../src/lib/prisma.js'
import bcrypt from 'bcryptjs'

const productsData = {
    "Legumes": [
        { name: "Acelga", category: "Legumes", price: 25.90, stock: 10 },
        { name: "Abóbora Baby", category: "Legumes", price: 1.50, stock: 10 },
        { name: "Abóbora para Doce", category: "Legumes", price: 4.20, stock: 10 },
        { name: "Abobrinha Caipira", category: "Legumes", price: 15.00, stock: 10 },
    ],
    "Frutas": [
        { name: "Banana Nanica", category: "Frutas", price: 25.90, stock: 10 },
        { name: "Maçã Gala", category: "Frutas", price: 1.50, stock: 10 },
        { name: "Laranja Pera", category: "Frutas", price: 4.20, stock: 10 },
        { name: "Uva Thompson", category: "Frutas", price: 15.00, stock: 10 },
    ],
    "Verduras": [
        { name: "Alface Crespa", category: "Verduras", price: 3.50, stock: 10 },
        { name: "Couve Manteiga", category: "Verduras", price: 4.00, stock: 10 },
        { name: "Espinafre", category: "Verduras", price: 5.20, stock: 10 },
    ]
}

async function main() {
  console.log('Seed started...')

  // 1. Create a default user
  const username = 'admin'
  let user = await prisma.user.findUnique({ where: { username } })

  if (!user) {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    user = await prisma.user.create({
      data: {
        username,
        name: 'Admin',
        email: 'admin@admin.com',
        password: hashedPassword,
        isAdmin: true,
        stores: JSON.stringify(['Av. Portugal', 'Henrique Dumont']),
      }
    })
    console.log('Admin user created with stores')
  }

  // 2. Flatten and insert products
  const allProducts = Object.values(productsData).flat()
  
  for (const product of allProducts) {
    await prisma.product.create({
      data: {
        name: product.name,
        price: product.price,
        category: product.category,
        stock: product.stock,
        userId: user.id
      }
    })
  }

  console.log(`${allProducts.length} products inserted.`)
  console.log('Seed finished successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    // No need to disconnect explicitly as it's a script
  })
