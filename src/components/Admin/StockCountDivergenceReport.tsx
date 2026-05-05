"use client"

import { useMemo } from "react"
import { Badge } from "@/components/ui/Badge"
import { Table } from "@/components/ui/Table"
import { stockCountApi } from "@/lib/stock-count-api"
import type { StockCount, StockCountItem } from "@/types/stock-count"
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/Button"
import { Spinner } from "@/components/ui/Spinner"
import { toast } from "sonner"

interface StockCountDivergenceReportProps {
  countId: string
  onBack: () => void
}

export function StockCountDivergenceReport({ countId, onBack }: StockCountDivergenceReportProps) {
  const [count, setCount] = useState<StockCount | null>(null)
  const [loading, setLoading] = useState(true)

  const loadCount = useCallback(async () => {
    setLoading(true)
    try {
      const data = await stockCountApi.getStockCount(countId)
      setCount(data)
    } catch {
      toast.error("Erro ao carregar relatório")
    } finally {
      setLoading(false)
    }
  }, [countId])

  useEffect(() => {
    loadCount()
  }, [loadCount])

  const { divergences, gains, losses, netGain, totalItems } = useMemo(() => {
    if (!count?.items) return { divergences: [], gains: [], losses: [], netGain: 0, totalItems: 0 }
    const divs = count.items.filter((item) => item.divergence !== 0)
    const gainItems = divs.filter((item) => item.divergence > 0)
    const lossItems = divs.filter((item) => item.divergence < 0)
    const net = divs.reduce((sum, item) => sum + item.divergence, 0)
    return {
      divergences: divs,
      gains: gainItems,
      losses: lossItems,
      netGain: net,
      totalItems: count.items.length,
    }
  }, [count])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" color="primary" />
      </div>
    )
  }

  if (!count) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold text-white">
            Relatório de Divergências
          </h2>
          <p className="text-sm text-muted-foreground">
            {new Date(count.createdAt).toLocaleDateString('pt-BR')} — {count.user?.name} — {count.status === "OPEN" ? "Aberta" : "Fechada"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Total de Itens</div>
          <div className="text-2xl font-bold text-white">{totalItems}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Itens com Divergência</div>
          <div className="text-2xl font-bold text-yellow-500">{divergences.length}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Ganho Líquido</div>
          <div className={`text-2xl font-bold ${netGain >= 0 ? "text-green-500" : "text-red-500"}`}>
            {netGain >= 0 ? "+" : ""}{netGain}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-white">Ganhos ({gains.length})</span>
          </div>
          <div className="text-2xl font-bold text-green-500">
            +{gains.reduce((sum, item) => sum + item.divergence, 0)}
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-white">Perdas ({losses.length})</span>
          </div>
          <div className="text-2xl font-bold text-red-500">
            {losses.reduce((sum, item) => sum + item.divergence, 0)}
          </div>
        </div>
      </div>

      {divergences.length > 0 ? (
        <Table variant="striped">
          <thead>
            <tr>
              <th className="text-left text-white">Produto</th>
              <th className="text-right text-white">Qtd Sistema</th>
              <th className="text-right text-white">Qtd Física</th>
              <th className="text-right text-white">Divergência</th>
              <th className="text-center text-white">Tipo</th>
            </tr>
          </thead>
          <tbody>
            {divergences.map((item) => (
              <tr key={item.id}>
                <td className="text-white">{item.product?.name || item.productId}</td>
                <td className="text-right text-white">{item.systemQty}</td>
                <td className="text-right text-white">{item.physicalQty}</td>
                <td className={`text-right ${item.divergence > 0 ? "text-green-500" : "text-red-500"}`}>
                  {item.divergence > 0 ? "+" : ""}{item.divergence}
                </td>
                <td className="text-center">
                  {item.divergence > 0 ? (
                    <Badge variant="soft" color="success">Ganho</Badge>
                  ) : (
                    <Badge variant="soft" color="danger">Perda</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma divergência encontrada. Todos os itens conferem!
        </div>
      )}
    </div>
  )
}
