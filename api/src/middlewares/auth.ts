import { FastifyReply, FastifyRequest } from 'fastify'

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }
}

export async function adminMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
    
    const user = request.user as { isAdmin?: boolean, sub?: string }
    
    // Console log garantido para aparecer no terminal
    console.log('--- ADMIN CHECK ---');
    console.log('User from token:', user);
    
    if (user.isAdmin !== true) {
      console.warn('Access Denied: Not an admin');
      return reply.status(403).send({ message: 'Forbidden: Admin access required' })
    }
    
    console.log('Access Granted: User is admin');
  } catch (err) {
    console.error('Authentication Error in adminMiddleware:', err);
    return reply.status(401).send({ message: 'Unauthorized' })
  }
}
