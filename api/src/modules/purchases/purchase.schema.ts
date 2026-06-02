import { z } from 'zod'

export const createPurchaseSchema = z.object({
  supplierId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    unitCost: z.number().nonnegative().optional(),
  })).min(1),
})

export const purchaseQuerySchema = z.object({
  status: z.string().optional(),
  supplierId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().int().positive().optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
})

export const purchaseParamsSchema = z.object({
  id: z.string().uuid(),
})

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>
