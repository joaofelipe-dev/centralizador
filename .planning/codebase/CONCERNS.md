# CONCERNS.md - Codebase Concerns and Observations

## Overview

This document outlines key concerns, observations, and technical notes about the centralizador codebase. The application is a multi-store order management system with a Next.js frontend and Fastify backend API, using SQLite with Prisma ORM.

---

## 1. Security Concerns

### 1.1 Authentication and Authorization

**JWT Implementation:**
- Uses @fastify/jwt for token-based authentication
- Password hashing via bcryptjs in auth.service.ts
- Role-based access control with three roles: DEFAULT, SUPERVISOR, ADMIN

**Issues Identified:**

1. **Hardcoded JWT Secret**
   - Location: api/.env line 2: JWT_SECRET="supersecretkey"
   - Risk: Using a weak/placeholder secret in production is dangerous
   - Recommendation: Use a strong, randomly generated secret in production

2. **No Rate Limiting on Auth Endpoints**
   - No protection against brute force attacks on /auth/login
   - Recommendation: Implement rate limiting

3. **Wide Open CORS**
   - Location: api/src/app.ts line 17-20
   - Code: origin: true, methods: GET, POST, PUT, DELETE, PATCH
   - Risk: Accepts requests from any origin
   - Recommendation: Restrict to specific origins in production

4. **Missing Token Refresh Mechanism**
   - JWT tokens have no explicit expiration configuration
   - No refresh token flow implemented
   - Once a token is stolen, it remains valid indefinitely

5. **Admin Routes Not Fully Protected**
   - User routes use adminMiddleware (good)
   - But no audit logging for admin actions

### 1.2 API Security

