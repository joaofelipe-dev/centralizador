# Tech Stack Documentation

This document outlines the complete technology stack used in this project, explaining what each technology does and why it was chosen.

---

## Frontend Stack

### Next.js 16.2.1

**What it does:** A React framework that enables server-side rendering, static site generation, and modern web application features like file-based routing and API routes.

**Why it's used:** 
- Provides excellent performance through server-side rendering and image optimization
- File-based routing system simplifies project structure
- Built-in API routes allow full-stack capabilities within a single project
- Strong ecosystem and community support with excellent developer experience

---

### React 19.2.4

**What it does:** A JavaScript library for building user interfaces, using a component-based architecture and a virtual DOM for efficient updates.

**Why it's used:**
- Declarative syntax makes UI code predictable and easier to debug
- Component reuse promotes code maintainability
- Large ecosystem of libraries and tools
- Strong industry adoption and job market demand

---

### Tailwind CSS 4

**What it does:** A utility-first CSS framework that provides low-level styling classes for rapid UI development without writing custom CSS files.

**Why it's used:**
- Zero runtime overhead - styles are generated at build time
- Consistent design system through configuration
- Rapid prototyping with utility classes
- Easy dark mode and responsive design implementation
- Tree-shaking removes unused styles automatically

---

### class-variance-authority (CVA)

**What it does:** A utility library for conditionally applying Tailwind CSS classes, especially useful for component variants (e.g., primary/secondary/error button states).

**Why it's used:**
- Type-safe variant management with TypeScript support
- Clean API for defining component variants
- Eliminates complex conditional class string logic
- Works seamlessly with Tailwind CSS and Radix UI primitives

---

### lucide-react

**What it does:** A library of clean, open-source icons built for React with consistent styling and small bundle size.

**Why it's used:**
- Clean, modern icon design aesthetic
- SVG-based (crisp on all screens)
- Comprehensive set covering common UI needs
- Tree-shakeable for optimal bundle size
- Easy to customize with Tailwind CSS

---

### react-day-picker

**What it does:** A customizable date picker component for React that follows WAI-ARIA guidelines.

**Why it's used:**
- Accessible by default (keyboard navigation, screen reader support)
- Highly customizable appearance to match design systems
- Date range selection support
- Locale-aware formatting
- Works with various date libraries (date-fns, moment, dayjs)

---

### xlsx (SheetJS)

**What it does:** A JavaScript library for reading and writing Excel files (XLSX, XLS, CSV) in the browser and Node.js.

**Why it's used:**
- Client-side Excel generation without server processing
- Reads existing Excel templates and modifies them
- Supports complex spreadsheet operations (cell references, formulas)
- Exports data in multiple formats
- Handles large datasets efficiently

---

### date-fns

**What it does:** A lightweight, modular date utility library for JavaScript.

