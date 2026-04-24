<!-- BEGIN:ORCHESTRATOR -->
# 🤖 Orquestrador de Agentes - Centralizador

Sistema de orquestração de agentes especializados para o projeto Centralizador.

---

## Uso Rápido

Basta descrever o que você precisa em **linguagem natural**. O orquestrador detectará automaticamente o agente adequado.

### Exemplos Práticos

```bash
# Frontend - Cria componentes React
"cria um modal de confirmação para deletar pedido"
"adiciona validação no formulário de login"
"melhora o design da página de pedidos"

# Backend - Cria APIs e lógica de negócio
"adiciona autenticação JWT no endpoint de produtos"
"cria um novo endpoint para exportar relatórios"
"implementa paginação na listagem de pedidos"

# Database - Schema e migrations
"cria uma migration para adicionar campo de telefone"
"adiciona relação many-to-many entre usuários e stores"
"atualiza o schema com novos índices"

# Testing - Testes automatizados
"escreve testes para o service de pedidos"
"adiciona coverage no componente de formulário"
"roda os testes unitários do backend"

# Review - Code review e refatoração
"revisar o código do componente de tabela"
"corrige os warnings do eslint"
"melhora performance do loading"

# Explore - Análise e documentação
"como funciona o fluxo de criação de pedido?"
"onde estão as rotas de autenticação?"
"mapeia as dependências do módulo de orders"

# Security - Auditoria e proteção
"audita vulnerabilidades no login"
"verifica segurança das APIs"
"checa proteção contra XSS"
```

---

## Agentes Disponíveis

| Agente | Especialização | Palavras-chave |
|--------|---------------|---------------|
| **frontend** | React 19, Next.js, Tailwind | componente, modal, página, estilo, design |
| **backend** | Fastify, Prisma, APIs REST | api, rota, service, controller, endpoint |
| **database** | Prisma, migrations, schemas | schema, migration, tabela, banco |
| **testing** | Vitest, testes, coverage | teste, mock, coverage, spec |
| **review** | Code review, refatoração | revisar, corrigir, melhorar, refatorar |
| **explore** | Análise de codebase | como funciona, onde está, analisar |
| **security** | Auditoria, vulnerabilidades | audita, segurança, vulnerabilidade |

---

## Sistema de Roteamento

### Como Funciona

1. **Input do usuário**: Você descreve a tarefa naturalmente
2. **Tokenização**: O parser extrai palavras-chave do texto
3. **Scoring**: Cada agente recebe uma pontuação (0-1)
4. **Seleção**: O agente com maior score é escolhido

### Níveis de Confiança

| Score | Confiança | Significado |
|-------|-----------|-------------|
| ≥ 0.6 | **high** | Match forte - executa direto |
| ≥ 0.4 | **medium** | Match moderado - executa direto |
| < 0.4 | **low/none** | Pede confirmação |

### Casos Especiais

- **Múltiplos candidatos**: Se scores estão próximos, pede confirmação
- **Input ambíguo**: Sugere agentes baseados nas palavras detectadas
- **Sem match**: Oferece ajuda e exemplos

---

## Estrutura de Arquivos

```
.orchestrator/
├── agents/
│   ├── agents.json              # Definições dos agentes (triggers, paths, skills)
│   └── prompts/
│       ├── frontend.md         # Prompt especializado com padrões do projeto
│       ├── backend.md          # Padrões Fastify + Prisma
│       ├── database.md         # Prisma schema e migrations
│       ├── testing.md          # Vitest + React Testing Library
│       ├── review.md           # Code review checklist
│       ├── explore.md          # Análise de arquitetura
│       └── security.md         # OWASP Top 10 audit
├── router/
│   ├── intent-parser.js         # Lógica de roteamento com cache de regex
│   └── __tests__/
│       └── intent-parser.test.js # 48 testes unitários
└── history/
    └── sessions.json           # Histórico de execuções
```

---

## Prompts Especializados

Cada agente carrega automaticamente um prompt especializado que inclui:

