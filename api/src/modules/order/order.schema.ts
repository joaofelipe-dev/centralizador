import { z } from 'zod'

export const orderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().nonnegative(),
  currentStock: z.number().int().nonnegative().optional().default(0),
})

export const createOrderSchema = z.object({
  storeId: z.string(),
  items: z.array(orderItemSchema).min(1),
})

export const updateOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>
