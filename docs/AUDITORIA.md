# Auditoria Técnica — Centralizador de Pedidos

Data: 2026-08-21 · Branch: `master` · Commit base: `2e1ac87`

Escopo: frontend (Next.js 16 / React 19), backend (Fastify 5 / Prisma 7 / Postgres),
infra de repositório, dependências, testes e CI.

## Estado geral

O que está saudável:

- `npx tsc --noEmit` limpo nos dois pacotes; `eslint src` limpo.
- Testes passam: 43 no frontend (5 arquivos), 57 no backend (8 arquivos).
- Arquitetura de módulos do backend é consistente (routes → controller → service → repository).
- Camada de autorização por papel (`requireRole`) existe e está aplicada na maioria das rotas.
- CI cobre lint + typecheck + testes + build nos dois pacotes.

O que preocupa: os problemas mais graves não estão na arquitetura, e sim em
(a) segredos vazados no histórico do Git, (b) uma superfície de registro pública,
(c) escritas de estoque fora de transação e (d) a fila offline, que está quebrada
por um bug de esquema do IndexedDB.

---

## CRÍTICO

### 1. Credenciais de produção recuperáveis no histórico do Git

`api/.env.prod` foi removido do rastreamento em `f699467`, mas continua acessível:

```
git show fd14f28:api/.env.prod
```

Expõe `DATABASE_URL`/`DIRECT_URL` do Supabase de produção (com senha) e o
`JWT_SECRET` de produção. Quem tiver o clone tem acesso direto ao banco de produção
e pode forjar JWTs de ADMIN.

**Ação:** rotacionar a senha do Postgres no Supabase e gerar novo `JWT_SECRET`
(invalida todas as sessões — esperado). Reescrever o histórico (`git filter-repo`)
só ajuda se o repositório for privado e todos os clones forem descartados; a rotação
é obrigatória de qualquer forma.

### 2. `api/server.log` rastreado com senha em texto plano

O arquivo está commitado e contém:

```json
{"body":{"username":"admin","password":"admin123"},"msg":"Requisição de login recebida"}
```

O log do corpo do login já foi removido do código atual (bom), mas o arquivo
permanece no repositório e no histórico. `api/prisma/seed.ts:641` ainda semeia o
admin com `admin123`.

**Ação:** remover `api/server.log`, `api/server.err` e `api/dev.db` do rastreamento
(`api/dev.db` é resíduo do SQLite — o schema já é Postgres); trocar a senha do admin
em qualquer ambiente semeado; ler a senha do seed de env var.

### 3. `POST /auth/register` é público e não é usado pelo frontend

`api/src/modules/auth/auth.routes.ts` registra `/register` sem `preHandler`.
Qualquer pessoa com acesso à API cria uma conta, e `createUserSchema` aceita
`storeIds` arbitrários — sem validar se as lojas existem ou se o solicitante tem
direito a elas. O resultado é acesso de leitura aos pedidos de qualquer loja
escolhida (`OrderService.list` confia em `user.stores`).

O papel é forçado a `DEFAULT` (`{ ...data, role: 'DEFAULT' }`), então não há
escalação para ADMIN — mas o cadastro autoatendido não deveria existir: nenhum
componente do frontend chama `api.register`.

**Ação:** remover a rota (usuários já são criados por ADMIN em `POST /users`) ou
protegê-la com `adminMiddleware`.

### 4. A fila de pedidos offline nunca grava — feature quebrada

`src/lib/offline/db.ts:23` cria o object store com `keyPath: 'clientId'`:

```js
const store = db.createObjectStore('queue', { keyPath: 'clientId' })
store.createIndex('status', 'status', ...)
```

mas `src/lib/offline/queue.ts:28` grava um envelope `{ key, value }`:

```js
await putRecord('queue', { key: queueItem.clientId, value: queueItem })
```

O registro não tem a propriedade `clientId`, então o `put` viola o keyPath e falha
com `DataError`. Mesmo se gravasse, o índice `status` aponta para o topo do registro
e o `status` real está aninhado em `value` — `getPendingOrders()` nunca acharia nada.

