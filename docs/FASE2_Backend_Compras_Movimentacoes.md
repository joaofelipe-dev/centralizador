# Relatório de Task - Fase 2: Backend Compras e Movimentações

**Data:** 05/05/2026  
**Agente:** backend  
**Status:** ✅ Concluído

---

## Objetivo
Criar API para entrada de produtos (compras das CEASAs) e rastreamento de movimentações de estoque.

---

## Arquivos Criados

### 1. `api/src/modules/purchases/purchase.service.ts`
**Funcionalidades:**
- `createPurchase()`: cria PurchaseOrder (status DRAFT) com itens
- `listPurchases()`: lista compras com filtros (supplierId, status, date range)
- `getPurchaseById()`: busca compra com itens, fornecedor e usuário
- `receivePurchase()`: marca como RECEIVED, para cada item:
  - Incrementa `stockCD` do produto
  - Cria `StockMovement` do tipo ENTRY

### 2. `api/src/modules/purchases/purchase.routes.ts`
**Rotas:**
- `POST /purchases` — criar ordem de compra (authMiddleware)
- `GET /purchases` — listar compras (authMiddleware)
- `GET /purchases/:id` — detalhes (authMiddleware)
- `PATCH /purchases/:id/receive` — receber compra (adminMiddleware)

### 3. `api/src/modules/movements/movement.service.ts`
**Funcionalidades:**
- `listMovements()`: histórico com filtros (tipo, produto, data)
- `createAdjustment()`: ajuste manual, cria StockMovement ADJUST e atualiza stockCD

### 4. `api/src/modules/movements/movement.routes.ts`
**Rotas:**
- `GET /movements` — histórico de movimentações (authMiddleware)
- `POST /movements/adjust` — ajuste manual (adminMiddleware)

---

## Arquivos Modificados

### 5. `api/src/modules/order/order.service.ts`
**Alteração:**
- Adicionado `processOrderApproval()`: ao aprovar pedido (status APPROVED):
  - Cria `StockMovement` do tipo EXIT para cada item
  - Decrementa `stockCD` do produto (CD envia produtos para a loja)

### 6. `api/src/modules/order/order.repository.ts`
**Alteração:**
- Adicionado método `findById()` para buscar pedido completo com itens

### 7. `api/src/app.ts`
**Alteração:**
- Registradas as novas rotas: `/purchases` e `/movements`

---

## Próximos Passos (Fase 3)
- Criar módulo `sales/` para registro de vendas para fornecedores externos
- Endpoints: POST /sales, GET /sales, GET /sales/:id
- Ao registrar venda: decrementar stockCD + criar StockMovement EXIT
