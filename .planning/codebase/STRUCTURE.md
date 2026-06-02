# Centralizador - Directory Structure

## Overview

This document describes the directory structure of the Centralizador monorepo, highlighting key files and their roles in the application architecture.

## Root Level

\\\
centralizador/
+-- src/                    # Next.js Frontend
+-- api/                    # Fastify Backend
+-- public/                 # Static assets (includes Default.xlsx template)
+-- .planning/              # Documentation files
+-- package.json            # Root package (Next.js scripts)
+-- next.config.mjs        # Next.js configuration
+-- eslint.config.mjs      # ESLint configuration
+-- tailwind.config.js     # Tailwind CSS configuration (referenced)
+-- vitest.config.ts       # Vitest test configuration
+-- AGENTS.md              # Agent instructions
\\\

## Frontend: src/ (Next.js App Router)

### src/app/ - App Router Pages

The Next.js App Router directory containing route-based pages.

`
src/app/
+-- layout.js              # Root layout with AuthProvider, fonts, metadata
+-- page.jsx               # Home page with Onboarding component
+-- globals.css            # Global Tailwind styles
+-- favicon.ico            # Site favicon
+-- login/
�   +-- page.jsx          # Login page
+-- pedidos/
�   +-- page.jsx          # Order creation flow (requires auth)
+-- admin/
�   +-- page.jsx          # Admin dashboard with stats, pivot table, team management
�   +-- pedidos/
�       +-- page.jsx      # Admin order management
+-- supervisor/
    +-- page.jsx          # Supervisor order editing
`

**Key Pages:**

| File | Purpose | Auth Required |
|------|---------|---------------|
| page.jsx | Landing page with Onboarding | No |
| login/page.jsx | User authentication | No |
| pedidos/page.jsx | Order creation flow | Yes |
| admin/page.jsx | Admin dashboard | ADMIN role |
| admin/pedidos/page.jsx | Admin order management | ADMIN role |
| supervisor/page.jsx | Order editing | SUPERVISOR role |

### src/components/ - Reusable UI Components

`
src/components/
+-- Button/               # Button component variants
�   +-- Button.jsx        # Main button component
�   +-- ButtonVariants.jsx # Variant definitions
+-- Header/               # Application header
�   +-- Header.jsx        # Header wrapper with Logo/Nav/Extras pattern
�   +-- HeaderLogo.jsx    # Logo component
�   +-- HeaderNav.jsx     # Navigation links
+-- Admin/                # Admin-specific components
�   +-- PivotTable.jsx    # Consolidated order data table with export
�   +-- StatsGallery.jsx  # Statistics cards display
�   +-- TeamManagement.jsx # User management form
�   +-- OrderList.jsx     # Order listing component
�   +-- OrderEditModal.jsx # Order editing modal
+-- DateInput/            # Date picker component
�   +-- DateInput.tsx     # Calendar date input
+-- ui/                   # Shadcn/ui-style primitives
�   +-- button.jsx        # Base button styles
�   +-- calendar.jsx      # Calendar component
�   +-- popover.jsx       # Popover overlay
+-- Footer.jsx            # Application footer
+-- Onboarding.jsx        # First-time user onboarding
+-- OrderForm.jsx         # Main order creation form
+-- StoreSelector.jsx     # Store selection component
`

**Component Patterns:**

- **Compound Components**: Header uses Logo/Nav/Extras sub-components
- **Memo Components**: PivotTable uses React.memo for performance
- **Client Components**: All components marked with  use client directive

### src/context/ - React Contexts

`
src/context/
+-- AuthContext.jsx       # Authentication state and methods
`

**AuthContext provides:**
- user - Current authenticated user object
- login(username, password) - Authentication method
- logout() - Sign out method
- loading - Authentication loading state

### src/lib/ - Utilities and API Client

`
src/lib/
+-- api.js                # API client with all endpoints
+-- utils.js              # Utility functions (cn, date helpers)
`

