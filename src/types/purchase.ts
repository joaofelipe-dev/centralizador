export type PurchaseOrder = {
  id: string
  supplierId: string
  supplier?: Supplier
  userId: string
  user?: { id: string; name: string }
  status: 'DRAFT' | 'RECEIVED' | 'CANCELLED'
  type: string
  notes?: string
  items: PurchaseOrderItem[]
  createdAt: string
}

export type PurchaseOrderItem = {
  id: string
  productId: string
  product?: { id: string; name: string; stockCD?: number }
  quantity: number
  unitCost?: number
}

export type Supplier = {
  id: string
  name: string
  type: string
}
