import { z } from 'zod'

export const createStoreSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
})

export const updateStoreSchema = z.object({
  name: z.string().min(2).optional(),
  address: z.string().min(5).optional(),
})

export type CreateStoreInput = z.infer<typeof createStoreSchema>
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>
