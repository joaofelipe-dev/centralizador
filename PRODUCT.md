# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Funcionários de loja que fazem pedidos de compra/suprimentos andando pelo estoque físico, conferindo item a item em um tablet — em pé, geralmente com uma mão livre, em ambientes de estoque com iluminação nem sempre ideal. Também administradores (via `isAdmin`) que revisam, editam e consolidam pedidos de múltiplas lojas, tipicamente em desktop/escritório.

## Product Purpose

Centralizar pedidos de compra e suprimentos de múltiplas lojas em uma plataforma única, substituindo um processo manual anterior baseado em planilha Excel compartilhada (havia um `Centralizador.xlsm` no repositório). Permite que cada loja registre estoque atual e quantidade desejada por produto, e que a administração consolide, revise e acompanhe o status desses pedidos.

## Positioning

Um fluxo de pedido pensado para ser operado em campo — no corredor do estoque, tablet na mão, contando itens — em vez de um formulário de escritório adaptado para telas pequenas. A vantagem sobre a planilha que substitui é centralização multi-loja com histórico, permissões e consolidação administrativa, sem exigir digitação em teclado físico.

## Operating Context

- Contagem de estoque e montagem do pedido: em pé, andando pelo estoque físico da loja, tablet como dispositivo principal, possivelmente uma mão ocupada.
- Revisão e envio do pedido: pode ocorrer parado, mas ainda majoritariamente em tablet.
- Painel administrativo (consolidação, edição de pedidos, gestão de usuários/produtos): predominantemente desktop/escritório.
- Existe suporte offline (fila de sincronização em IndexedDB) — o app precisa continuar utilizável com conectividade instável, cenário comum em estoques.

## Capabilities and Constraints

- Stack: Next.js 16 (App Router) + React 19 + Tailwind CSS v4 no frontend; Fastify + Prisma no backend.
- Autenticação JWT via Bearer token; papéis: usuário de loja (`storeId`) e admin (`isAdmin`).
- Entidades centrais: Store, Category, Product, Order/OrderItem, além de módulos de Purchases, Sales, Movements e Stock Counts (S/C/R completo).
- Fila offline com sincronização em background (IndexedDB) já implementada — decisões visuais de estado (pendente/sincronizando/erro) precisam ser legíveis em campo.
- Uso majoritário é tablet; suporte a desktop (admin) é necessário mas secundário.

## Brand Commitments

Nenhuma. Identidade visual atual (dark mode com paleta azul/cyan) não é um compromisso de marca — liberdade total para propor nova direção visual desde que sirva melhor o uso em tablet/campo.

## Evidence on Hand

O `Centralizador.xlsm` que este sistema substitui foi removido do controle de versão; não há cópia disponível como referência de conteúdo/dados. Não fabricar dados de exemplo, depoimentos ou métricas — usar apenas o que está no schema Prisma e nos módulos existentes.

## Product Principles

1. Operável com uma mão, em pé, andando — alvos de toque generosos, sem depender de precisão fina ou de teclado.
2. Legível sob luz de estoque variável — contraste robusto, nunca dependente só de cor sutil.
3. Resiliente a conectividade ruim — estado de sincronização/offline sempre visível e não ambíguo.
4. Consolidação administrativa prioriza escaneabilidade e densidade de informação sobre expressão visual.
5. Sem fabricar dados: qualquer conteúdo de exemplo deve vir do schema real ou ser claramente placeholder.

## Accessibility & Inclusion

Nenhum requisito específico confirmado além do uso em campo (luz variável, uma mão livre) já registrado em Operating Context.
