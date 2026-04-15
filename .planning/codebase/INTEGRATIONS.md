# Integration Documentation

This document explains how the different parts of the application communicate and work together.

---

## 1. Frontend-Backend Communication

### API Layer (`src/lib/api.js`)

The frontend communicates with the backend exclusively through a centralized API client module.

```
Frontend (Next.js)  ──────fetch()──────>  Backend (Fastify)
```

**Architecture:**

```javascript
// src/lib/api.js

const API_URL = 'http://192.168.0.245:3333';

export async function apiRequest(endpoint, options = {}) {
  // 1. Get JWT token from localStorage
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }

  // 2. Build headers with auth token
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // 3. Make fetch request
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // 4. Parse JSON response
  const data = await response.json();

  // 5. Handle errors or return data
  if (!response.ok) {
    throw new Error(data.message);
  }
  return data;
}
```

**API Methods:**

| Method | Purpose | Auth Required |
|--------|---------|---------------|
| `api.login()` | Authenticate user | No |
| `api.register()` | Create new user | No |
| `api.getMe()` | Get current user info | Yes |
| `api.getProducts()` | List products | Yes |
| `api.createProduct()` | Create product | Yes |
| `api.getOrders()` | List orders with filters | Yes |
| `api.createOrder()` | Create new order | Yes |
| `api.getConsolidatedOrders()` | Get aggregated order data | Yes (Supervisor) |
| `api.getStores()` | List stores | Yes |
| `api.getCategories()` | List categories | Yes |

**Request Flow:**

1. User action triggers API call
2. `apiRequest()` retrieves JWT from localStorage
3. Request sent with `Authorization: Bearer <token>` header
4. Backend validates JWT and processes request
5. Response returned as JSON
6. Frontend updates UI based on response

---

## 2. Database Connection (Prisma + SQLite)

### Architecture Overview

```
Next.js Frontend     ──────>     Fastify API     ──────>     Prisma ORM     ──────>     SQLite Database
                                          │
                                          └── dev.db (file)
```

### Prisma Configuration

**Schema Definition** (`api/prisma/schema.prisma`):

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "sqlite"
}
```

### Connection Setup (`api/src/lib/prisma.ts`)

```typescript
import { PrismaClient } from '../generated/prisma/client.js'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

// SQLite database file path
const dbPath = join(__dirname, '../../dev.db');

// Create adapter for better-sqlite3
const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`
})

// Create Prisma client with adapter
export const prisma = new PrismaClient({ adapter })
```

### Why better-sqlite3 Adapter?

- **Performance**: Synchronous operations are faster for SQLite
- **Compatibility**: Works seamlessly with Prisma's query engine
- **Simplicity**: Single-file database, easy to backup
- **Prisma 7 Feature**: Uses new adapter API for database drivers

### Database Models

| Model | Description | Relations |
|-------|-------------|-----------|
| `User` | System users with roles | stores, orders, products |
| `Store` | Physical store locations | users, orders |
| `Category` | Product categories | products |
| `Product` | Items available for ordering | category, user, orderItems |
| `Order` | Customer orders | store, user, items |
| `OrderItem` | Individual items in an order | order, product |

### Repository Pattern

Database access is abstracted through repositories:

```typescript
// api/src/modules/order/order.repository.ts
export class OrderRepository {
  async create(userId: string, data: CreateOrderInput) {
    return prisma.order.create({
      data: {
        userId,
        storeId: data.storeId,
        orderDate,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            currentStock: item.currentStock,
          })),
        },
      },
      include: {
        items: { include: { product: { include: { category: true } } } },
        store: true,
      },
    })
  }
}
```

---

## 3. Authentication Flow (JWT via @fastify/jwt)

### Complete Auth Flow

```
┌─────────────┐     1. POST /auth/login      ┌─────────────┐
│             │  ─────────────────────────>  │             │
│   Frontend  │     2. Validate creds        │   Backend   │
│   (React)   │  <─────────────────────────  │  (Fastify)  │
│             │     3. JWT token returned    │             │
└─────────────┘                              └─────────────┘
       │                                            │
       │  4. Store token in localStorage           │
       ▼                                            │
┌─────────────┐                                    │
│ localStorage│                                    │
│  {token}    │                                    │
└─────────────┘                                    │
       │                                            │
       │  5. Subsequent requests include header    │
       ▼                                            │
  Authorization: Bearer <token> ─────────────────►  │
```

### Backend JWT Setup (`api/src/app.ts`)

