import * as XLSX from 'xlsx'
import * as fs from 'fs'
import * as path from 'path'

const EXPORT_PATH = process.env.ORDER_EXPORT_PATH || '\\\\192.168.0.247\\onedrive\\Enviados'
const DEFAULT_TEMPLATE_PATH = process.env.DEFAULT_TEMPLATE_PATH || path.join(process.cwd(), '..', 'public', 'Default.xlsx')

export async function exportOrderToNetwork(order: any, storeName: string, storeCode?: string): Promise<{ success: boolean; filepath?: string; error?: string }> {
  try {
    console.log(`[ORDER-EXPORT] Starting export for order: ${order.id}, storeName: ${storeName}, storeCode: ${storeCode}`)
    console.log(`[ORDER-EXPORT] orderDate: ${order.orderDate}`)
    console.log(`[ORDER-EXPORT] items count: ${order.items?.length}`)
    
    const orderDate = order.orderDate 
      ? new Date(order.orderDate)
      : new Date()
    
    const year = orderDate.getFullYear()
    const month = String(orderDate.getMonth() + 1).padStart(2, '0')
    const day = String(orderDate.getDate()).padStart(2, '0')
    const formattedDate = `${day}/${month}/${year}`
    
    const storeCodeParam = storeCode || storeName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 2)
    const filename = `${storeCodeParam.toUpperCase()}_${day}${month}${year}.xlsx`
    
    if (!order.items || order.items.length === 0) {
      const error = 'Order has no items to export'
      console.error(`[ORDER-EXPORT] ${error}`, { orderId: order.id, storeName })
      return { success: false, error }
    }
    
    const templateBuffer = fs.readFileSync(DEFAULT_TEMPLATE_PATH)
    const wb = XLSX.read(templateBuffer)
    const ws = wb.Sheets[wb.SheetNames[0]]
    const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][]
    
    data[0] = [formattedDate, storeName]
    
    const productMap: Record<string, { quantity: number; currentStock: number; categoryName: string }> = {}
    
    order.items.forEach((item: any) => {
      const productName = item.product?.name || 'Produto'
      const categoryName = item.product?.category?.name || 'Outros'
      
      if (!productMap[productName]) {
        productMap[productName] = { quantity: 0, currentStock: 0, categoryName }
      }
      productMap[productName].quantity += item.quantity || 0
      productMap[productName].currentStock += item.currentStock || 0
    })
    
    for (let i = 2; i < data.length; i++) {
      const row = data[i]
      if (!row) continue
      
      const productNameVerduras = String(row[7] || '').trim()
      const productNameLegumes = String(row[1] || '').trim()
      const productNameFrutas = String(row[4] || '').trim()
      
      let productName = ''
      let targetCategory = ''
      
      if (productMap[productNameLegumes]) {
        productName = productNameLegumes
        targetCategory = 'Legumes'
      } else if (productMap[productNameFrutas]) {
        productName = productNameFrutas
        targetCategory = 'Frutas'
      } else if (productMap[productNameVerduras]) {
        productName = productNameVerduras
        targetCategory = 'Verduras'
      }
      
      const productData = productMap[productName]
      
      if (productData) {
        if (targetCategory === 'Legumes') {
          row[0] = productData.quantity
          row[2] = productData.currentStock
        } else if (targetCategory === 'Frutas') {
          row[3] = productData.quantity
          row[5] = productData.currentStock
        } else if (targetCategory === 'Verduras') {
          row[6] = productData.quantity
          row[8] = productData.currentStock
        }
      }
    }
    
    const newWs = XLSX.utils.aoa_to_sheet(data)
    const newWb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(newWb, newWs, 'CEASA')
    
    if (!fs.existsSync(EXPORT_PATH)) {
      const error = `Export path does not exist: ${EXPORT_PATH}`
      console.error(`[ORDER-EXPORT] ${error}`)
      return { success: false, error }
    }
    
    const filePath = path.join(EXPORT_PATH, filename)
    XLSX.writeFile(newWb, filePath)
    
    console.log(`[ORDER-EXPORT] Success: ${filePath}`)
    return { success: true, filepath: filePath }
  } catch (error: any) {
    const errorMessage = error?.message || String(error)
    console.error(`[ORDER-EXPORT] Error: ${errorMessage}`)
    return { success: false, error: errorMessage }
  }
}