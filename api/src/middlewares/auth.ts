import { FastifyReply, FastifyRequest } from 'fastify'

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    request.log.warn({ err }, 'JWT validation falhou no middleware de autenticação')
    return reply.status(401).send({
      message: 'Unauthorized',
      detail: err instanceof Error ? err.message : 'Invalid token',
    })
  }
}
