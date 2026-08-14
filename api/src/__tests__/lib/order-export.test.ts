import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import * as XLSX from 'xlsx'

const EXPORT_PATH = process.env.ORDER_EXPORT_PATH || '\\\\192.168.0.247\\onedrive\\Enviado'

vi.mock('fs')
vi.mock('xlsx')

const mockTemplateData: unknown[][] = [
  ['', ''],
  [],
  ['', '', '', '', '', '', '', '', ''],
]

describe('Order Export', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from(''))
    vi.mocked(XLSX.read).mockReturnValue({
      SheetNames: ['Sheet1'],
      Sheets: { Sheet1: {} },
    } as unknown as XLSX.WorkBook)
    vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue(
      mockTemplateData.map((row) => [...row])
    )
  })

  describe('exportOrderToNetwork', () => {
    it('should export order with items to network path', async () => {
      const mockOrder = {
        id: 'order-1',
        orderDate: new Date('2026-04-09T15:00:00'),
        items: [
          { product: { name: 'Cenoura' }, quantity: 10, currentStock: 5 },
          { product: { name: 'Batata' }, quantity: 20, currentStock: 15 },
        ],
      }

      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(XLSX.utils.aoa_to_sheet).mockReturnValue({} as any)
      vi.mocked(XLSX.utils.book_new).mockReturnValue({} as any)
      vi.mocked(XLSX.utils.book_append_sheet).mockReturnValue()
      vi.mocked(XLSX.writeFile).mockReturnValue()

      const { exportOrderToNetwork } = await import('@/lib/order-export.js')
      const result = await exportOrderToNetwork(mockOrder, 'Loja Teste')

      expect(result.success).toBe(true)
      expect(result.filepath).toContain('LO_09042026.xlsx')
      expect(fs.existsSync).toHaveBeenCalledWith(EXPORT_PATH)
      expect(XLSX.writeFile).toHaveBeenCalled()
    })

    it('should return error when export path does not exist', async () => {
      const mockOrder = {
        id: 'order-1',
        orderDate: new Date(),
        items: [{ product: { name: 'Cenoura' }, quantity: 10, currentStock: 5 }],
      }

      vi.mocked(fs.existsSync).mockReturnValue(false)

      const { exportOrderToNetwork } = await import('@/lib/order-export.js')
      const result = await exportOrderToNetwork(mockOrder, 'Loja')

      expect(result.success).toBe(false)
      expect(result.error).toContain('does not exist')
    })

    it('should return error when order has no items', async () => {
      const mockOrder = {
        id: 'order-1',
        orderDate: new Date(),
        items: [],
      }

      vi.mocked(fs.existsSync).mockReturnValue(true)

      const { exportOrderToNetwork } = await import('@/lib/order-export.js')
      const result = await exportOrderToNetwork(mockOrder, 'Loja')

      expect(result.success).toBe(false)
      expect(result.error).toContain('no items')
    })

    it('should handle missing product gracefully', async () => {
      const mockOrder = {
        id: 'order-1',
        orderDate: new Date('2026-04-09'),
        items: [
          { product: null, quantity: 10, currentStock: 5 },
        ],
      }

      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(XLSX.utils.aoa_to_sheet).mockReturnValue({} as any)
      vi.mocked(XLSX.utils.book_new).mockReturnValue({} as any)
      vi.mocked(XLSX.utils.book_append_sheet).mockReturnValue()
      vi.mocked(XLSX.writeFile).mockReturnValue()

      const { exportOrderToNetwork } = await import('@/lib/order-export.js')
      const result = await exportOrderToNetwork(mockOrder, 'Loja')

      expect(result.success).toBe(true)
    })

    it('should use orderDate or current date when not provided', async () => {
      const mockOrder = {
        id: 'order-1',
        orderDate: null,
        items: [{ product: { name: 'Cenoura' }, quantity: 10, currentStock: 5 }],
      }

      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(XLSX.utils.aoa_to_sheet).mockReturnValue({} as any)
      vi.mocked(XLSX.utils.book_new).mockReturnValue({} as any)
      vi.mocked(XLSX.utils.book_append_sheet).mockReturnValue()
      vi.mocked(XLSX.writeFile).mockReturnValue()

      const { exportOrderToNetwork } = await import('@/lib/order-export.js')
      const result = await exportOrderToNetwork(mockOrder, 'Loja')

      expect(result.success).toBe(true)
    })
  })
})
