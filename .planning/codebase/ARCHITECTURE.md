# Centralizador - High-Level Architecture

## Overview

Centralizador is a full-stack monorepo application designed for centralized order management. It consists of a Next.js frontend (in the repository root) and a Fastify backend API (in the api/ directory).

## Monorepo Structure

\\\
centralizador/
+-- src/                    # Next.js Frontend (Root)
¦   +-- app/               # App Router pages
¦   +-- components/        # Reusable React components
¦   +-- context/           # React contexts (Auth)
¦   +-- lib/               # Utilities and API client
¦   +-- constants/         # Static data
¦   +-- __tests__/         # Frontend tests
+-- api/                   # Fastify Backend
¦   +-- src/
¦   ¦   +-- modules/       # Feature modules (S/C/R pattern)
¦   ¦   +-- lib/           # Shared utilities
¦   ¦   +-- middlewares/   # Express-like middleware
¦   ¦   +-- generated/     # Prisma generated code
¦   ¦   +-- types/         # TypeScript type definitions
¦   ¦   +-- utils/         # Utilities (error handling)
¦   ¦   +-- app.ts         # Fastify app setup
¦   ¦   +-- server.ts      # Server entry point
¦   +-- prisma/            # Prisma schema
¦   +-- dist/              # Compiled output
+-- .planning/             # Documentation
+-- public/                # Static assets
\\\

## Request Flow

### Frontend to Backend Communication

Browser (React) sends HTTP requests with JWT token to Fastify API running on port 3333. The request flows through Controller -> Service -> Repository -> Prisma -> SQLite database.

### API Endpoints

| Prefix | Routes | Description |
|--------|--------|-------------|
| /auth | /login, /register, /me | Authentication |
| /users | CRUD operations | User management |
| /products | CRUD operations | Product catalog |
| /categories | List, Create, Delete | Product categories |
| /stores | CRUD operations | Store management |
| /orders | Create, List, Update | Order management |

## Key Modules

### 1. Order Module (api/src/modules/order/)

**Purpose**: Core business logic for purchase order management

**Files**:
- order.routes.ts - Route definitions with middleware
- order.controller.ts - Request/response handling
- order.service.ts - Business logic (store access validation, export)
- order.repository.ts - Database operations
- order.schema.ts - Zod validation schemas

**Key Features**:
- Store access validation (users can only create orders for permitted stores)
- Automatic order export to network share (XLSX)
- Consolidated data aggregation for supervisor dashboard
- Order status workflow: PENDING, APPROVED, CONFIRMED, CANCELLED

### 2. User Module (api/src/modules/user/)

**Purpose**: User account and team management

**Files**:
- user.routes.ts - Admin-only CRUD routes
- user.controller.ts - Request handling
- user.service.ts - Business logic
- user.repository.ts - Database operations
- user.schema.ts - Validation schemas

**Key Features**:
- User roles: DEFAULT, SUPERVISOR, ADMIN
- Store assignment (many-to-many relationship)
- Password hashing with bcryptjs

### 3. Auth Module (api/src/modules/auth/)

**Purpose**: Authentication and authorization

**Files**:
- auth.routes.ts - Login, register, me endpoints
- auth.controller.ts - JWT token generation
- auth.service.ts - Credential validation

**Key Features**:
- JWT-based authentication
- Password comparison with bcrypt
- Token payload: { sub: userId, role: UserRole }

### 4. Store Module (api/src/modules/store/)

**Purpose**: Store/branch management

**Files**:
- store.routes.ts - Read (auth), Write (admin)
- store.controller.ts - CRUD operations
- store.service.ts - Business logic
- store.repository.ts - Database operations
- store.schema.ts - Validation schemas

**Key Features**:
- Store codes (PT, HD, TM, ST, NA, BT, SM, CAL, CD)
- User-store assignment (many-to-many)

### 5. Product Module (api/src/modules/product/)

**Purpose**: Product catalog management

**Files**:
- product.routes.ts - Read (auth), Write (admin)
- product.controller.ts - CRUD operations
- product.service.ts - Business logic
- product.repository.ts - Database operations
- product.schema.ts - Validation schemas

**Key Features**:
- Category assignment
- Stock tracking
- Price management

### 6. Category Module (api/src/modules/category/)

**Purpose**: Product categorization

**Files**:
- category.routes.ts - List (auth), Create/Delete (admin)
- category.controller.ts - CRUD operations
- category.service.ts - Business logic
- category.repository.ts - Database operations
- category.schema.ts - Validation schemas

