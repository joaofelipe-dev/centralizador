# Relatório de Task - Fase 6: Frontend Movimentações e Vendas

**Data:** 05/05/2026  
**Agente:** frontend  
**Status:** ✅ Concluído

---

## Objetivo
Criar UI para histórico de movimentações, ajustes manuais e vendas para fornecedores externos.

---

## Arquivos Criados

### 1. `src/types/movement.ts`
**Tipos definidos:**
- `StockMovement`: id, productId, product, type, quantity, reason, userId, user, orderId, purchaseOrderId, createdAt

### 2. `src/lib/movement-api.ts`
**Funções:**
- `listMovements(params?)`: GET /movements (filtros: type, productId, dateFrom, dateTo)
- `createAdjustment(data)`: POST /movements/adjust

### 3. `src/lib/sale-api.ts`
**Funções:**
- `createSale(data)`: POST /sales
- `listSales(params?)`: GET /sales
- `getSale(id)`: GET /sales/:id

### 4. `src/lib/supplier-api.ts`
**Funções:**
- `listSuppliers(params?)`: GET /suppliers (filtro por type)

### 5. `src/components/Admin/MovementList.tsx`
**Funcionalidades:**
- Tabela com colunas: Data, Produto, Tipo (Badge colorido), Quantidade, Motivo, Usuário
- Filtros: tipo (ENTRY/EXIT/ADJUST), produto, data inicial/final
- Usa componentes UI: Table, Input, Select, Button

### 6. `src/components/Admin/AdjustmentForm.tsx`
**Funcionalidades:**
- Select de produto
- Input de quantidade
- Textarea para motivo
- Botão "Aplicar Ajuste" com Toast de feedback

### 7. `src/components/Admin/SaleForm.tsx`
**Funcionalidades:**
- Select para fornecedor externo (type EXTERNAL)
- Lista de produtos com: nome, estoque CD atual, quantidade
- Busca/filtro de produtos
- Adição dinâmica de itens
- Botão "Registrar Venda"

### 8. `src/components/Admin/SaleList.tsx`
**Funcionalidades:**
- Tabela com colunas: Fornecedor, Data, Total de itens
- Usa componentes UI: Table, Button, Badge

### 9. `src/app/admin/movements/page.tsx`
**Funcionalidades:**
- Página com MovementList
- Botão para abrir formulário de ajuste (Modal)

### 10. `src/app/admin/sales/page.tsx`
**Funcionalidades:**
- Página com SaleList
- Botão para abrir SaleForm (Modal)

---

## Arquivos Modificados

### 11. `src/components/Header/HeaderNav.tsx`
**Alteração:**
- Adicionados links "Movimentações" e "Vendas" no menu admin

---

## Próximos Passos (Fase 7)
- Criar UI para contagem física de estoque
- Tela de contagem ativa com produtos e inputs de qty física
- Relatório de divergências e aplicação de ajustes
