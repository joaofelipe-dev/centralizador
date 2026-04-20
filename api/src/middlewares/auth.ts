import { FastifyReply, FastifyRequest } from 'fastify'

export type UserRole = 'DEFAULT' | 'SUPERVISOR' | 'ADMIN'

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }
}

export async function supervisorMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
    
    const user = request.user as { role?: UserRole, sub?: string }
    
    if (user.role !== 'SUPERVISOR' && user.role !== 'ADMIN') {
      return reply.status(403).send({ message: 'Forbidden: Supervisor or Admin access required' })
    }
  } catch (err) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }
}

export async function supervisorOnlyMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
    
    const user = request.user as { role?: UserRole, sub?: string }
    
    if (user.role !== 'SUPERVISOR') {
      return reply.status(403).send({ message: 'Forbidden: Supervisor access required' })
    }
  } catch (err) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }
}

export async function adminMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    console.log('[Auth] adminMiddleware - iniciando verificação');
    console.log('[Auth] Headers:', request.headers);

    await request.jwtVerify();
    console.log('[Auth] JWT verificado com sucesso');

    const user = request.user as { role?: UserRole, sub?: string }
    console.log('[Auth] User:', JSON.stringify(user));
    console.log('[Auth] User role:', user.role);

    if (user.role !== 'ADMIN') {
      console.log('[Auth] ❌ Role não é ADMIN:', user.role);
      return reply.status(403).send({ message: 'Forbidden: Admin access required' })
    }

    console.log('[Auth] ✓ Admin verificado com sucesso');
  } catch (err) {
    console.error('[Auth] ❌ Erro na verificação:', err);
    return reply.status(401).send({ message: 'Unauthorized' })
  }
}