```typescript
import fastify from 'fastify'
import jwt from '@fastify/jwt'

export const app = fastify({ logger: true })

// Register JWT plugin with secret
app.register(jwt, {
  secret: process.env.JWT_SECRET || 'supersecretkey',
})
```

### Login Process

**1. User submits credentials:**

```typescript
// Frontend (AuthContext.jsx)
async function login(username, password) {
  const { user, token } = await api.login({ username, password });
  localStorage.setItem('token', token);
  setUser(user);
}
```

**2. Backend validates and generates token:**

```typescript
// api/src/modules/auth/auth.controller.ts
async login(request, reply) {
  const { user } = await this.authService.authenticate(data);
  
  // Generate JWT with user ID and role
  const token = await reply.jwtSign({ 
    sub: user.id, 
    role: user.role 
  });
  
  return reply.status(200).send({ user, token });
}
```

**3. Token payload structure:**

```json
{
  "sub": "user-uuid-here",
  "role": "DEFAULT" | "SUPERVISOR" | "ADMIN",
  "iat": 1234567890,
  "exp": 1234654290
}
```

### Password Security

Passwords are hashed using bcrypt before storage:

```typescript
// api/src/modules/user/user.service.ts
async createUser(data: CreateUserInput) {
  // Hash password with salt rounds
  const hashedPassword = await bcrypt.hash(data.password, 10);
  
  return this.userRepository.create({
    ...data,
    password: hashedPassword,
  });
}
```

**Verification during login:**

```typescript
// api/src/modules/auth/auth.service.ts
async authenticate(data: LoginInput) {
  const user = await this.userRepository.findByUsername(data.username);
  
  const isPasswordValid = await bcrypt.compare(data.password, user.password);
  
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }
  
  return { user };
}
```

### Protected Routes

**Auth Middleware** (`api/src/middlewares/auth.ts`):

```typescript
// Basic auth - requires valid JWT
export async function authMiddleware(request, reply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }
}

// Supervisor+ auth - requires specific roles
export async function supervisorMiddleware(request, reply) {
  try {
    await request.jwtVerify()
    
    const user = request.user as { role: UserRole, sub: string }
    
    if (user.role !== 'SUPERVISOR' && user.role !== 'ADMIN') {
      return reply.status(403).send({ message: 'Forbidden' })
    }
  } catch (err) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }
}
```

**Usage in Routes:**

```typescript
// api/src/modules/order/order.routes.ts
export async function orderRoutes(app: FastifyInstance) {
  // Anyone authenticated can create orders
  app.post('/', { preHandler: [authMiddleware] }, controller.create)
  
  // Only supervisors can access consolidated view
  app.get('/consolidated', { preHandler: [supervisorMiddleware] }, controller.consolidated)
}
```

### Frontend Auth Context

**AuthContext** (`src/context/AuthContext.jsx`):

```javascript
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, verify token and fetch user
  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { user } = await api.getMe();
          setUser(user);
        } catch (error) {
          localStorage.removeItem('token'); // Clear invalid token
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

## 4. Excel Export (xlsx Library)

### Export Flow

```
User creates order
       │
       ▼
OrderService.create()
       │
       ├──► OrderRepository.create() (saves to SQLite)
       │
       └──► exportOrderToNetwork() (generates Excel)
                    │
                    ├── 1. Read template (Default.xlsx)
                    ├── 2. Fill in order data
                    └── 3. Save to network path
```

### Template-Based Export

**Template Location:** `public/Default.xlsx`

The export uses a pre-designed Excel template that follows CEASA (Central de Abastecimento) format:

```typescript
// api/src/lib/order-export.ts

