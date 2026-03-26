import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { AuthService } from './auth.service.js'
import { loginSchema } from './auth.schema.js'
import { createUserSchema } from '../user/user.schema.js'
import { UserService } from '../user/user.service.js'

export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = createUserSchema.parse(request.body)
      const user = await this.userService.createUser(data)

      const token = await reply.jwtSign({ sub: user.id, isAdmin: user.isAdmin })
      request.log.info({ userId: user.id }, 'Usuário registrado com sucesso')

      return reply.status(201).send({ user, token })
    } catch (err) {
      request.log.error({ err }, 'Erro no registro de usuário')

      if (err instanceof Error && err.message === 'User already exists') {
        return reply.status(409).send({ message: err.message })
      }

      if (err instanceof z.ZodError) {
        return reply.status(400).send({
          message: 'Validation error',
          errors: err.flatten().fieldErrors,
        })
      }

      return reply.status(500).send({ message: 'Internal server error' })
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    request.log.info({ body: request.body }, 'Requisição de login recebida')

    try {
      const data = loginSchema.parse(request.body)
      const { user } = await this.authService.authenticate(data)

      const token = await reply.jwtSign({ sub: user.id, isAdmin: user.isAdmin })
      request.log.info({ userId: user.id }, 'Login bem-sucedido')

      return reply.status(200).send({ user, token })
    } catch (err) {
      request.log.warn({ err }, 'Falha ao autenticar usuário')

      if (err instanceof Error && err.message === 'Invalid credentials') {
        return reply.status(401).send({ message: err.message })
      }

      if (err instanceof z.ZodError) {
        return reply.status(400).send({
          message: 'Validation error',
          errors: err.flatten().fieldErrors,
        })
      }

      return reply.status(500).send({ message: 'Internal server error' })
    }
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user && typeof request.user === 'object' && 'sub' in request.user
        ? String((request.user as any).sub)
        : null

      if (!userId) {
        request.log.warn('Requisição /auth/me sem sub no token JWT')
        return reply.status(401).send({ message: 'Unauthorized' })
      }

      const user = await this.userService.getUserById(userId)
      request.log.info({ userId }, 'Informações do usuário retornadas (/auth/me)')

      return reply.status(200).send({ user })
    } catch (err) {
      request.log.error({ err }, 'Erro ao obter informações do usuário atual')
      if (err instanceof Error && err.message === 'User not found') {
        return reply.status(401).send({ message: 'Unauthorized' })
      }
      return reply.status(500).send({ message: 'Internal server error' })
    }
  }
}