Cenário: usuário sem rede monta um pedido, `api.createOrder` cai no ramo offline,
`enqueueOrder` rejeita, o pedido se perde e a UI mostra erro. O ramo offline é o
motivo de existir da PWA.

**Ação:** alinhar os dois lados — o mais simples é `createObjectStore('queue', { keyPath: 'key' })`,
com índices em `value.status` e `value.createdAt`; exige bump de `DB_VERSION` e
migração no `onupgradeneeded`. Cobrir com teste (hoje não há nenhum para `offline/`).

---

## ALTO

### 5. Escritas de estoque fora da transação que deveria protegê-las

Padrão repetido: o callback do `$transaction` recebe `tx`, mas o repositório usa o
`prisma` global — logo a escrita do repositório **não participa da transação**.

| Arquivo | Linha aprox. | Escrita fora da tx |
|---|---|---|
| `api/src/modules/sales/sale.service.ts` | 36 | `this.repo.create(...)` |
| `api/src/modules/purchases/purchase.service.ts` | 61 | `this.repo.updateStatus(id, 'RECEIVED')` |
| `api/src/modules/movements/movement.service.ts` | 27 | `this.repo.create(data)` |
| `api/src/modules/stock-counts/stock-count.service.ts` | 78 | `this.repo.updateStatus(id, 'CLOSED')` |

Se o rollback ocorrer (produto removido no meio, falha de conexão), o registro de
venda/compra/movimento persiste enquanto os ajustes de `stockCD` são desfeitos — ou
o inverso. O razão de estoque passa a divergir dos documentos silenciosamente.

**Ação:** propagar `tx` para os repositórios (aceitar um `Prisma.TransactionClient`
opcional no construtor ou nos métodos).

### 6. Aprovar um pedido duas vezes debita o estoque duas vezes

`OrderService.updateStatus` (`order.service.ts:150`) não verifica o status atual:

```ts
const result = await this.orderRepository.update(orderId, { status })
if (status === 'APPROVED') { ... processOrderApproval(order) }
```

Dois `PATCH /orders/:id/status {status:"APPROVED"}` seguidos geram dois
`StockMovement` de EXIT e dois decrementos de `stockCD`. Não é preciso má-fé — um
duplo-clique ou um retry basta.

**Ação:** carregar o pedido antes, sair cedo se já estiver `APPROVED`, e rodar
mudança de status + movimentos na mesma transação.

### 7. Compras, vendas, movimentos e contagens não têm escopo por loja

Só `orders` aplica o filtro por `user.stores`. Nas demais rotas o
`authMiddleware` apenas exige estar logado:

- `GET /purchases`, `GET /purchases/:id` — qualquer usuário DEFAULT lê todas as compras, com custos unitários.
- `GET /sales`, `GET /sales/:id`, `GET /movements` — idem.
- `PATCH /stock-counts/:id/items` — **qualquer usuário DEFAULT altera as quantidades físicas de qualquer contagem**, inclusive de outra pessoa. `StockCountService.updateCountItems` não compara `stockCount.userId` com o solicitante. Como `closeStockCount` transforma `divergence` em ajuste de `stockCD`, isso permite manipular o estoque do CD indiretamente.

**Ação:** decidir a regra (provavelmente supervisor/admin para leitura financeira, e
dono-ou-admin para editar contagem) e aplicá-la no service, como já é feito em `orders`.

### 8. Sessão nunca é invalidada no cliente

`AuthContext.loadUser` (`src/context/AuthContext.tsx:29`) restaura o usuário do
`localStorage` e, se `getMe()` falhar, mantém o cache silenciosamente — inclusive
quando a falha é 401 por token expirado. Nada em `apiRequest` trata 401. Efeito
prático: com token vencido, a UI segue mostrando o usuário logado (com o papel do
cache) e cada requisição falha individualmente, sem redirecionar para `/login`.

Relacionado: não existe `POST /auth/logout`. O `logout()` limpa o `localStorage`,
mas o cookie `token` httpOnly de 7 dias continua válido no navegador.

