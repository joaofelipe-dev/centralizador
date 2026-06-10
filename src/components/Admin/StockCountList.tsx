"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/Button"
import { Table } from "@/components/ui/Table"
import { Badge } from "@/components/ui/Badge"
import { Spinner } from "@/components/ui/Spinner"
import { stockCountApi } from "@/lib/stock-count-api"
import type { StockCount } from "@/types/stock-count"
import { Plus, Eye, Play } from "lucide-react"
import { toast } from "sonner"

interface StockCountListProps {
  onNewCount: () => void
  onViewCount: (count: StockCount) => void
}

export function StockCountList({ onNewCount, onViewCount }: StockCountListProps) {
  const [counts, setCounts] = useState<StockCount[]>([])
  const [loading, setLoading] = useState(true)

  const loadCounts = useCallback(async () => {
    setLoading(true)
    try {
      const response = await stockCountApi.listStockCounts()
      setCounts(response.data || [])
    } catch {
      toast.error("Erro ao carregar contagens")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCounts()
  }, [loadCounts])

  const getStatusBadge = (status: string) => {
    if (status === "OPEN") {
      return <Badge variant="soft" color="success">Aberta</Badge>
    }
    return <Badge variant="soft" color="primary">Fechada</Badge>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-foreground">Contagens de Estoque</h2>
        <Button onClick={onNewCount} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Contagem
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" color="primary" />
        </div>
      ) : (
        <Table variant="striped" hoverable>
          <thead>
            <tr>
              <th className="text-left text-foreground">Data</th>
              <th className="text-left text-foreground">Responsável</th>
              <th className="text-left text-foreground">Status</th>
              <th className="text-left text-foreground">Notas</th>
              <th className="text-right text-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {counts.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhuma contagem encontrada
                </td>
              </tr>
            ) : (
              counts.map((count) => (
                <tr key={count.id}>
                  <td className="text-foreground">
                    {new Date(count.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="text-foreground">{count.user?.name || "—"}</td>
                  <td>{getStatusBadge(count.status)}</td>
                  <td className="text-foreground truncate max-w-xs">{count.notes || "—"}</td>
                  <td className="text-right">
                    {count.status === "OPEN" ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewCount(count)}
                        className="gap-2 text-primary"
                      >
                        <Play className="h-4 w-4" />
                        Continuar
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewCount(count)}
                        className="gap-2 text-foreground"
                      >
                        <Eye className="h-4 w-4" />
                        Detalhes
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}
    </div>
  )
}