**Protected Routes:**
- /orders - Requires authMiddleware
- /orders/consolidated - Requires supervisorMiddleware
- /users/* - Requires adminMiddleware
- /stores - Read: auth, Write: admin only

**Potential Issues:**
- No input sanitization beyond Zod schemas (Zod helps but not comprehensive)
- No SQL injection protection beyond Prisma's parameterized queries (but Prisma is generally safe)
- API URL hardcoded in frontend (src/lib/api.js line 1): http://192.168.0.245:3333

---

## 2. Performance Concerns

### 2.1 Database

**SQLite Limitations:**
- Single-writer architecture - concurrent writes will queue
- File-based storage: api/dev.db
- No connection pooling (SQLite limitation)

**Query Performance Issues:**

1. **No Pagination**
   - All list endpoints return all results
   - Location: order.routes.ts, user.routes.ts, store.routes.ts
   - Risk: Will degrade with data growth

2. **Missing Indexes**
   - Prisma schema (api/prisma/schema.prisma) has no explicit indexes
   - Queries on orderDate, storeId, userId will slow down

3. **N+1 Query Potential**
   - getConsolidatedData in order.service.ts iterates products twice
   - Could be optimized with single query

### 2.2 Network Operations

**Synchronous Export:**
- Location: api/src/modules/order/order.service.ts lines 30-43
- Order export to network runs synchronously during order creation
- Network path: \\\\192.168.0.247\\onedrive\\Enviados
- Risk: If network drive is slow/unavailable, order creation blocks

**Excel Export:**
- Uses xlsx library to generate Excel files
- Reads entire template for each order
- No caching of template

### 2.3 Missing Optimizations

- No API response caching
- No query result caching
- No CDN for static assets
- No image/media optimization

---

## 3. Tech Debt

### 3.1 Code Organization

**Duplicate Files:**
- api/dist/ contains compiled JavaScript
- api/src/ contains TypeScript source
- Both maintained in version control
- Recommendation: Add api/dist/ to .gitignore

**Hardcoded Values:**
- Multiple places with hardcoded configurations
- src/lib/api.js: const API_URL = 'http://192.168.0.245:3333'
- api/src/app.ts line 23: secret: process.env.JWT_SECRET || 'supersecretkey'
- api/.env: Hardcoded secret and database path

### 3.2 Testing Gaps

**Current Test Coverage:**
- Basic tests in src/__tests__/
- AuthContext.test.jsx, Header.test.jsx, OrderForm.test.jsx, Button.test.jsx
- api/src/__tests__/: Auth, user service, order routes

**Missing Tests:**
- Comprehensive integration tests
- E2E tests
- Security tests (auth bypass, injection attempts)
- Performance/load tests

### 3.3 Error Handling

**Inconsistent Error Handling:**
- Some routes throw standard errors
- Some return generic 500s
- No centralized error logging
- Console.log used for debugging throughout

**Error Handler:**
- Location: api/src/utils/error-handler.ts
- Basic implementation, could be more comprehensive

---

## 4. Current Features

### 4.1 Application Capabilities

**Multi-Store Order Management:**
- Centralized ordering for multiple retail stores
- Store codes: PT, HD, TM, ST, NA, BT, SM, CAL, CD
- Each user assigned to specific stores

**User Roles:**
1. **DEFAULT** - Can create orders for assigned stores only
2. **SUPERVISOR** - Can view consolidated orders, update any order
3. **ADMIN** - Full system access including user management

**Order Workflow:**
1. User selects store and products
2. Creates order with quantities and current stock
3. Order saved to SQLite database
4. Excel file exported to network path automatically

**Admin Features:**
- User CRUD (create, read, update, delete)
- User role assignment
- Store assignment to users

**Data Export:**
- Consolidated order data as JSON
- Excel export to network folder
- Template-based export with categories (Legumes, Frutas, Verduras)

### 4.2 Technology Stack

**Frontend:**
- Next.js 16.2.1
- React 19.2.4
- Tailwind CSS v4
- date-fns, react-day-picker
- xlsx for Excel handling

**Backend:**
- Fastify 5.8.4
- Prisma 7.5.0 with better-sqlite3 adapter
- bcryptjs for password hashing
- Zod 4.3.6 for validation
- @fastify/jwt for authentication
- @fastify/cors

**Database:**
- SQLite (dev.db)
- Prisma ORM
- Models: User, Store, Category, Product, Order, OrderItem

---

## 5. Known Limitations

### 5.1 Functional Limitations

1. **No Order Cancellation**
   - Only status updates: PENDING, APPROVED, REJECTED
   - No delete/cancel functionality for orders

2. **No Multi-Language Support**
   - All UI text in Portuguese
   - Hardcoded strings

3. **No Notification System**
   - No email/SMS notifications
   - No real-time updates (WebSocket)

4. **No Data Backup**
   - SQLite file needs manual backup
   - No automated backup system

5. **Limited Reporting**
   - Only basic consolidated view
   - No charts, dashboards, trends

### 5.2 Technical Limitations

1. **No Pagination**
   - List endpoints return all records

2. **No API Versioning**
   - All endpoints at root level

3. **No Request/Response Logging**
   - Limited debugging capability

4. **No Health Check Endpoint**
   - Only basic root endpoint returns status

5. **Hardcoded Export Path**
   - Network path may not be available
   - No fallback mechanism

---

## 6. Database: SQLite with Prisma ORM

### 6.1 Schema Overview

`
User (id, username, name, email, password, role)
  - has many Stores (relation: UserStores)
  - has many Orders
  - has many Products

Store (id, name, address, code)
  - has many Users
  - has many Orders

Category (id, name)
  - has many Products

Product (id, name, price, stock, categoryId, userId)
  - has many OrderItems

Order (id, storeId, userId, status, orderDate)
  - has many OrderItems
  - belongs to Store and User

OrderItem (id, orderId, productId, quantity, currentStock)
  - belongs to Order and Product
`

### 6.2 Constraints and Tradeoffs

**Advantages:**
- Zero configuration, easy to set up
- Single file database (dev.db)
- Good for development and small-scale deployments
- Prisma provides type-safe queries
- ACID compliance via SQLite

**Disadvantages:**
- Single-writer (limited concurrency)
- Not suitable for multi-instance deployments
- File-based (no remote/distributed capability)
- Limited to single machine
- No built-in replication

**Prisma-Specific Issues:**
- Uses @prisma/adapter-better-sqlite3 for better performance
- Generated client in api/src/generated/prisma/
- Model validation at ORM level

### 6.3 Production Considerations

For production with multiple users, consider:
- PostgreSQL migration (Prisma supports it)
- Connection pooling
- Read replicas
- Automated backups

---

## 7. Summary

### Priority Concerns

1. **Security** - High Priority
   - Weak JWT secret
   - No rate limiting
   - Open CORS

2. **Performance** - Medium Priority
   - Synchronous export blocks requests
   - No pagination
   - Missing database indexes

3. **Tech Debt** - Medium Priority
   - Hardcoded values
   - Duplicate dist folder in git
   - Limited testing

4. **Feature Gaps** - Low Priority
   - Need pagination
   - Notification system
   - Advanced reporting

### Recommendations

1. Implement strong JWT secret in production
2. Add rate limiting to auth endpoints
3. Restrict CORS to specific origins
4. Add pagination to list endpoints
5. Make export async or optional
6. Add database indexes
7. Remove api/dist/ from version control
8. Implement comprehensive testing
9. Add logging/monitoring
10. Consider PostgreSQL for production scale