export async function exportOrderToNetwork(order, storeName, storeCode) {
  // 1. Load template from file
  const templateBuffer = fs.readFileSync(DEFAULT_TEMPLATE_PATH);
  const wb = XLSX.read(templateBuffer);
  const ws = wb.Sheets[wb.SheetNames[0]];
  
  // 2. Convert to array for manipulation
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  
  // 3. Update header with date and store
  data[0] = [formattedDate, storeName];
  
  // 4. Map order items to template columns
  // Columns: Legumes(0-2), Frutas(3-5), Verduras(6-8)
  order.items.forEach(item => {
    const category = item.product.category.name;
    // Map to appropriate column based on category
  });
  
  // 5. Write to network share
  const filePath = path.join(EXPORT_PATH, filename);
  XLSX.writeFile(newWb, filePath);
}
```

### Template Structure

The Excel template has this layout:

| Column 0 | Column 1 | Column 2 | Column 3 | Column 4 | Column 5 | Column 6 | Column 7 | Column 8 |
|----------|----------|----------|----------|----------|----------|----------|----------|----------|
| Qtd Leg | Produto | Estoque | Qtd Fruta | Produto | Estoque | Qtd Verd | Produto | Estoque |

### Export Integration

**Automatic export on order creation:**

```typescript
// api/src/modules/order/order.service.ts
async create(userId: string, role: UserRole, data: CreateOrderInput) {
  const order = await this.orderRepository.create(userId, data);
  
  // Automatically export to network share
  if (order && order.store) {
    const exportResult = await exportOrderToNetwork(
      order, 
      order.store.name,
      order.store.code
    );
    
    if (!exportResult.success) {
      console.error(`Failed to export: ${exportResult.error}`);
    }
  }
  
  return order;
}
```

### Configuration

```typescript
const EXPORT_PATH = process.env.ORDER_EXPORT_PATH || '\\\\192.168.0.247\\onedrive\\Enviados';
const DEFAULT_TEMPLATE_PATH = path.join(process.cwd(), '..', 'public', 'Default.xlsx');
```

### File Naming

Exported files follow this naming convention:

```
{STORE_CODE}_{DD}{MM}{YYYY}.xlsx

Example: PT_15042026.xlsx (for store PT on April 15, 2026)
```

---

## 5. Request/Response Flow Examples

### Create Order Flow

```
Frontend                    Backend                          Database
   │                           │                                │
   │  POST /orders             │                                │
   │  { storeId, items[] }     │                                │
   │──────────────────────────►│                                │
   │                           │  Validate JWT                  │
   │                           │──────────────────────────────►│
   │                           │  Check user store access       │
   │                           │──────────────────────────────►│
   │                           │  Create order + items          │
   │                           │──────────────────────────────►│
   │                           │  Return created order          │
   │                           │◄───────────────────────────────│
   │                           │  Export to Excel               │
   │                           │──────────────────────────────►│
   │                           │  (writes to network share)     │
   │                           │                                │
   │  201 Created              │                                │
   │  { order, exportStatus }   │                                │
   │◄──────────────────────────│                                │
   │                           │                                │
```

### Get Consolidated Orders (Supervisor)

```
Frontend (Supervisor)        Backend                          Database
   │                           │                                │
   │  GET /orders/consolidated  │                                │
   │  ?date=2026-04-15          │                                │
   │──────────────────────────►│                                │
   │                           │  Verify supervisor JWT         │
   │                           │                                │
   │                           │  Query order items             │
   │                           │──────────────────────────────►│
   │                           │  Group by store & product      │
   │                           │  Calculate totals              │
   │                           │◄───────────────────────────────│
   │                           │                                │
   │  200 OK                   │                                │
   │  { products, stores,      │                                │
   │    matrix }               │                                │
   │◄──────────────────────────│                                │
```

---

## 6. Environment Configuration

### Frontend Environment

```env
# No environment variables needed (uses hardcoded IP for dev)
# API_URL = 'http://192.168.0.245:3333' (src/lib/api.js)
```

### Backend Environment

```env
# .env in api/
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL=file:./dev.db
PORT=3333
ORDER_EXPORT_PATH=\\\\192.168.0.247\\onedrive\\Enviados
DEFAULT_TEMPLATE_PATH=../public/Default.xlsx
```

---

## 7. Security Considerations

### What's Protected

- All API endpoints (except `/auth/login`, `/auth/register`) require JWT
- Role-based access control (DEFAULT, SUPERVISOR, ADMIN)
- Password hashing with bcrypt (never stored in plain text)
- JWT expiration for session management

### Security Best Practices in Use

1. **Input Validation**: Zod schemas validate all API inputs
2. **SQL Injection Prevention**: Prisma ORM handles escaping
3. **XSS Prevention**: React escapes content by default
4. **CORS**: Fastify CORS plugin configured for allowed origins
5. **Error Messages**: Generic errors in production (no stack traces)

---

## Summary

| Integration | Technology | How It Works |
|-------------|------------|-------------|
| Frontend-Backend | fetch API + JWT | Centralized api.js module with token from localStorage |
| Database | Prisma + SQLite | ORM with better-sqlite3 adapter, repository pattern |
| Authentication | @fastify/jwt | Stateless JWT tokens with role-based middleware |
| Excel Export | xlsx library | Template-based export to network share |
