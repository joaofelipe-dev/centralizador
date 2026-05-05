# Relatório de Task - Fase 3: Backend Vendas para Fornecedores

**Data:** 05/05/2026  
**Agente:** backend  
**Status:** ✅ Concluído

---

## Objetivo
Criar API para registro de vendas de produtos para fornecedores externos (saída de estoque do CD).

---

## Arquivos Criados

### 1. `api/src/modules/sales/sale.service.ts`
**Funcionalidades:**
- `createSale()`: registra venda para fornecedor externo
  - Verifica se `stockCD` é suficiente
  - Cria PurchaseOrder com `type: "SALE"`
  - Para cada item: decrementa `stockCD` e cria `StockMovement` tipo EXIT com reason "Venda para fornecedor"
- `listSales()`: lista vendas com filtros (supplierId, date range)
- `getSaleById()`: busca venda com itens, fornecedor e usuário

### 2. `api/src/modules/sales/sale.routes.ts`
**Rotas:**
- `POST /sales` — registrar venda (adminMiddleware)
- `GET /sales` — histórico de vendas (authMiddleware)
- `GET /sales/:id` — detalhes (authMiddleware)

---

## Arquivos Modificados

### 3. `api/prisma/schema.prisma`
**Alteração:**
- Adicionado campo `type String @default("PURCHASE")` no modelo `PurchaseOrder`
  - Valores: `PURCHASE` (compras das CEASAs) | `SALE` (vendas para fornecedores externos)

### 4. `api/src/app.ts`
**Alteração:**
- Registradas as rotas `/sales`

---

## Migrations Aplicadas
- `20260505190638_add_purchase_order_type`
  - Adição da coluna `type` na tabela `purchase_orders` com default "PURCHASE"

---

## Próximos Passos (Fase 4)
- Criar módulo `stock-counts/` para controle de contagem física
- Endpoints: POST /stock-counts (iniciar), GET /stock-counts (listar), PATCH /stock-counts/:id/items (registrar qty física), POST /stock-counts/:id/close (fechar e aplicar ajustes)
- Ao fechar contagem: calcular divergências e ajustar `stockCD` com `StockMovement` ADJUST