- **Stack tecnológico** do projeto
- **Estrutura de diretórios** e convenções
- **Padrões de código** (S/C/R para backend, CVA para frontend)
- **Scripts disponíveis** (npm run dev, npm test, etc.)
- **Checklists de qualidade** para cada tarefa
- **Exemplos de código** do próprio projeto

---

## Executar Agente Manualmente

Para testar o roteamento diretamente:

```bash
# Testar parsing de uma frase
node .orchestrator/router/intent-parser.js "cria um modal"

# Modo verbose (com logs)
node .orchestrator/router/intent-parser.js "cria um modal" --verbose

# Listar todos os agentes
node .orchestrator/router/intent-parser.js --list
```

---

## Rodar Testes

```bash
# Todos os testes do orquestrador
npx vitest run --config vitest.config.orchestrator.ts

# Com coverage
npx vitest run --config vitest.config.orchestrator.ts --coverage
```

---

## Boas Práticas

1. **Seja específico** - "cria um modal de confirmação" > "faz algo"
2. **Mencione o contexto** - "no componente OrderForm" ajuda a rotear
3. **Use termos técnicos** - "service", "migration" são reconhecidos
4. **Descreva o resultado** - "preciso de uma tabela com ordenação"

### Dicas de Uso

| Em vez de... | Use... |
|-------------|--------|
| "faz o frontend" | "cria um componente de formulário" |
| "faz a API" | "cria um endpoint para produtos" |
| "arruma o código" | "corrige bug no login" |
| "olha o projeto" | "como funciona o fluxo de pedidos?" |

---

## Logs de Execução

Cada execução é registrada em `.orchestrator/history/sessions.json`:

```json
{
  "agent": "frontend",
  "input": "cria modal de login",
  "score": 0.85,
  "confidence": "high",
  "timestamp": "2024-04-24T16:30:00Z"
}
```

---

**Nota**: O orquestrador **apenas roteia** - não executa nenhuma tarefa. Toda implementação é feita pelos agentes especializados via Task tool.
<!-- END:ORCHESTRATOR -->

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- VERCEL BEST PRACTICES START -->
## Best practices for developing on Vercel

These defaults are optimized for AI coding agents (and humans) working on apps that deploy to Vercel.

- Treat Vercel Functions as stateless + ephemeral (no durable RAM/FS, no background daemons), use Blob or marketplace integrations for preserving state
- Edge Functions (standalone) are deprecated; prefer Vercel Functions
- Don't start new projects on Vercel KV/Postgres (both discontinued); use Marketplace Redis/Postgres instead
- Store secrets in Vercel Env Variables; not in git or `NEXT_PUBLIC_*`
- Provision Marketplace native integrations with `vercel integration add` (CI/agent-friendly)
- Sync env + project settings with `vercel env pull` / `vercel pull` when you need local/offline parity
- Use `waitUntil` for post-response work; avoid the deprecated Function `context` parameter
- Set Function regions near your primary data source; avoid cross-region DB/service roundtrips
- Tune Fluid Compute knobs (e.g., `maxDuration`, memory/CPU) for long I/O-heavy calls (LLMs, APIs)
- Use Runtime Cache for fast **regional** caching + tag invalidation (don't treat it as global KV)
- Use Cron Jobs for schedules; cron runs in UTC and triggers your production URL via HTTP GET
- Use Vercel Blob for uploads/media; Use Edge Config for small, globally-read config
- If Enable Deployment Protection is enabled, use a bypass secret to directly access them
- Add OpenTelemetry via `@vercel/otel` on Node; don't expect OTEL support on the Edge runtime
- Enable Web Analytics + Speed Insights early
- Use AI Gateway for model routing, set AI_GATEWAY_API_KEY, using a model string (e.g. 'anthropic/claude-sonnet-4.6'), Gateway is already default in AI SDK
  needed. Always curl https://ai-gateway.vercel.sh/v1/models first; never trust model IDs from memory
- For durable agent loops or untrusted code: use Workflow (pause/resume/state) + Sandbox; use Vercel MCP for secure infra access
<!-- VERCEL BEST PRACTICES END -->