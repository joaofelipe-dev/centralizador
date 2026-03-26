import { z } from 'zod'

export const createProductSchema = z.object({
  name: z.string().min(2),
  category: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().nonnegative().optional(),
})

export const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  category: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