**Ação:** distinguir "offline" de "401" — em 401, limpar credenciais e redirecionar.
Adicionar rota de logout que faça `clearCookie('token')`.

### 9. O motor de sincronização ignora `NEXT_PUBLIC_API_URL`

`src/lib/offline/sync-engine.ts:76`:

```ts
function getApiBaseUrl(): string {
  return `${window.location.protocol}//${window.location.hostname}:3333`
}
```

`src/lib/api.ts` respeita a env var; o sync-engine não. Em produção (API atrás de
domínio/porta 443) o health check e o POST de reenvio apontam para uma porta que
não existe → a fila nunca drena, sem erro visível.

**Ação:** exportar o cálculo de base URL de `api.ts` e reutilizar.

### 10. Falha transitória descarta o pedido offline para sempre

`markFailed` grava `status: 'FAILED'`, mas `getPendingOrders()` consulta apenas
`'PENDING'`. Um registro FAILED nunca mais é lido. Consequências:

- `MAX_RETRIES = 10` e `retryCount` são código morto — `retryCount` nunca passa de 1.
- Um 500 momentâneo do backend, ou um token expirado, apaga o pedido da fila útil.
- Nada na UI lista pedidos FAILED (`OfflineContext` só mostra `getQueueSize()`, que conta tudo, inclusive os mortos — o contador nunca zera).

**Ação:** devolver o item a `PENDING` enquanto `retryCount < MAX_RETRIES`, e reservar
`FAILED` para o esgotamento, com listagem na UI.

### 11. `xlsx@0.18.5` com vulnerabilidades sem correção, processando arquivos de rede

Presente no frontend e no backend. GHSA-4r6h-8v6p-xvw6 (prototype pollution) e
GHSA-5pgg-2g8v-p4x9 (ReDoS), ambos high, **sem versão corrigida no npm**. O backend
lê com essa lib um `.xlsm` vindo de um compartilhamento SMB (`cd-stock.service.ts`),
que é exatamente o vetor.

**Ação:** migrar para o `xlsx` publicado pela SheetJS em `https://cdn.sheetjs.com`
(versões ≥ 0.20 corrigem ambos) ou trocar por `exceljs`.

---

## MÉDIO

12. **`GET /cd-stock/status` sem autenticação** (`cd-stock.routes.ts:12`) — única rota
    de negócio aberta; expõe nome do arquivo interno e volume sincronizado. As irmãs
    (`/history`, `/sync`) exigem admin.

13. **Contrato de datas contraditório em `GET /orders`.** `listOrdersSchema` exige
    `startDate: z.string().datetime()` (ISO completo), mas `order.repository.ts:56`
    faz `new Date(\`${startDate}T00:00:00Z\`)`. Qualquer valor que passe no Zod vira
    `Invalid Date` e o Prisma quebra. Latente: o frontend ainda não usa esses
    parâmetros. Usar `z.string().date()` ou parar de concatenar.

14. **`POST /auth/register` responde 500 em vez de 409 para usuário duplicado.**
    `user.service.ts:11` lança `'Username already exists'`; `auth.controller.ts:29`
    compara com `'User already exists'`.

15. **`server.ts` escuta em `host: 'localhost'`** — dentro de um container ou VM o
    serviço fica inacessível de fora. Deveria ser configurável (`HOST ?? '0.0.0.0'`).

16. **O cron inicia como efeito colateral do import de `app.ts`.** Aparece nos logs
    dos testes (`[CD-SCHEDULER] Agendado`). Com mais de uma instância, syncs
    concorrentes escrevem no mesmo `./data/Centralizador.xlsm`. Mover para `server.ts`.

17. **Fuzzy match por `includes` no sync do CD** (`cd-stock.service.ts:88`): o primeiro
    nome do Excel que contiver, ou estiver contido em, o nome do produto vence — em
    ordem de inserção do Map. "Abacaxi" casa com "Abacaxi Perola" (4390 un.). Erros de
    estoque entram sem sinalização, contados como `synced`.

