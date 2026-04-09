import XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'

const LOCAL_EXPORT_PATH = './test-export-output'

if (!fs.existsSync(LOCAL_EXPORT_PATH)) {
  fs.mkdirSync(LOCAL_EXPORT_PATH, { recursive: true })
}

const mockOrder = {
  id: 'order-test-001',
  orderDate: new Date('2026-04-09T10:00:00'),
  items: [
    { product: { name: 'Cenoura' }, quantity: 10, currentStock: 5 },
    { product: { name: 'Batata' }, quantity: 20, currentStock: 15 },
    { product: { name: 'Alface' }, quantity: 5, currentStock: 8 },
  ],
}

const storeName = 'LOJA_TESTS'
const orderDate = mockOrder.orderDate || new Date()
const year = orderDate.getFullYear()
const month = String(orderDate.getMonth() + 1).padStart(2, '0')
const day = String(orderDate.getDate()).padStart(2, '0')
const formattedDate = `${day}/${month}/${year}`

const storeCode = storeName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 2).toUpperCase()
const filename = `${storeCode}_${day}${month}${year}.xlsx`

const data = []
data.push([formattedDate, storeName])
data.push(['Produto', 'Quantidade', 'Estoque'])

mockOrder.items.forEach((item) => {
  data.push([
    item.product?.name || 'Produto',
    item.quantity || 0,
    item.currentStock || 0
  ])
})

console.log('Data to export:')
console.table(data)

const ws = XLSX.utils.aoa_to_sheet(data)
const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws, 'CEASA')

const filePath = path.join(LOCAL_EXPORT_PATH, filename)
XLSX.writeFile(wb, filePath)

console.log(`\nFile created: ${filePath}`)

const verifyData = XLSX.utils.sheet_to_json(ws, { header: 1 })
console.log('\nVerifying exported data:')
console.table(verifyData)

const fileExists = fs.existsSync(filePath)
console.log(`\nFile exists: ${fileExists}`)

fs.unlinkSync(filePath)
fs.rmdirSync(LOCAL_EXPORT_PATH)
console.log('Test file cleaned up')

process.exit(fileExists ? 0 : 1)
