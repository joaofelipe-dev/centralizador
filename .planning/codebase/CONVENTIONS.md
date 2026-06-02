# Code Conventions

This document outlines the code conventions and patterns used across the Centralizador project.

## Table of Contents

- [Project Structure](#project-structure)
- [Frontend Patterns (Next.js)](#frontend-patterns-nextjs)
- [Backend Patterns (Fastify)](#backend-patterns-fastify)
- [API Route Structure](#api-route-structure)
- [Naming Conventions](#naming-conventions)
- [CSS/Styling Approach](#cssstyling-approach)

---

## Project Structure

The project is organized as a monorepo with two main applications:

`
centralizador/
├── src/                    # Next.js frontend application
│   ├── app/               # Next.js App Router
│   ├── components/        # React components
│   ├── lib/               # Utilities and API client
│   ├── __tests__/         # Frontend tests
│   └── __mocks__/         # Frontend mock handlers
├── api/                   # Fastify backend application
│   ├── src/
│   │   ├── modules/       # Feature modules (auth, order, user, etc.)
│   │   ├── middlewares/   # Express/Fastify middlewares
│   │   ├── lib/          # Utilities and helpers
│   │   ├── types/        # TypeScript type definitions
│   │   ├── __tests__/    # Backend tests
│   │   └── server.ts      # Entry point
│   └── prisma/            # Database schema and migrations
└── package.json           # Root package with dev scripts
`

---

## Frontend Patterns (Next.js)

### Component Organization

Components are organized in feature-based folders within src/components/:

`
src/components/
├── Button/
│   ├── Button.jsx         # Main button component
│   └── ButtonVariants.jsx # CVA variant definitions
├── Header/
│   ├── Header.jsx         # Header component with sub-components
│   ├── HeaderNav.jsx
│   └── HeaderLogo.jsx
├── DateInput/
│   └── DateInput.tsx
├── Admin/                  # Admin-related components
│   ├── OrderEditModal.jsx
│   ├── OrderList.jsx
│   ├── PivotTable.jsx
│   ├── StatsGallery.jsx
│   └── TeamManagement.jsx
└── ui/                    # Reusable UI primitives
    ├── button.jsx
    ├── calendar.jsx
    └── popover.jsx
`

### Component Patterns

#### 1. Simple Components with Composition

Components like Header use composition pattern with sub-components.

Key patterns:
- Export main component with displayName
- Create sub-components as properties (Header.Logo, Header.Nav)
- Use composition pattern with fallback children

#### 2. Button Component with CVA

See src/components/Button/Button.jsx and src/components/Button/ButtonVariants.jsx.

Key patterns:
- Use React.forwardRef for proper ref handling
- Use class-variance-authority (CVA) for variant management
- Export both component and buttonVariants function
- Use cn() utility for className merging

#### 3. Complex Forms with React.memo

See src/components/OrderForm.jsx for a complex form example.

Key patterns:
- Use React.memo for performance optimization
- Use React.useCallback for event handlers
- DisplayName for component identification

### File Naming Conventions

| Type | Convention | Example |
|------|-------------|---------|
| Components | PascalCase | Button.jsx, Header.jsx |
| Utilities | camelCase | pi.ts, utils.ts |
| Types | PascalCase | order.ts, user.ts |
| Test files | .test.ts or .test.tsx | uth.service.test.ts |
| Config files | camelCase/kebab-case | itest.config.ts |

---

## Backend Patterns (Fastify)

### Service/Controller/Repository Separation

The backend follows a three-layer architecture pattern:

#### 1. Repository Layer

Handles direct database interactions using Prisma.

See pi/src/modules/order/order.repository.ts for an example.

Key patterns:
- Direct Prisma client usage via prisma singleton
- Methods for each database operation (create, list, update, delete)
- Transaction support with prisma.
- Include related data with include option

#### 2. Service Layer

Contains business logic and orchestration.

See pi/src/modules/order/order.service.ts for an example.

Key patterns:
- Dependency injection via constructor
- Authorization checks before business logic
- Coordinate multiple repositories
- Handle post-creation side effects

#### 3. Controller Layer

Handles HTTP request/response handling.

See pi/src/modules/order/order.controller.ts for an example.

Key patterns:
- Extract user info from request (userId, role)
- Parse and validate request body
- Call service methods
- Return appropriate HTTP status codes
- Error handling with try/catch

#### 4. Routes Layer

Wires together the controller, service, and repository.

See pi/src/modules/order/order.routes.ts for an example.

Key patterns:
- Instantiate all layers in the route file
- Use .bind(controller) for method binding
- Apply middleware via preHandler option
- Define route patterns with path parameters

### Module Structure

Each feature module follows the Service/Controller/Repository/Schema (S/C/R/S) pattern:

`
api/src/modules/{module}/
├── {module}.routes.ts      # Route definitions
├── {module}.controller.ts  # Request/response handling
├── {module}.service.ts     # Business logic
├── {module}.repository.ts  # Data access
└── {module}.schema.ts      # Zod validation schemas
`

**All modules now follow this pattern:**
- auth/, user/, product/, category/, store/, order/
- purchases/, sales/, movements/, stock-counts/

---

## API Route Structure

### Frontend API Client

The frontend uses a centralized API client pattern located in src/lib/api.ts.

### Backend Route Patterns

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /auth/register | Register new user | No |
| POST | /auth/login | Login user | No |
| GET | /auth/me | Get current user | Yes |
| POST | /orders | Create order | Yes |
| GET | /orders | List orders | Yes |
| GET | /orders/consolidated | Consolidated view | Supervisor |
| PUT | /orders/:id | Update order | Supervisor |
| PATCH | /orders/:id/status | Update order status | Supervisor |
| GET | /stores | List stores | Yes |
| GET | /products | List products | Yes |
| GET | /categories | List categories | Yes |

---

## Naming Conventions

### TypeScript/JavaScript

| Element | Convention | Example |
|---------|-------------|---------|
| Files | PascalCase for components, camelCase for utilities | Button.jsx, pi.ts |
| Classes | PascalCase | OrderService, UserRepository |
| Interfaces | PascalCase | CreateOrderInput, User |
| Functions | camelCase | createUser, getOrderById |
| Constants | UPPER_SNAKE_CASE | MAX_RETRY_COUNT, API_URL |
| Enums | PascalCase | UserRole.ADMIN |
| React Components | PascalCase | Button, OrderForm |

### Database (Prisma)

| Element | Convention | Example |
|---------|-------------|---------|
| Models | PascalCase | Order, User, Store |
| Fields | snake_case | orderDate, createdAt |
| Relations | PascalCase (model names) | orders, items |

---

## CSS/Styling Approach

### Tailwind CSS v4

The project uses Tailwind CSS v4 with the new @theme directive.

See src/app/globals.css for the full implementation.

### CSS Variables

Custom properties defined in :root:

- --background: Dark theme background
- --foreground: Text color
- --primary: Primary brand color
- --radius: Border radius base

### Utility Patterns

#### Glass Effect (Common Pattern)

Defined in globals.css:

- .glass: Subtle translucent background with blur
- .glass-card: Gradient-based glass card with enhanced shadow

#### Animations

- .animate-slide-up: Slide up animation for page transitions

### Tailwind Usage Patterns

- Use arbitrary values for one-off styles: h-[50px], w-[200px]
- Use responsive prefixes: grid-cols-1 lg:grid-cols-3
- Use color with opacity: g-primary/90, 	ext-white/40
- Use state variants: hover:bg-white/10, ocus:ring-primary
- Use group variants: group-hover:text-primary

---

## Import Aliases

The project uses path aliases configured in both frontend and backend:

### Frontend (Next.js)

In 	sconfig.json:
`json
{
   compilerOptions: {
    @/*: [./src/*]
  }
}
`

### Backend (Fastify)

In pi/tsconfig.json:
`json
{
  compilerOptions: {
    @/*: [./src/*]
  }
}
`

Usage example:
`	ypescript
import { Button } from @/components/Button/Button
import { prisma } from @/lib/prisma
`

---

## Error Handling

### Backend

- Use try/catch in controllers
- Return appropriate HTTP status codes (400, 401, 403, 404, 500)
- Use custom error handler middleware

### Frontend

- Handle errors in components with state (error, isError)
- Display user-friendly error messages
- Use loading states for async operations

---

## Testing Patterns

Tests are written alongside the code in __tests__ directories:

- Frontend: src/__tests__/
- Backend: pi/src/__tests__/

See [TESTING.md](./TESTING.md) for detailed testing conventions.
