import fastify from 'fastify'
import jwt from '@fastify/jwt'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { errorHandler } from './utils/error-handler.js'
import { userRoutes } from './modules/user/user.routes.js'
import { authRoutes } from './modules/auth/auth.routes.js'
import { productRoutes } from './modules/product/product.routes.js'
import { categoryRoutes } from './modules/category/category.routes.js'
import { storeRoutes } from './modules/store/store.routes.js'
import { orderRoutes } from './modules/order/order.routes.js'
import { cdStockRoutes } from './modules/cd-stock/cd-stock.routes.js'
import 'dotenv/config'

export const app = fastify({
  logger: true,
})

app.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
})

app.register(jwt, {
  secret: process.env.JWT_SECRET || 'supersecretkey',
})

// Swagger/OpenAPI
app.register(swagger, {
  swagger: {
    info: {
      title: 'Centralizador API',
      version: '1.0.0'
    },
    servers: [
      {
        url: `http://${process.env.API_HOST || 'localhost'}:${process.env.PORT || 3333}`
      }
    ],
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header'
      }
    }
  }
})

app.register(swaggerUi, {
  routePrefix: '/docs'
})

// Error handler
errorHandler(app)

app.get('/', async () => {
  return { status: 'API is running', version: '1.0.0' }
})

// Routes
app.register(authRoutes, { prefix: '/auth' })
app.register(userRoutes, { prefix: '/users' })
app.register(productRoutes, { prefix: '/products' })
app.register(categoryRoutes, { prefix: '/categories' })
app.register(storeRoutes, { prefix: '/stores' })
app.register(orderRoutes, { prefix: '/orders' })
app.register(cdStockRoutes, { prefix: '/cd-stock' })