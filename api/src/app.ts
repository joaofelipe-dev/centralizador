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
import { purchaseRoutes } from './modules/purchases/purchase.routes.js'
import { movementRoutes } from './modules/movements/movement.routes.js'
import { cdStockRoutes } from './modules/cd-stock/cd-stock.routes.js'
import { stockCountRoutes } from './modules/stock-counts/stock-count.routes.js'
import { saleRoutes } from './modules/sales/sale.routes.js'
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
  openapi: {
    info: {
      title: 'Centralizador API',
      version: '1.0.0'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
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
app.register(purchaseRoutes, { prefix: '/purchases' })
app.register(movementRoutes, { prefix: '/movements' })
app.register(cdStockRoutes, { prefix: '/cd-stock' })
app.register(stockCountRoutes, { prefix: '/stock-counts' })
app.register(saleRoutes, { prefix: '/sales' })