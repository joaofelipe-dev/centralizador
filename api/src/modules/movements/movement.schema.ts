import { z } from 'zod'

export const movementQuerySchema = z.object({
  type: z.string().optional(),
  productId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().int().positive().optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
})

export const createAdjustmentSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number(),
  reason: z.string().min(1),
})

export type CreateAdjustmentInput = z.infer<typeof createAdjustmentSchema>
