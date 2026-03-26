import fastify from 'fastify'
import jwt from '@fastify/jwt'
import cors from '@fastify/cors'
import { errorHandler } from './utils/error-handler.js'
import { userRoutes } from './modules/user/user.routes.js'
import { authRoutes } from './modules/auth/auth.routes.js'
import { productRoutes } from './modules/product/product.routes.js'
import 'dotenv/config'

export const app = fastify()

app.register(cors, {
  origin: true,
})

app.register(jwt, {
  secret: process.env.JWT_SECRET || 'supersecretkey',
})

// Error handler
errorHandler(app)

app.get('/', async () => {
  return { status: 'API is running', version: '1.0.0' }
})

// Routes
app.register(authRoutes, { prefix: '/auth' })
app.register(userRoutes, { prefix: '/users' })
app.register(productRoutes, { prefix: '/pedidos' })
