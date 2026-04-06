import { z } from 'zod'
import { OrderStatus, ORDER_STATUS_VALUES, isValidOrderStatus } from '../../types/order.js'

export const orderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().nonnegative(),
  currentStock: z.number().int().nonnegative().optional().default(0),
})

export const createOrderSchema = z.object({
  storeId: z.string(),
  items: z.array(orderItemSchema).min(1),
  orderDate: z.string().optional(),
})

export const updateOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1).optional(),
  status: z.enum(ORDER_STATUS_VALUES).optional(),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUS_VALUES),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