18. **`SyncAndCopy` apaga o destino antes de copiar** (`sync-and-copy.ts:47`). Se o
    compartilhamento cair no meio, fica sem o arquivo antigo e sem o novo. Copiar para
    `.tmp` e renomear.

19. **Sem rate limit dedicado no login.** O limite global é 100 req/min por IP —
    generoso demais para força bruta em `/auth/login`, ainda mais com a política de
    senha mínima de 6 caracteres.

20. **Guardas de rota ausentes no frontend.** `/admin/purchases`, `/admin/sales`,
    `/admin/movements` e `/dashboard` não chamam `useAuth` nem verificam papel;
    `/admin/pedidos` só verifica se há usuário, não o papel. A API bloqueia as
    escritas, mas a UI carrega e vaza a estrutura (e as leituras do item 7 passam).

21. **Outras vulnerabilidades de dependência:** `fast-uri` (high, backend) tem correção
    via `npm audit fix`; `sharp` e `postcss` chegam via `next@16.2.1` e exigem
    `next@16.3.2`.

22. **Cobertura de testes desigual.** Zero testes para `offline/*` (onde está o bug
    crítico #4), `purchases`, `sales`, `movements`, `stock-counts` — justamente os
    módulos que mexem em estoque. Além disso, `api/src/__tests__/lib/test-*.ts`,
    `check-*.ts` e `debug-export.ts` são scripts manuais dentro da pasta de testes.

---

## BAIXO / higiene

23. **`CLAUDE.md` descreve um projeto que não existe mais:** cita SQLite + Better
     SQLite3 (é Postgres + `@prisma/adapter-pg`), `.jsx`/`.js` (é TypeScript),
     `user.isAdmin` e `user.storeId` (é `role` e relação N:N `stores`), e não menciona
     purchases, sales, movements, stock-counts, cd-stock nem a camada offline.
     Documentação errada custa mais que documentação ausente.

24. **Ruído versionado:** `.orchestrator/`, `.planning/`, `.agents/`, `skills-lock.json`,
     `tsconfig.tsbuildinfo`, `api/diagnose-network.ps1`, `api/test-live.ps1`,
     `api/diagnose-file-finder.mjs`, `api/update_legacy_purchase_orders.sql`.
     `api/data/Centralizador.xlsm` (7,9 MB) está no repositório apesar de `api/data/`
     estar no `.gitignore` da raiz — foi adicionado antes da regra.

25. **Acoplamento a Windows não documentado:** `order-export.ts` e `file-finder.service.ts`
     assumem caminhos UNC (`\\192.168.0.247\onedrive\...`). Em Linux o `path.join`
     produz `\\192.168.0.247\onedrive\Enviado/AB_010101.xlsx` — o teste atual passa
     porque só verifica sucesso. A API precisa rodar em Windows, ou os caminhos
     precisam ser montados; convém registrar isso no README.

26. **`errorHandler` repassa `err.statusCode` e `err.message` de qualquer erro** —
     inclusive de erros do Prisma que carregam statusCode. Comentário diz "never expose
     stack trace in production", mas há `console.error(error)` completo logo abaixo.

---

## Ordem sugerida

1. Rotacionar `JWT_SECRET` e a senha do Postgres de produção (#1); despistar `server.log`/`dev.db` (#2).
2. Fechar `/auth/register` (#3).
3. Consertar o keyPath da fila offline + `getApiBaseUrl` + política de retry (#4, #9, #10) — é a feature principal e está inoperante.
4. Transações (#5) e guarda de dupla aprovação (#6).
5. Escopo de autorização em purchases/sales/movements/stock-counts (#7).
6. Tratamento de 401 no `AuthContext` e rota de logout (#8).
7. Trocar a origem do `xlsx` (#11).
8. Atualizar `CLAUDE.md` (#23) antes que a próxima pessoa (ou o próximo agente) parta de premissas erradas.

---

## Status das correções (aplicadas em 2026-08-21)

Corrigidos nesta passagem — `tsc`, `eslint`, testes e `build` verdes nos dois pacotes
(frontend: 46 testes / 6 arquivos; backend: 56 testes / 8 arquivos):

| # | Achado | O que mudou |
|---|---|---|
| 2 | Arquivos vazados rastreados | `git rm --cached` em `server.log`, `server.err`, `dev.db`, `data/Centralizador.xlsm` (mantidos em disco); `api/.gitignore` reescrito e o padrão `.db` da raiz corrigido para `*.db` |
| 3 | `/auth/register` público | Rota e handler removidos; `api.register`, o handler MSW e os testes vazios foram junto |
| 4 | Fila offline quebrada | `queue` recriado com `keyPath: 'key'` e índices em `value.status`/`value.createdAt`, `DB_VERSION` 1→2 com migração guardada por `oldVersion` |
| 5 | Escritas fora da transação | `DbClient` (= `Prisma.TransactionClient`) exportado de `lib/prisma.ts`; os 4 repositórios aceitam o cliente e os services passam o `tx` |
| 6 | Dupla aprovação debitava estoque 2× | `updateStatus` carrega o pedido, e a aprovação roda em uma transação com `updateMany` condicional (`status: { not: 'APPROVED' }`) — 409 se já aprovado, 404 se inexistente |
| 8 | Sessão nunca invalidada | 401 em `/auth/me` limpa as credenciais (outras falhas preservam o cache offline); novo `POST /auth/logout` limpa o cookie httpOnly e o `logout()` o chama |
| 9 | Fila apontava para `:3333` fixo | `API_URL` extraído para `src/lib/api-url.ts`, compartilhado pelo cliente HTTP e pelo sync-engine |
| 10 | Falha transitória perdia o pedido | `markFailed` devolve para `PENDING` até esgotar `MAX_RETRIES`; `getQueueSize` conta só o que ainda é sincronizável; `getFailedOrders` exposto |
| 12 | `/cd-stock/status` aberto | `authMiddleware` aplicado |
| 13 | Contrato de datas contraditório | `z.iso.date()` nos três filtros e um único bloco de intervalo que aceita bordas abertas (o frontend já enviava `YYYY-MM-DD`) |
| 15 | Host fixo em `localhost` | `HOST` configurável por env, default inalterado |
| 16 | Cron no import de `app.ts` | Movido para o callback de `listen()` em `server.ts` — confirmado que não dispara mais nos testes |
| 20 | Guards de rota ausentes | Novo `useRequireRole`; aplicado em `/admin/purchases`, `/admin/sales`, `/admin/movements` e `/admin/pedidos` (que só checava login) |

Cobertura nova: `src/__tests__/lib/offline-queue.test.ts` (4 testes, com `fake-indexeddb`).
Verificado que os 4 falham com `DataError` contra o código anterior — é regressão de
verdade, não teste de fachada.

### Em aberto

- **#1 — rotação de segredos.** Só você pode fazer: trocar a senha do Postgres no
  Supabase e gerar novo `JWT_SECRET`. Despistar o arquivo não invalida o que já
  vazou. Reescrever o histórico (`git filter-repo`) é complementar, não substituto.
- **#7 — escopo de autorização em purchases/sales/movements/stock-counts.** Depende
  de uma decisão de produto: quem pode ver custos de compra e quem pode editar uma
  contagem que não é sua. Não quis chutar a política.
- **#11 — `xlsx`.** Trocar a origem para o registry da SheetJS muda o `package.json`
  dos dois pacotes e o lockfile; melhor fazer isolado, com o build revalidado.
- **#14 —** resolvido por tabela: a incoerência de mensagem só existia no `register`.
- **#17, #18, #19, #21 a #26** seguem como descrito acima.
- `/dashboard` ficou sem guard de propósito: é um stub (`Dashboard Page - Under
  Construction`) que não busca nem exibe dado nenhum.
- Os guards que já existiam em `/admin`, `/admin/stock-counts` e `/supervisor` não
  foram migrados para o `useRequireRole` — funcionam, e mexer neles seria risco sem
  retorno agora. Vale unificar quando alguém já estiver nesses arquivos.