**api.js exports:**
- piRequest(endpoint, options) - Base fetch wrapper
- pi.login(credentials) - POST /auth/login
- pi.register(userData) - POST /auth/register
- pi.getMe() - GET /auth/me
- pi.getProducts() - GET /products
- pi.createProduct(data) - POST /products
- pi.updateProduct(id, data) - PATCH /products/:id
- pi.deleteProduct(id) - DELETE /products/:id
- pi.getUsers() - GET /users
- pi.createUser(data) - POST /users
- pi.updateUser(id, data) - PATCH /users/:id
- pi.deleteUser(id) - DELETE /users/:id
- pi.getStores() - GET /stores
- pi.getCategories() - GET /categories
- pi.getOrders(date, status) - GET /orders
- pi.createOrder(data) - POST /orders
- pi.getConsolidatedOrders(date) - GET /orders/consolidated
- pi.updateOrder(id, data) - PUT /orders/:id
- pi.updateOrderStatus(id, status) - PATCH /orders/:id/status

### src/constants/ - Static Data

`
src/constants/
+-- stores.js             # Store definitions and constants
`

### src/__tests__/ - Frontend Tests

`
src/__tests__/
+-- context/
�   +-- AuthContext.test.jsx  # Auth context tests
+-- components/
�   +-- Header.test.jsx       # Header component tests
�   +-- OrderForm.test.jsx    # Order form tests
�   +-- Button.test.jsx        # Button component tests
+-- lib/
�   +-- api.test.js           # API client tests
+-- __mocks__/
�   +-- handlers.ts            # MSW mock handlers
+-- setup.ts                  # Test setup configuration
`

## Backend: api/ (Fastify)

### api/src/ - Source Code

`
api/src/
+-- server.ts              # Entry point - starts Fastify server
+-- app.ts                 # Fastify app configuration and route registration
+-- modules/               # Feature modules (S/C/R pattern)
+-- lib/                   # Shared libraries
+-- middlewares/           # Custom middleware
+-- generated/             # Prisma generated code
+-- types/                 # TypeScript type definitions
+-- utils/                 # Utility functions
`

### api/src/modules/ - Feature Modules

Each module follows the Service/Controller/Repository/Schema pattern (S/C/R/S):

#### auth/ - Authentication Module
`
modules/auth/
+-- auth.routes.ts         # POST /login, POST /register, GET /me
+-- auth.controller.ts     # Request handling, JWT signing
+-- auth.service.ts        # Credential validation with bcrypt
+-- auth.schema.ts         # Zod validation for login
`

#### user/ - User Management Module
`
modules/user/
+-- user.routes.ts        # CRUD routes (admin only)
+-- user.controller.ts     # User CRUD operations
+-- user.service.ts       # Business logic
+-- user.repository.ts    # Prisma operations
+-- user.schema.ts        # Zod validation for user creation/update
`

#### store/ - Store Management Module
`
modules/store/
+-- store.routes.ts       # CRUD routes (read: auth, write: admin)
+-- store.controller.ts    # Store CRUD operations
+-- store.service.ts      # Business logic
+-- store.repository.ts   # Prisma operations
+-- store.schema.ts       # Zod validation
`

#### product/ - Product Catalog Module
`
modules/product/
+-- product.routes.ts     # CRUD routes (read: auth, write: admin)
+-- product.controller.ts  # Product CRUD operations
+-- product.service.ts    # Business logic
+-- product.repository.ts # Prisma operations
+-- product.schema.ts     # Zod validation
`

#### category/ - Category Module
`
modules/category/
+-- category.routes.ts     # List (auth), Create/Delete (admin)
+-- category.controller.ts  # Category operations
+-- category.service.ts    # Business logic
+-- category.repository.ts # Prisma operations
+-- category.schema.ts     # Zod validation
`

#### order/ - Order Management Module
`
modules/order/
+-- order.routes.ts       # Create, List, Update routes
+-- order.controller.ts    # Order operations
+-- order.service.ts      # Business logic + export trigger
+-- order.repository.ts   # Prisma operations
+-- order.schema.ts       # Zod validation
`

