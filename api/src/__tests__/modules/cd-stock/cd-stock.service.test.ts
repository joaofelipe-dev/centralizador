import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as XLSX from 'xlsx'
import * as fs from 'fs'
import * as path from 'path'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    syncLog: {
      create: vi.fn(),
    },
  },
}))

import { CDStockService } from '@/modules/cd-stock/cd-stock.service.js'

function createXlsxFile(data: any[][], sheetName = 'Estoque CD') {
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(data)
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  const tmpDir = path.join(process.cwd(), '__test_data__')
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)
  const filePath = path.join(tmpDir, `test_${Date.now()}.xlsx`)
  XLSX.writeFile(wb, filePath)
  return filePath
}

function cleanupXlsxFile(filePath: string) {
  try { fs.unlinkSync(filePath) } catch { /* ok */ }
}

describe('CDStockService', () => {
  afterEach(() => {
    const tmpDir = path.join(process.cwd(), '__test_data__')
    if (fs.existsSync(tmpDir)) {
      for (const f of fs.readdirSync(tmpDir)) {
        try { fs.unlinkSync(path.join(tmpDir, f)) } catch { /* ok */ }
      }
    }
  })

  it('should sync products with exact name match', async () => {
    const filePath = createXlsxFile([
      ['Produto', 45000, 45001],
      [],
      ['Cenoura', 50, 45],
      ['Batata', 30, 25],
    ])

    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      { id: 'p1', name: 'Cenoura' },
      { id: 'p2', name: 'Batata' },
    ])
    vi.mocked(prisma.product.update).mockResolvedValue({} as any)
    vi.mocked(prisma.syncLog.create).mockResolvedValue({} as any)

    const service = new CDStockService(filePath)
    const result = await service.syncFromExcel()

    expect(result.success).toBe(true)
    expect(result.synced).toBe(2)
    expect(prisma.product.update).toHaveBeenCalledTimes(2)
  })

  it('should fallback to fuzzy match when exact match fails', async () => {
    const filePath = createXlsxFile([
      ['Produto', 45000],
      [],
      ['Cenoura kg', 50],
    ])

    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      { id: 'p1', name: 'Cenoura' },
    ])
    vi.mocked(prisma.product.update).mockResolvedValue({} as any)
    vi.mocked(prisma.syncLog.create).mockResolvedValue({} as any)

    const service = new CDStockService(filePath)
    const result = await service.syncFromExcel()

    expect(result.success).toBe(true)
    expect(result.synced).toBe(1)
    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { stockCD: 50 },
    })
  })

  it('should return error when file does not exist', async () => {
    const service = new CDStockService('/definitely/not/exists.xlsx')
    const result = await service.syncFromExcel()

    expect(result.success).toBe(false)
    expect(result.errors[0]).toContain('Arquivo não encontrado')
    expect(result.synced).toBe(0)
  })

  it('should fallback to first sheet when Estoque CD is missing', async () => {
    const filePath = createXlsxFile([
      ['Produto', 45000],
      [],
      ['Cenoura', 50],
    ], 'OtherSheet')

    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      { id: 'p1', name: 'Cenoura' },
    ])
    vi.mocked(prisma.product.update).mockResolvedValue({} as any)
    vi.mocked(prisma.syncLog.create).mockResolvedValue({} as any)

    const service = new CDStockService(filePath)
    const result = await service.syncFromExcel()

    expect(result.success).toBe(true)
    expect(result.synced).toBe(1)
  })

  it('should return error when no data column found', async () => {
    const filePath = createXlsxFile([
      ['Produto'],
      [],
      ['Cenoura'],
    ])

    const service = new CDStockService(filePath)
    const result = await service.syncFromExcel()

    expect(result.success).toBe(false)
    expect(result.errors[0]).toContain('Coluna da data')
  })

  it('should log products not found in Excel', async () => {
    const filePath = createXlsxFile([
      ['Produto', 45000],
      [],
      ['Cenoura', 50],
    ])

    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      { id: 'p1', name: 'Cenoura' },
      { id: 'p2', name: 'ProdutoInexistente' },
    ])
    vi.mocked(prisma.product.update).mockResolvedValue({} as any)
    vi.mocked(prisma.syncLog.create).mockResolvedValue({} as any)

    const service = new CDStockService(filePath)
    const result = await service.syncFromExcel()

    expect(result.success).toBe(true)
    expect(result.synced).toBe(1)
    expect(result.notFound).toContain('ProdutoInexistente')
  })
})
