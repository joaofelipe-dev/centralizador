import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(3).toLowerCase(),
  password: z.string().min(6),
})

export type LoginInput = z.infer<typeof loginSchema>