#### purchases/ - Purchase Orders Module
`
modules/purchases/
+-- purchase.routes.ts       # CRUD + receive routes
+-- purchase.controller.ts   # Request/response handling
+-- purchase.service.ts      # Business logic + stock updates
+-- purchase.repository.ts   # Prisma operations
+-- purchase.schema.ts       # Zod validation
`

#### sales/ - Sales Module
`
modules/sales/
+-- sale.routes.ts       # List, Get, Create routes
+-- sale.controller.ts   # Request/response handling
+-- sale.service.ts      # Sales logic + stock decrement
+-- sale.repository.ts   # Prisma operations
+-- sale.schema.ts       # Zod validation
`

#### movements/ - Stock Movements Module
`
modules/movements/
+-- movement.routes.ts       # List, Adjust routes
+-- movement.controller.ts   # Request/response handling
+-- movement.service.ts      # Adjustment logic
+-- movement.repository.ts   # Prisma operations
+-- movement.schema.ts       # Zod validation
`

#### stock-counts/ - Physical Stock Count Module
`
modules/stock-counts/
+-- stock-count.routes.ts       # CRUD + close routes
+-- stock-count.controller.ts   # Request/response handling
+-- stock-count.service.ts      # Count + divergence logic
+-- stock-count.repository.ts   # Prisma operations
+-- stock-count.schema.ts       # Zod validation
``

### api/src/lib/ - Shared Libraries

`
api/src/lib/
+-- prisma.ts             # Prisma client initialization with better-sqlite3 adapter
+-- order-export.ts       # XLSX export to network share
`

**prisma.ts:**
- Uses PrismaClient with PrismaBetterSqlite3 adapter
- Database file: api/dev.db
- Exported as singleton prisma

**order-export.ts:**
- Reads Default.xlsx template
- Maps products to template columns by category
- Writes to network path (default: \\\\192.168.0.247\\onedrive\\Enviados)
- Returns success/error with filepath

### api/src/middlewares/ - Custom Middleware

`
api/src/middlewares/
+-- auth.ts              # JWT verification and role checks
`

**Exports:**
- uthMiddleware - Validates JWT token
- supervisorMiddleware - SUPERVISOR or ADMIN required
- supervisorOnlyMiddleware - SUPERVISOR only
- dminMiddleware - ADMIN only
- UserRole type: DEFAULT | SUPERVISOR | ADMIN

### api/src/generated/prisma/ - Prisma Generated Code

`
api/src/generated/prisma/
+-- client.ts             # Main Prisma client export
+-- browser.ts            # Browser-compatible client
+-- models.ts             # Re-exports all models
+-- enums.ts              # Enum definitions
+-- commonInputTypes.ts   # Shared input types
+-- models/               # Individual model type files
�   +-- User.ts
�   +-- Store.ts
�   +-- Category.ts
�   +-- Product.ts
�   +-- Order.ts
�   +-- OrderItem.ts
+-- internal/             # Prisma internal types
    +-- class.js
    +-- prismaNamespace.js
    +-- prismaNamespaceBrowser.js
    +-- class.ts
