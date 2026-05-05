# Relatório de Task - Fase 1: Ajustes no Schema e Seed

**Data:** 05/05/2026  
**Agente:** database  
**Status:** ✅ Concluído

---

## Objetivo
Preparar o banco de dados para os novos módulos de compras, movimentações de estoque e contagem física.

---

## Arquivos Modificados

### 1. `api/prisma/schema.prisma`
**Alterações:**
- Corrigido modelo `User`: adicionados campos `purchaseOrders`, `stockMovements`, `stockCounts`
- Corrigido modelo `Product`: adicionados campos `purchaseOrderItems`, `stockMovements`, `stockCountItems`
- Corrigido modelo `Order`: adicionado campo `stockMovements`
- Novo modelo `Supplier`: id, name, type (CEASA | EXTERNAL), address, contact, purchases, createdAt
- Novo modelo `PurchaseOrder`: id, supplierId, userId, status (DRAFT | RECEIVED), notes, items, movements, createdAt
- Novo modelo `PurchaseOrderItem`: id, purchaseOrderId, productId, quantity, unitCost
- Novo modelo `StockMovement`: id, productId, type (ENTRY | EXIT | ADJUST), quantity, reason, userId, orderId, purchaseOrderId, createdAt
- Novo modelo `StockCount`: id, userId, status (OPEN | CLOSED), notes, items, createdAt
- Novo modelo `StockCountItem`: id, stockCountId, productId, physicalQty, systemQty, divergence

### 2. `api/prisma/seed.ts`
**Alterações:**
- Loja 19 (Centro de Distribuição) agora recebe `code: "CD"`
- Adicionado cadastro de 5 CEASAs no seed (CEASA I a V)
- Corrigida ordem de deleção para respeitar dependências (stockCountItem → stockCount → stockMovement → purchaseOrderItem → purchaseOrder → supplier → orderItem → order → product → category → user → store)
- Adicionado `prisma.orderItem.deleteMany()` e `prisma.order.deleteMany()` no início do seed

---

## Migrations Aplicadas
- `20260505184916_add_suppliers_purchases_movements_stockcount`
  - Criação das tabelas: suppliers, purchase_orders, purchase_order_items, stock_movements, stock_counts, stock_count_items
  - Atualização das tabelas existentes com novos relacionamentos

---

## Próximos Passos (Fase 2)
- Criar módulo `purchases/` com endpoints para CRUD de ordens de compra
- Criar módulo `movements/` para histórico de movimentações
- Integrar baixa de estoque no CD ao aprovar pedidos
- Criar `stockMovement.service.ts` para registrar entradas/saídas
