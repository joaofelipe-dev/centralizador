# Centralizador de Pedidos - Documentação do Projeto

Este é um sistema de centralização de pedidos de compra que permite gerenciar compras e suprimentos para múltiplas lojas através de uma plataforma integrada.

## 🏗️ Arquitetura do Projeto

O projeto segue uma arquitetura **monorepo** com dois aplicativos principais:

```
centralizador/
├── Frontend (Next.js 16.2.1)
│   └── src/
├── Backend (Fastify API)
│   └── api/
└── Configurações compartilhadas
```

### Frontend - Next.js com React 19

**Localização**: `src/` (não usa a estrutura padrão `app/`)

**Stack Tecnológico**:
- Next.js 16.2.1 (App Router)
- React 19.2.4
- Tailwind CSS v4 com @tailwindcss/postcss
- React Compiler (babel-plugin-react-compiler)
- Lucide React (ícones)
- clsx e tailwind-merge (utility functions)

**Estrutura de Diretórios**:
```
src/
├── app/                    # Rotas da aplicação (Next.js App Router)
│   ├── layout.js          # Layout raiz com AuthProvider
│   ├── page.jsx           # Home com onboarding
│   ├── login/page.jsx     # Página de login
│   ├── pedidos/page.jsx   # Lista de pedidos do usuário
│   └── admin/             # Painel administrativo
│       ├── page.jsx       # Dashboard admin
│       └── pedidos/       # Gerenciamento de pedidos por admin
├── components/             # Componentes React reutilizáveis
│   ├── Header/            # Cabeçalho com logo e navegação
│   ├── Button/            # Componente Button com variantes
│   ├── Admin/             # Componentes específicos do painel admin
│   ├── OrderForm.jsx      # Formulário de criação de pedidos
│   ├── StoreSelector.jsx  # Seletor de lojas
│   ├── Onboarding.jsx     # Fluxo de onboarding inicial
│   └── Footer.jsx         # Rodapé
├── context/                # Context API
│   └── AuthContext.jsx    # Gerenciamento de autenticação
├── lib/                    # Utilitários
│   ├── api.js             # Cliente HTTP para API (configuração centralizada)
│   └── utils.js           # Funções utilitárias
├── constants/
│   └── stores.js          # Dados das lojas
└── globals.css            # Estilos globais com Tailwind
```

### Backend - Fastify API

**Localização**: `api/`

**Stack Tecnológico**:
- Fastify 5.8.4 (framework web)
- Prisma 7.5.0 (ORM)
- SQLite com adapter Better SQLite3 (`@prisma/adapter-better-sqlite3`)
- JWT (`@fastify/jwt`) para autenticação
- CORS (`@fastify/cors`)
- Zod (validação de schemas)
- bcryptjs (hash de senhas)
- TypeScript ~6.0.3

**Estrutura de Diretórios**:
```
api/
├── src/
│   ├── app.ts             # Configuração da aplicação Fastify
│   ├── server.ts          # Servidor (porta 3333)
│   ├── modules/           # Módulos por feature
│   │   ├── auth/          # Autenticação (login, registro)
│   │   ├── user/          # Gerenciamento de usuários
│   │   ├── product/       # Gerenciamento de produtos
│   │   ├── category/      # Categorias de produtos
│   │   ├── store/         # Lojas
│   │   ├── order/         # Pedidos (core do sistema)
│   │   ├── purchases/     # Compras (S/C/R completo)
│   │   ├── sales/         # Vendas (S/C/R completo)
│   │   ├── movements/     # Movimentações de estoque (S/C/R completo)
│   │   └── stock-counts/  # Contagem de estoque (S/C/R completo)
│   ├── middlewares/       # Middleware (auth, error handling)
│   ├── utils/             # Funções utilitárias
│   ├── lib/               # Bibliotecas
│   └── generated/         # Gerado automaticamente
├── prisma/
│   ├── schema.prisma      # Schema do banco de dados
│   ├── migrations/        # Migrações do banco
│   └── seed.ts            # Script para popular dados iniciais
└── dev.db                 # Banco de dados SQLite (desenvolvimento)
```

