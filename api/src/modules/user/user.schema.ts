import { z } from 'zod'

export const createUserSchema = z.object({
  username: z.string().min(3).max(20).toLowerCase(),
  name: z.string().min(2),
  email: z.string().email().optional(),
  password: z.string().min(6),
  storeIds: z.array(z.string()).min(1),
  role: z.enum(['DEFAULT', 'SUPERVISOR', 'ADMIN']).optional().default('DEFAULT'),
})

export const updateUserSchema = z.object({
  username: z.string().min(3).max(20).toLowerCase().optional(),
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  storeIds: z.array(z.string()).optional(),
  role: z.enum(['DEFAULT', 'SUPERVISOR', 'ADMIN']).optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
