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

export const listOrdersSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
  status: z.enum(ORDER_STATUS_VALUES).optional(),
  storeId: z.string().optional(),
  // Rótulos de dia (YYYY-MM-DD): o repositório expande cada um para o intervalo
  // completo do dia em UTC. Um datetime ISO aqui produziria uma data inválida.
  startDate: z.iso.date().optional(),
  endDate: z.iso.date().optional(),
  date: z.iso.date().optional(),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type ListOrdersInput = z.infer<typeof listOrdersSchema>