## 🔐 Fluxo de Autenticação

### Sistema de Autenticação

**Tipo**: JWT (JSON Web Tokens) com autenticação baseada em header Bearer

**Processo**:

1. **Registro/Login** (Frontend → Backend)
   - Usuário acessa `/login`
   - Envia credenciais para `POST /auth/login` ou `POST /auth/register`
   - Backend valida com bcryptjs e retorna `{ user, token }`

2. **Armazenamento de Token** (Frontend)
   - Token salvo em `localStorage` com chave `'token'`
   - Recuperado automaticamente no contexto `AuthContext`

3. **Solicitações Autenticadas** (Frontend)
   - Todos os requests via `api.js` incluem header: `Authorization: Bearer {token}`
   - Se token inválido, é removido do localStorage

4. **Verificação de Sessão** (Frontend)
   - `AuthContext` carrega user ao montar via `GET /auth/me`
   - Se falhar, token é removido e usuário redirecionado

**Contexto de Autenticação** (`src/context/AuthContext.jsx`):
```javascript
{
  user: {
    id: string,
    username: string,
    email: string,
    isAdmin: boolean,
    storeId?: string
  },
  loading: boolean,
  login(username, password): Promise<{success, message?>>,
  logout(): void
}
```

## 📡 Comunicação Frontend-Backend

### Configuração da API

**URL da API**: Configurada via `NEXT_PUBLIC_API_URL` (env var), fallback para `http://localhost:3333`

**Cliente HTTP**: Fetch API nativa do navegador

**Endpoints Principais**:

```javascript
// Autenticação
POST /auth/login          // Faz login
POST /auth/register       // Cria novo usuário
GET  /auth/me            // Retorna dados do usuário logado

// Usuários
GET    /users            // Lista usuários
POST   /users            // Criar usuário
PATCH  /users/{id}       // Atualizar usuário
DELETE /users/{id}       // Deletar usuário

// Produtos
GET    /products         // Lista produtos
POST   /products         // Criar produto
PATCH  /products/{id}    // Atualizar produto
DELETE /products/{id}    // Deletar produto

// Categorias
GET /categories          // Lista categorias de produtos

// Lojas
GET /stores             // Lista lojas

// Pedidos (Core)
GET    /orders          // Lista pedidos (com filtro de data)
POST   /orders          // Criar novo pedido
PUT    /orders/{id}     // Atualizar pedido
GET    /orders/consolidated // Relatório consolidado de pedidos
```

### Tratamento de Erros

- **Resposta com sucesso**: Status 200-201, JSON com dados
- **Erro de conexão**: Exibe "Não foi possível conectar ao servidor"
- **Erro da API**: Status ≥ 400, contém `message` em JSON
- **Logout automático**: Status 401 remove token de localStorage

## 🎯 Fluxos Principais da Aplicação

### 1️⃣ Onboarding (Primeira Visita)

**Caminho**: `/` → `Onboarding.jsx`

**Etapas**:
1. Bem-vindo ao Central Pedidos
2. Selecione sua Loja
3. Monte sua Lista
4. Envie o Pedido

Ao completar: `localStorage.setItem('onboarding_completed', 'true')` → Redireciona para `/pedidos`

### 2️⃣ Criação de Pedido

**Caminho**: `/pedidos` → Seleciona loja → `OrderForm.jsx`

**Processo**:
1. Carrega categorias e produtos de `GET /categories`
2. Usuário seleciona estoque atual e quantidade desejada
3. Revisão antes de enviar
4. `POST /orders` com:
   ```javascript
   {
     storeId: string,
     items: [
       { productId, quantity, currentStock }
     ]
   }
   ```
5. Sucesso: Limpa carrinho, mostra mensagem de confirmação

### 3️⃣ Painel Administrativo

**Caminho**: `/admin` (apenas users com `isAdmin: true`)

**Funcionalidades**:
- **Dashboard**: Estatísticas e resumo de pedidos
- **Gerenciamento de Pedidos**: Listar, editar, atualizar status
- **Gerenciamento de Usuários**: CRUD de usuários
- **Gerenciamento de Produtos**: CRUD com categorias
- **Revisão de Produtos**: Análise de produtos (feature recente)

