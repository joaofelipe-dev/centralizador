import React, { memo } from "react";
import { Package, BarChart3, Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/Button/Button";
import * as XLSX from "xlsx";
import type { Product, Store } from "@/types/product";

interface MatrixCell {
  quantity: number;
  currentStock: number;
}

interface PivotMatrix {
  [productId: string]: {
    [storeId: string]: MatrixCell;
  };
}

interface ConsolidatedData {
  stores: (Store & { orderDate?: string; code?: string })[];
  products: (Product & { categoryName?: string; price?: number })[];
  matrix: PivotMatrix;
}

interface TableRowProps {
  product: Product & { categoryName?: string; price?: number };
  stores: (Store & { orderDate?: string; code?: string })[];
  matrix: PivotMatrix;
}

const TableRow = memo(({ product, stores, matrix }: TableRowProps) => (
  <tr className="group hover:bg-white/[0.03] transition-colors">
    <td className="px-6 py-4 border-r border-white/5">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
          <Package className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{product.name || 'Sem nome'}</p>
          <p className="text-[10px] text-muted-foreground font-mono opacity-50 uppercase">R$ {typeof product.price === 'number' ? product.price.toFixed(2) : '0,00'}</p>
        </div>
      </div>
    </td>
    {stores.map(store => {
      const cell = matrix?.[product.id]?.[store.id] || { quantity: 0, currentStock: 0 };
      return (
        <td key={store.id} className="px-4 py-4 text-center border-l border-white/5">
          <div className="flex flex-col items-center">
            <span className={`text-sm font-black ${cell.quantity > 0 ? 'text-primary' : 'text-white/20'}`}>
              {Number(cell.quantity) || 0}
            </span>
            <span className={`text-[10px] font-bold ${cell.currentStock > 0 ? 'text-green-500/60' : 'text-white/10'}`}>
              {Number(cell.currentStock) || 0}
            </span>
          </div>
        </td>
      );
    })}
  </tr>
));

TableRow.displayName = "TableRow";

interface PivotTableProps {
  consolidated: ConsolidatedData;
}

export function PivotTable({ consolidated }: PivotTableProps) {
  const { stores, products, matrix } = consolidated;

  const handleExportStoreXLSX = async () => {
    if (!consolidated.products.length || !consolidated.stores.length) return;

    const response = await fetch('/Default.xlsx');
    const arrayBuffer = await response.arrayBuffer();

    consolidated.stores.forEach((store) => {
      const wb = XLSX.read(arrayBuffer);
      const sheetName = wb.SheetNames[0];
      if (!sheetName) return;
      const ws = wb.Sheets[sheetName];
      if (!ws) return;
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as (string | number | undefined)[][];

      const storeDate = store.orderDate || new Date().toISOString().split('T')[0] || "";
      
      const dateParts = storeDate.split("-").map(Number);
      const year = dateParts[0] ?? 0;
      const month = dateParts[1] ?? 0;
      const day = dateParts[2] ?? 0;
      const formattedDate = `${day.toString().padStart(2,'0')}/${month.toString().padStart(2,'0')}/${year}`;
      
      const headerRow = data[0];
      if (headerRow) {
        headerRow[0] = formattedDate;
        headerRow[1] = store.name;
      }

      const productMap: Record<string, { quantity: number; currentStock: number; categoryName: string }> = {};
      consolidated.products.forEach((product) => {
        const cell = matrix?.[product.id]?.[store.id] || { quantity: 0, currentStock: 0 };
        productMap[product.name] = {
          quantity: cell.quantity || 0,
          currentStock: cell.currentStock || 0,
          categoryName: product.categoryName || "Outros",
        };
      });

      for (let i = 2; i < data.length; i++) {
        const row = data[i] as (string | number | undefined)[];
        if (!row) continue;

        const productName = String(row[7] || row[1] || "").trim();
        const productData = productMap[productName];

        if (productData) {
          const isLegumes = productData.categoryName === "Legumes";
          const isFrutas = productData.categoryName === "Frutas";
          const isVerduras = productData.categoryName === "Verduras";

          if (isLegumes) {
            row[0] = productData.quantity;
            row[2] = productData.currentStock;
          } else if (isFrutas) {
            row[3] = productData.quantity;
            row[5] = productData.currentStock;
          } else if (isVerduras) {
            row[6] = productData.quantity;
            row[8] = productData.currentStock;
          }
        }
      }

      const newWs = XLSX.utils.aoa_to_sheet(data as (string | number | boolean | null)[][]);
      const newWb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(newWb, newWs, "CEASA");

      const storeCode = store.code || store.name.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 2).toUpperCase();
      const dateStr = `${day}${month}${year}`;
      XLSX.writeFile(newWb, `${storeCode}_${dateStr}.xlsx`);
    });
  };

  const handleExport = () => {
    if (!consolidated.products.length) return;

    const csvHeaders = ['Produto'];
    consolidated.stores.forEach(s => {
      csvHeaders.push(`${s.name} - Pedido`);
      csvHeaders.push(`${s.name} - Estoque`);
    });

    const rows = consolidated.products.map(product => {
      const row: (string | number)[] = [product.name];
      consolidated.stores.forEach(store => {
        const cell = matrix?.[product.id]?.[store.id] || { quantity: 0, currentStock: 0 };
        row.push(cell.quantity);
        row.push(cell.currentStock);
      });
      return row.join(';');
    });

    const csvContent = "\uFEFF" + [csvHeaders.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `consolidado_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <BarChart3 className="text-primary" />
            Consolidado de Itens por Loja
          </h2>
          <p className="text-sm text-muted-foreground">Visão geral de pedidos (Qtd) e estoque informado (Est) em todas as filiais.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleExport} variant="outline" className="gap-2 border-white/10 text-white hover:bg-white/5">
            <Download className="h-4 w-4" /> Exportar
          </Button>
          <Button onClick={handleExportStoreXLSX} variant="default" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" /> Exportar por Loja
          </Button>
        </div>
      </div>

      <div className="glass-card overflow-hidden border-primary/20 bg-primary/[0.02]">
        <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
          <table className="w-full text-left border-collapse border-separate border-spacing-0">
            <thead className="sticky top-0 z-10 bg-[#0a0a0a] shadow-md shadow-black/50">
              <tr>
                <th className="px-6 py-5 min-w-[300px] border-b border-white/10 text-xs font-black uppercase text-muted-foreground bg-[#0a0a0a]">
                  Produto
                </th>
                {stores.map(store => (
                  <th key={store.id} className="px-4 py-5 min-w-[140px] text-center border-b border-white/10 border-l border-white/5 bg-[#0a0a0a]">
                    <p className="text-xs font-black text-white truncate max-w-[120px]">{store.name}</p>
                    <p className="text-[9px] text-muted-foreground font-medium opacity-50 uppercase tracking-tighter">Ped / Est</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map(product => (
                <TableRow
                  key={product.id}
                  product={product}
                  stores={stores}
                  matrix={matrix}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}