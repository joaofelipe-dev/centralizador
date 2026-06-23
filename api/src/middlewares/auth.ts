import { FastifyReply, FastifyRequest } from 'fastify'

export type UserRole = 'DEFAULT' | 'SUPERVISOR' | 'ADMIN'

export function requireRole(roles?: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify()
      if (roles) {
        const user = request.user as { role?: UserRole }
        if (!user.role || !roles.includes(user.role)) {
          return reply.status(403).send({ message: 'Forbidden' })
        }
      }
    } catch {
      return reply.status(401).send({ message: 'Unauthorized' })
    }
  }
}

export const authMiddleware = requireRole()
export const supervisorMiddleware = requireRole(['SUPERVISOR', 'ADMIN'])
export const adminMiddleware = requireRole(['ADMIN'])
