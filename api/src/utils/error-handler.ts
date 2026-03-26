import { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'

export function errorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    const err = error as any

    // Log detalhado do erro
    request.log.error({
      err: {
        message: err?.message,
        code: err?.code,
        meta: err?.meta,
        stack: err?.stack,
      },
    }, 'Erro global capturado pelo handler')

    if (error instanceof ZodError) {
      return reply.status(400).send({
        message: 'Validation error.',
        errors: error.flatten().fieldErrors,
      })
    }

    if (err?.statusCode) {
      return reply.status(err.statusCode).send({
        message: err.message || 'Erro de servidor',
      })
    }

    // Prisma errors
    if (err?.code === 'P1008' || err?.code === 'P1001') {
      request.log.error('Erro de conexão com o banco de dados')
      return reply.status(503).send({ message: 'Database connection error' })
    }

    // Never expose stack trace in production
    console.error('[ERROR HANDLER]', error)

    return reply.status(500).send({
      message: 'Internal server error.',
    })
  })
}
