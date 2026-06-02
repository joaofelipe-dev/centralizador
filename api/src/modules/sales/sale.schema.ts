import { z } from 'zod'

export const createSaleSchema = z.object({
  supplierId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
  })).min(1),
})

export const saleParamsSchema = z.object({
  id: z.string().uuid(),
})

export type CreateSaleInput = z.infer<typeof createSaleSchema>
