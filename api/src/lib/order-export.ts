import * as XLSX from 'xlsx'
import * as fs from 'fs'
import * as path from 'path'

const EXPORT_PATH = process.env.ORDER_EXPORT_PATH || '\\\\192.168.0.230\\Ti\\Diversos'

export async function exportOrderToNetwork(order: any, storeName: string) {
  try {
    const orderDate = order.orderDate 
      ? new Date(order.orderDate)
      : new Date()
    
    const year = orderDate.getFullYear()
    const month = String(orderDate.getMonth() + 1).padStart(2, '0')
    const day = String(orderDate.getDate()).padStart(2, '0')
    const formattedDate = `${day}/${month}/${year}`
    
    const storeCode = storeName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 2).toUpperCase()
    const filename = `${storeCode}_${day}${month}${year}.xlsx`
    
    const data: any[][] = []
    
    data.push([formattedDate, storeName])
    data.push(['Produto', 'Quantidade', 'Estoque'])
    
    order.items.forEach((item: any) => {
      data.push([
        item.product?.name || 'Produto',
        item.quantity || 0,
        item.currentStock || 0
      ])
    })
    
    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'CEASA')
    
    const exportPath = EXPORT_PATH
    
    if (!fs.existsSync(exportPath)) {
      console.error(`Export path does not exist: ${exportPath}`)
      return false
    }
    
    const filePath = path.join(exportPath, filename)
    XLSX.writeFile(wb, filePath)
    
    console.log(`Order exported to: ${filePath}`)
    return true
  } catch (error) {
    console.error('Error exporting order:', error)
    return false
  }
}