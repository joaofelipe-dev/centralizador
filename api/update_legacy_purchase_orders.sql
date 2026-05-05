-- Atualiza registros antigos de PurchaseOrder para type = 'PURCHASE'
UPDATE purchase_orders 
SET type = 'PURCHASE' 
WHERE type IS NULL OR type = '';