**Key Categories**: Legumes, Frutas, Verduras, Temperos

## Data Models

### Entity Relationships

- User --< Order (one-to-many)
- User --< Product (one-to-many)
- User >--< Store (many-to-many via UserStores)
- Store --< Order (one-to-many)
- Category --< Product (one-to-many)
- Product --< OrderItem (one-to-many)
- Order --< OrderItem (one-to-many)

### Model Definitions

#### User
- id: UUID (primary key)
- username: Unique login identifier
- name: Display name
- email: Optional unique email
- password: Bcrypt hashed password
- role: DEFAULT | SUPERVISOR | ADMIN
- stores: Many-to-many relation with Store
- orders: One-to-many relation with Order
- products: One-to-many relation with Product

#### Store
- id: UUID (primary key)
- name: Unique store name
- address: Physical address
- code: Store abbreviation (PT, HD, etc.)
- users: Many-to-many relation with User
- orders: One-to-many relation with Order

#### Category
- id: UUID (primary key)
- name: Unique category name
- products: One-to-many relation with Product

#### Product
- id: UUID (primary key)
- name: Product name
- price: Product price
- stock: Current stock quantity
- categoryId: Foreign key to Category
- userId: Foreign key to User (creator)
- orderItems: One-to-many relation with OrderItem

#### Order
- id: UUID (primary key)
- storeId: Foreign key to Store
- userId: Foreign key to User
- status: PENDING | APPROVED | CONFIRMED | CANCELLED
- orderDate: Scheduled delivery date
- items: One-to-many relation with OrderItem

#### OrderItem
- id: UUID (primary key)
- orderId: Foreign key to Order
- productId: Foreign key to Product
- quantity: Ordered quantity
- currentStock: Current stock at store

## Authentication and Authorization

### JWT Token Structure
\\\json
{
  sub: user-uuid,
  role: DEFAULT | SUPERVISOR | ADMIN,
  iat: 1234567890,
  exp: 1234567890
}
\\\

### Role Permissions

| Endpoint | DEFAULT | SUPERVISOR | ADMIN |
|----------|---------|------------|-------|
| Create Order | Own stores only | All stores | All stores |
| List Orders | Own orders | All orders | All orders |
| Update Order | No | Yes | Yes |
| Manage Users | No | No | Yes |
| Manage Products | No | No | Yes |
| Consolidated View | No | Yes | Yes |

### Middleware Chain
1. authMiddleware - Validates JWT token
2. supervisorMiddleware - Requires SUPERVISOR or ADMIN role
3. supervisorOnlyMiddleware - Requires SUPERVISOR role only
4. adminMiddleware - Requires ADMIN role

## Technology Stack

### Frontend
- Framework: Next.js 16.2.1 (App Router)
- UI: React 19, Tailwind CSS 4
- Icons: Lucide React
- State: React Context (AuthContext)
- HTTP: Native fetch API
- Testing: Vitest, React Testing Library, MSW
- Excel: xlsx library for export

### Backend
- Framework: Fastify 5.x
- Database: SQLite via Prisma ORM
- Validation: Zod 4.x
- Auth: @fastify/jwt
- CORS: @fastify/cors
- Encryption: bcryptjs
- Testing: Vitest, Supertest

### Database
- Engine: SQLite 3
- ORM: Prisma 7.x
- Adapter: @prisma/adapter-better-sqlite3

## Key Architectural Patterns

### Service/Controller/Repository (S/C/R)
Each module follows this layered architecture:

1. Repository: Direct database operations via Prisma
2. Service: Business logic, validations, cross-cutting concerns
3. Controller: HTTP request/response handling, schema validation

### Module Structure
\\\
module/
+-- module.routes.ts     # Fastify route registration
+-- module.controller.ts # HTTP layer
+-- module.service.ts    # Business logic
+-- module.repository.ts # Data access
+-- module.schema.ts     # Zod validation
\\\

### Error Handling
- Zod validation errors (400)
- JWT verification errors (401)
- Role authorization errors (403)
- Resource not found (404)
- Global error handler in utils/error-handler.ts

### Order Export Flow
Order Created -> OrderService.create() -> Validate user store access -> Save order to database -> Trigger exportOrderToNetwork() -> Read XLSX template -> Map products to columns -> Write to network share -> Return success/failure
