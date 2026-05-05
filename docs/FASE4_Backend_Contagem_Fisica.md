# Relatório de Task - Fase 4: Backend Contagem Física

**Data:** 05/05/2026  
**Agente:** backend  
**Status:** ✅ Concluído

---

## Objetivo
Criar API para controle de contagem física de estoque no CD e correção de divergências.

---

## Arquivos Criados

### 1. `api/src/modules/stock-counts/stock-count.service.ts`
**Funcionalidades:**
- `createStockCount(userId)`: 
  - Cria StockCount com status OPEN
  - Para cada produto, cria StockCountItem com `systemQty = product.stockCD`
- `listStockCounts(filters)`: lista contagens com filtros (status, date range)
- `getStockCountById(id)`: busca contagem com itens e produtos
- `updateCountItem(stockCountId, productId, physicalQty)`:
  - Atualiza `physicalQty` e recalcula `divergence = physicalQty - systemQty`
  - Só permite alteração se StockCount estiver OPEN
- `closeStockCount(id, userId)`:
  - Para cada item com `divergence != 0`:
    - Atualiza `stockCD` do produto
    - Cria `StockMovement` tipo ADJUST com reason "Ajuste após contagem física"
  - Muda status para CLOSED

### 2. `api/src/modules/stock-counts/stock-count.routes.ts`
**Rotas:**
- `POST /stock-counts` — iniciar contagem (authMiddleware)
- `GET /stock-counts` — listar contagens (authMiddleware)
- `GET /stock-counts/:id` — detalhes com itens (authMiddleware)
- `PATCH /stock-counts/:id/items` — registrar quantidade física (authMiddleware)
- `POST /stock-counts/:id/close` — fechar e aplicar ajustes (adminMiddleware)

---

## Arquivos Modificados

### 3. `api/src/app.ts`
**Alteração:**
- Registradas as rotas `/stock-counts`

---

## Próximos Passos (Fase 5)
- Criar página `/admin/purchases` com lista de compras
- Criar `PurchaseForm.tsx` para registrar compras das CEASAs
- Criar `PurchaseList.tsx` com tabela de compras
- Criar `PurchaseReceiveModal.tsx` para confirmar recebimento