## 💾 Estrutura do Banco de Dados (Prisma)

**ORM**: Prisma com SQLite (adapter Better SQLite3)

**Modelos Principais**:

```prisma
// Usuário - Pessoa que acessa o sistema
model User {
  id        String
  username  String (único)
  email     String (único)
  password  String (hash bcrypt)
  isAdmin   Boolean (permissões admin)
  storeId   String (FK para Store - pode ser nulo)
  orders    Order[] (relação 1:N)
}

// Loja - Unidade que recebe pedidos
model Store {
  id        String
  name      String
  address   String
  users     User[] (relação 1:N)
  orders    Order[] (relação 1:N)
  products  Product[] (relação 1:N)
}

// Categoria - Agrupamento de produtos
model Category {
  id        String
  name      String (Legumes, Frutas, Temperos, etc.)
  products  Product[] (relação 1:N)
}

// Produto - Item que pode ser pedido
model Product {
  id          String
  name        String
  categoryId  String (FK para Category)
  category    Category
  storeId     String (FK para Store - pode variar por loja)
  store       Store
  orderItems  OrderItem[] (relação 1:N)
}

// Pedido - Solicitação de compra
model Order {
  id        String
  userId    String (FK para User)
  user      User
  storeId   String (FK para Store)
  store     Store
  items     OrderItem[] (relação 1:N)
  status    String (pending, confirmed, completed, cancelled)
  createdAt DateTime
  updatedAt DateTime
}

// Item do Pedido - Linha individual do pedido
model OrderItem {
  id            String
  orderId       String (FK para Order)
  order         Order
  productId     String (FK para Product)
  product       Product
  quantity      Int (quantidade pedida)
  currentStock  Int (estoque atual informado)
}
```

## 🎨 Design e Componentes

**Design System**: Dark mode premium com Tailwind CSS v4

