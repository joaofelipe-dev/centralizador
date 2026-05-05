export type StockMovement = {
  id: string
  productId: string
  product?: { id: string, name: string }
  type: string // ENTRY | EXIT | ADJUST
  quantity: number
  reason?: string
  userId: string
  user?: { id: string, name: string }
  orderId?: string
  purchaseOrderId?: string
  createdAt: string
}

export type MovementType = 'ENTRY' | 'EXIT' | 'ADJUST'

export type CreateAdjustmentData = {
  productId: string
  quantity: number
  reason: string
}

export type MovementFilters = {
  type?: MovementType
  productId?: string
  dateFrom?: string
  dateTo?: string
}