**Why it's used:**
- Tree-shakeable (only import what's needed)
- Consistent API across date operations
- No dependency on native Date object mutations
- Locale support for internationalization
- Composable functions for complex date logic

---

## Backend Stack

### Fastify 5.8.4

**What it does:** A fast, low-overhead web framework for Node.js focused on developer experience and performance.

**Why it's used:**
- Industry-leading performance (requests per second)
- Built-in validation through schemas
- Plugin system for modular architecture
- Excellent TypeScript support
- JSON schema support for automatic API documentation
- Built-in logging with Pino (low overhead)

---

### Prisma 7.5.0

**What it does:** A next-generation ORM (Object-Relational Mapping) that provides type-safe database access with an intuitive data model language.

**Why it's used:**
- Type-safe database queries generated from schema
- Automatic migrations with version control
- Intuitive schema definition language
- Works with multiple databases (PostgreSQL, MySQL, SQLite)
- Excellent developer experience with Prisma Studio
- Supports raw SQL when needed

---

### better-sqlite3 (via Prisma adapter)

**What it does:** A synchronous SQLite driver for Node.js that provides excellent performance for local development and small-scale deployments.

**Why it's used:**
- SQLite provides zero-configuration database setup
- Synchronous API simplifies code flow
- better-sqlite3 is the fastest SQLite driver for Node
- Prisma adapter enables full ORM capabilities
- Perfect for local development and single-server deployments
- Data stored in simple file, easy to backup/migrate

---

### @fastify/jwt

**What it does:** JWT (JSON Web Token) authentication plugin for Fastify.

**Why it's used:**
- Stateless authentication ideal for scalable APIs
- Token-based (no session storage needed)
- Signed tokens prevent tampering
- Token expiration for security
- Works with Fastify's plugin system
- Built-in verification middleware

---

### bcryptjs

**What it does:** A library for hashing passwords using the bcrypt algorithm.

**Why it's used:**
- Industry-standard password hashing
- Salt rounds prevent rainbow table attacks
- Adaptive cost factor (can increase over time)
- No native dependencies (pure JavaScript)
- Secure against timing attacks
- Required for compliance with security best practices

---

### Zod 4.3.6

**What it does:** A TypeScript-first schema validation library with static type inference.

**Why it's used:**
- Runtime validation matches compile-time types
- Chainable validation methods
- Type inference reduces code duplication
- Custom error messages
- Comprehensive validation primitives
- Works with forms, APIs, and configuration
- No external dependencies

---

## Testing Stack

### Vitest

**What it does:** A Vite-native unit testing framework that's compatible with Jest API.

**Why it's used:**
- Native ESM support (no transpilation needed)
- Lightning-fast HMR during test development
- Compatible with Jest API (easy migration)
- TypeScript support out of the box
- Watch mode for TDD workflow
- Built-in coverage reporting

---

### MSW (Mock Service Worker)

**What it does:** API mocking library that intercepts requests at the network level using Service Worker technology.

**Why it's used:**
- Tests run against realistic API behavior
- No actual network requests during tests
- Shareable mock definitions between dev and tests
- Works in both browser and Node.js
- Precise control over responses and timing
- Enables testing edge cases easily

---

### @testing-library (React Testing Library)

**What it does:** A library for testing React components by simulating user interactions with the DOM.

**Why it's used:**
- Tests focus on user behavior, not implementation
- Accessible by default (tests keyboard/mouse interactions)
- Queries mimic real browser behavior
- Encourages accessible component design
- Works with any rendering library (React, Preact, etc.)
- No test utilities or implementation details needed

---

### Happy DOM

**What it does:** A JavaScript implementation of a web browser's DOM and HTML parser for Node.js.

**Why it's used:**
- Fast DOM implementation for testing
- Works without a browser (headless testing)
- Lighter weight than JSDOM
- Compatible with testing-library
- Supports web components

---

## Development Tools

### TypeScript 6

**What it does:** A typed superset of JavaScript that compiles to plain JavaScript.

**Why it's used:**
- Catch errors at compile time
- Better IDE support (autocomplete, refactoring)
- Self-documenting code through types
- Safer refactoring
- Required for large-scale applications

---

### ESLint 9

**What it does:** A static code analysis tool that identifies problematic patterns in JavaScript/TypeScript code.

**Why it's used:**
- Catches bugs before runtime
- Enforces consistent code style
- Configurable rules for team standards
- Integrates with modern editors
- Pre-commit hook integration

---

### tsx

**What it does:** A TypeScript and ESM executor for Node.js without compilation step.

**Why it's used:**
- Run TypeScript files directly
- Fast startup (no compilation)
- Supports ESM and CommonJS
- Used for development server and scripts

---

## Architecture Pattern

### MVC-like Structure (Backend)

The backend follows a modular MVC-like pattern:

```
modules/
  auth/          # Authentication module
  user/          # User management module
  order/         # Order management module
  product/       # Product catalog module
  store/         # Store management module
  category/      # Category management module
```

Each module contains:
- **Routes** - HTTP endpoint definitions
- **Controller** - Request/response handling
- **Service** - Business logic
- **Repository** - Database operations
- **Schema** - Zod validation schemas

---

## Summary

This tech stack is chosen to provide:
- **Performance**: Fastify + Prisma + SQLite for rapid API responses
- **Developer Experience**: TypeScript + ESLint + Vitest for productive development
- **Reliability**: Zod validation + bcrypt for secure, validated data
- **Scalability**: Stateless JWT auth + modular architecture
- **Maintainability**: Clear separation of concerns + comprehensive testing