**Paleta de Cores**:
- `bg-background`: Fundo principal (#050505)
- `text-foreground`: Texto padrão
- `text-primary`: Cor de destaque (azul/cyan)
- `text-muted-foreground`: Texto secundário
- `bg-white/5, bg-white/10`: Destaques sutis

**Componentes Principais**:

1. **Button.jsx**: Componente reutilizável com variantes (default, outline, ghost)
2. **Header.jsx**: Cabeçalho com logo, navegação e links de admin
3. **OrderForm.jsx**: Formulário complexo com carrinho, revisão e submissão
4. **StoreSelector.jsx**: Seletor de lojas com grid responsivo
5. **Admin Components**:
   - `StatsGallery.jsx`: Widgets de estatísticas
   - `OrderList.jsx`: Tabela de pedidos
   - `OrderEditModal.jsx`: Modal para editar pedidos
   - `TeamManagement.jsx`: Gerenciamento de usuários
   - `PivotTable.jsx`: Tabela pivô para análise

## 🔄 Arquitetura do Backend (Padrões)

### Padrão de Módulos

Cada feature (auth, users, orders, etc.) segue a mesma estrutura:

```
module-name/
├── {module}.controller.ts   # Handler das rotas
├── {module}.service.ts      # Lógica de negócio
├── {module}.repository.ts   # Acesso ao banco (Prisma)
├── {module}.routes.ts       # Definição de rotas
└── {module}.schema.ts       # Validação com Zod
```

**Fluxo**: Route → Controller → Service → Repository → Prisma

### Exemplo: Criar Pedido

```typescript
// routes: POST /orders → controller.create()
// controller: Valida com schema, chama service
// service: Aplica regras de negócio (permissões, validações)
// repository: Salva no banco via Prisma
// response: { id, storeId, items, status, createdAt }
```

### Middleware de Autenticação

Arquivo: `api/src/middlewares/auth.js`

- Valida token JWT do header `Authorization: Bearer {token}`
- Decodifica e injeta `user` (sub, isAdmin) no request
- Rotas protegidas registram este middleware com `protectedApp.addHook('preHandler', authMiddleware)`

## ⚙️ Configurações Importantes

### Frontend

**Arquivo**: `src/lib/api.js`

- URL da API configurada via `NEXT_PUBLIC_API_URL` (env var)
- Fallback automático para `http://localhost:3333` em desenvolvimento
- Token enviado automaticamente em todo request autenticado

**Arquivo**: `next.config.mjs`

- Configuração mínima do Next.js

### Backend

**Arquivo**: `api/.env`

```
DATABASE_URL="file:dev.db"
JWT_SECRET="your-secret-key-here"  # OBRIGATÓRIO: trocar para valor seguro
PORT=3333
```

**Em produção**: `JWT_SECRET` é **obrigatório** (o backend falha se não configurado)

**Arquivo**: `api/prisma.config.ts`

- Configuração do Prisma (schema, migrations, seed)

## 📝 Scripts Úteis

### Frontend

```bash
npm run dev      # Desenvolvemento (Next.js em localhost:3000)
npm run build    # Build de produção
npm run start    # Inicia servidor de produção
npm run lint     # ESLint
```

### Backend

```bash
npm run dev                      # Desenvolvimento (Fastify em localhost:3333)
npm run build                    # TypeScript → JavaScript
npm run start                    # Inicia servidor de produção
npm run prisma:migrate           # Cria/aplica migrações
npm run prisma:studio            # Interface visual do Prisma
npm run prisma:generate          # Gera cliente Prisma
npm run prisma:seed              # Popula dados iniciais
```

## 🚀 Fluxo de Deployment

### Desenvolvimento Local

1. **Backend**:
   ```bash
   cd api
   npm install
   npm run prisma:migrate
   npm run prisma:seed  # (opcional, para dados de teste)
   npm run dev          # Roda em :3333
   ```

2. **Frontend**:
   ```bash
   npm install
   npm run dev          # Roda em :3000
   ```

3. **Acesso**: http://localhost:3000

### Pontos de Atenção

- **URL da API**: Configurar `NEXT_PUBLIC_API_URL` no `.env.local`
- **JWT_SECRET**: **Obrigatório** em produção (backend falha sem ele)
- **CORS**: Backend tem CORS aberto (`origin: true`), ajustar se necessário
- **Database**: Em produção, usar PostgreSQL com Prisma ao invés de SQLite

## 📊 Features Implementadas (por Commit)

1. **d9be64c**: Implementada revisão de produtos - Admin pode revisar/gerenciar produtos
2. **384cdcd**: Implementada função de edição de pedido por admin - Admin pode editar pedidos
3. **2ee14a2**: Ajustada visualização de pedidos retirados mockups geral - Melhor UX
4. **4d88253**: Fixed admin admin permission - Correção de permissões admin
5. **0f1a718**: First Commit - Setup inicial do projeto

## 🔑 Variáveis de Ambiente Necessárias

### Backend (`api/.env`)

```
DATABASE_URL="file:dev.db"        # SQLite para dev, PostgreSQL para prod
JWT_SECRET="sua-chave-segura"     # Mínimo 32 caracteres em produção
PORT=3333                         # Porta da API
```

### Frontend

- `NEXT_PUBLIC_API_URL`: URL da API (opcional, fallback localhost)
- `JWT_SECRET`: **Obrigatório** no backend

## ✅ Checklist para Novos Desenvolvedores

- [ ] Clonar repositório
- [ ] Instalar dependências (npm install em / e /api)
- [ ] Criar banco de dados (`npm run prisma:migrate` em /api)
- [ ] Popular dados iniciais (`npm run prisma:seed` em /api)
- [ ] Ajustar URL da API se necessário
- [ ] Rodar backend (`npm run dev` em /api)
- [ ] Rodar frontend (`npm run dev` em /)
- [ ] Acessar http://localhost:3000
- [ ] Fazer login/registrar usuário
- [ ] Criar pedido para testar

## 🐛 Debugging

- **Backend**: Fastify log em stdout, ver erro na resposta HTTP
- **Frontend**: Console do navegador (F12), Network tab para ver requests
- **Banco**: `npm run prisma:studio` em /api para interface visual
- **API**: Arquivo `api/rest.http` com exemplos de requisições