`

**Generated from:** api/prisma/schema.prisma

### api/src/types/ - TypeScript Type Definitions

`
api/src/types/
+-- order.ts             # Order-related types
`

**order.ts contains:**
- OrderStatus type: PENDING | APPROVED | CONFIRMED | CANCELLED
- ORDER_STATUS_VALUES array
- isValidOrderStatus() validation function

### api/src/utils/ - Utilities

`
api/src/utils/
+-- error-handler.ts     # Global Fastify error handler
`

**error-handler.ts:**
- Handles Zod validation errors (400)
- Handles Prisma connection errors (503)
- Logs errors with full stack traces
- Returns generic 500 for unhandled errors

### api/prisma/ - Database Schema

`
api/prisma/
+-- schema.prisma         # Database schema definition
+-- (dev.db)             # SQLite database file (gitignored)
`

**schema.prisma defines:**
- Generator: prisma-client outputting to ../src/generated/prisma
- Datasource: SQLite provider
- Models: User, Store, Category, Product, Order, OrderItem
- Relations: User-Stores (many-to-many), Order-OrderItem (one-to-many), etc.

### api/dist/ - Compiled Output

Build output directory containing TypeScript compiled JavaScript files.

`
api/dist/
+-- server.js             # Compiled server entry
+-- app.js                # Compiled app configuration
+-- modules/              # Compiled module files
+-- lib/                  # Compiled lib files
+-- middlewares/          # Compiled middleware
+-- generated/            # Copied Prisma generated code
+-- types/                # Copied type definitions
+-- utils/                # Copied utilities
`

## Key Files Summary

### Frontend Key Files

| File | Purpose |
|------|---------|
| src/app/layout.js | Root layout with AuthProvider and metadata |
| src/app/page.jsx | Landing page with Onboarding |
| src/app/pedidos/page.jsx | Order creation flow |
| src/app/admin/page.jsx | Admin dashboard |
| src/context/AuthContext.jsx | Authentication state management |
| src/lib/api.js | API client for all backend calls |
| src/components/OrderForm.jsx | Main order creation form |
| src/components/Header/Header.jsx | Application header |
| src/components/Admin/PivotTable.jsx | Consolidated data visualization |

### Backend Key Files

| File | Purpose |
|------|---------|
| api/src/server.ts | Server entry point (port 3333) |
| api/src/app.ts | Fastify app setup and route registration |
| api/src/modules/order/order.service.ts | Order business logic |
| api/src/lib/order-export.ts | XLSX export functionality |
| api/src/middlewares/auth.ts | JWT authentication middleware |
| api/src/lib/prisma.ts | Prisma database client |
| api/prisma/schema.prisma | Database schema |
| api/src/utils/error-handler.ts | Global error handling |

## Module Dependency Graph

`
app.ts (registers routes)
    |
    +-- authRoutes
    |       +-- AuthController
    |               +-- AuthService
    |                       +-- UserRepository
    |
    +-- userRoutes
    |       +-- UserController
    |               +-- UserService
    |                       +-- UserRepository
    |
    +-- storeRoutes
    |       +-- StoreController
    |               +-- StoreService
    |                       +-- StoreRepository
    |
    +-- productRoutes
    |       +-- ProductController
    |               +-- ProductService
    |                       +-- ProductRepository
    |
    +-- categoryRoutes
    |       +-- CategoryController
    |               +-- CategoryService
    |                       +-- CategoryRepository
    |
    +-- orderRoutes
            +-- OrderController
                    +-- OrderService
                            +-- OrderRepository
                            +-- UserRepository
                            +-- ProductRepository
                                    +-- order-export.ts
`

All repositories depend on:
- lib/prisma.ts (PrismaClient singleton)
- types/*.ts (Type definitions)

## New Modules (Added in Code Review Fixes)

| Module | Files | Pattern |
|--------|-------|---------|
| purchases/ | 5 files | S/C/R/S |
| sales/ | 5 files | S/C/R/S |
| movements/ | 5 files | S/C/R/S |
| stock-counts/ | 5 files | S/C/R/S |

## Testing Structure

`
src/__tests__/              # Frontend tests (Vitest + React Testing Library)
api/src/__tests__/          # Backend tests (Vitest + Supertest)
`

**Test Commands:**
- 
pm test - Run all tests
- 
pm run test:ui - Run tests with UI
- 
pm run test:coverage - Run tests with coverage

## Configuration Files

| File | Purpose |
|------|---------|
| package.json (root) | Next.js dependencies, scripts |
| api/package.json | Fastify dependencies, scripts |
| next.config.mjs | Next.js configuration |
| eslint.config.mjs | ESLint rules |
| vitest.config.ts | Test runner configuration |
| api/tsconfig.json | TypeScript configuration for API |
