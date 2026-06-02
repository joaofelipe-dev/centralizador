import { z } from 'zod'

export const stockCountQuerySchema = z.object({
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().int().positive().optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
})

export const stockCountParamsSchema = z.object({
  id: z.string().uuid(),
})

export const updateItemsSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    physicalQty: z.number().int().nonnegative(),
  })),
})

export type UpdateItemsInput = z.infer<typeof updateItemsSchema>
