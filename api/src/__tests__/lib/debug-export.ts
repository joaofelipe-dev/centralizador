import { prisma } from '@/lib/prisma.js'
import { exportOrderToNetwork } from '@/lib/order-export.js'
import * as XLSX from 'xlsx'
import * as fs from 'fs'
import * as path from 'path'

const EXPORT_PATH = process.env.ORDER_EXPORT_PATH || '\\\\192.168.0.230\\Ti\\Diversos'
const DEFAULT_TEMPLATE_PATH = process.env.DEFAULT_TEMPLATE_PATH || path.join(process.cwd(), '..', 'public', 'Default.xlsx')

async function testFullFlow() {
  console.log('=== Testing Full Order Export Flow ===\n')

  try {
    const stores = await prisma.store.findMany()
    const users = await prisma.user.findMany()
    const productList = await prisma.product.findMany()

    const store = stores[0]
    
    const testOrder = await prisma.order.create({
      data: {
        storeId: store.id,
        userId: users[0].id,
        orderDate: new Date(),
        items: {
          create: productList.slice(0, 3).map(p => ({
            productId: p.id,
            quantity: Math.floor(Math.random() * 20) + 1,
            currentStock: Math.floor(Math.random() * 10) + 1,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: { category: true }
            },
          },
        },
        store: true,
      },
    })

    console.log('Created order:', testOrder.id)
    console.log('Order items:')
    testOrder.items.forEach(item => {
      console.log(`  - ${item.product.name} (${item.product.category.name}): qty=${item.quantity}, stock=${item.currentStock}`)
    })

    const templateBuffer = fs.readFileSync(DEFAULT_TEMPLATE_PATH)
    const wb = XLSX.read(templateBuffer)
    const ws = wb.Sheets[wb.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 })

    const productMap = {}
    testOrder.items.forEach(item => {
      const productName = item.product.name
      const categoryName = item.product.category.name
      productMap[productName] = {
        quantity: item.quantity,
        currentStock: item.currentStock,
        categoryName: categoryName
      }
    })

    console.log('\nProduct map:')
    console.log(JSON.stringify(productMap, null, 2))

    for (let i = 2; i < 10; i++) {
      const row = data[i]
      if (!row) continue
      
      const productNameVerduras = String(row[7] || '').trim()
      const productNameLegumes = String(row[1] || '').trim()
      const productNameFrutas = String(row[4] || '').trim()
      
      console.log(`\nRow ${i}: Legumes="${productNameLegumes}", Frutas="${productNameFrutas}", Verduras="${productNameVerduras}"`)
      
      if (productMap[productNameLegumes]) {
        console.log(`  -> MATCH Legumes: qty=${productMap[productNameLegumes].quantity}, stock=${productMap[productNameLegumes].currentStock}`)
      }
      if (productMap[productNameFrutas]) {
        console.log(`  -> MATCH Frutas: qty=${productMap[productNameFrutas].quantity}, stock=${productMap[productNameFrutas].currentStock}`)
      }
      if (productMap[productNameVerduras]) {
        console.log(`  -> MATCH Verduras: qty=${productMap[productNameVerduras].quantity}, stock=${productMap[productNameVerduras].currentStock}`)
      }
    }

    console.log('\n--- Testing Export ---')
    const exportResult = await exportOrderToNetwork(testOrder, testOrder.store.name)
    console.log('\nExport result:', exportResult)

  } catch (error) {
    console.error('Error during test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testFullFlow()
