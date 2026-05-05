export type StockCount = {
  id: string
  userId: string
  user?: { id: string, name: string }
  status: string
  notes?: string
  items: StockCountItem[]
  createdAt: string
}

export type StockCountItem = {
  id: string
  productId: string
  product?: { id: string, name: string, stockCD: number }
  physicalQty: number
  systemQty: number
  divergence: number
}
