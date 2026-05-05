"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Spinner } from "@/components/ui/Spinner"
import { Modal } from "@/components/ui/Modal"
import { Badge } from "@/components/ui/Badge"
import { stockCountApi } from "@/lib/stock-count-api"
import type { StockCount, StockCountItem } from "@/types/stock-count"
import { Save, Lock, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

interface StockCountSessionProps {
  countId: string
  onBack: () => void
  onClose: () => void
}

export function StockCountSession({ countId, onBack, onClose }: StockCountSessionProps) {
  const [count, setCount] = useState<StockCount | null>(null)
  const [items, setItems] = useState<(StockCountItem & { physicalInput: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)

  const loadCount = useCallback(async () => {
    setLoading(true)
    try {
      const data = await stockCountApi.getStockCount(countId)
      setCount(data)
      setItems(
        (data.items || []).map((item) => ({
          ...item,
          physicalInput: item.physicalQty?.toString() || "",
        }))
      )
    } catch {
      toast.error("Erro ao carregar contagem")
    } finally {
      setLoading(false)
    }
  }, [countId])

  useEffect(() => {
    loadCount()
  }, [loadCount])

  const handlePhysicalQtyChange = (index: number, value: string) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, physicalInput: value } : item
      )
    )
  }

  const getDivergence = (item: StockCountItem & { physicalInput: string }) => {
    const physical = parseFloat(item.physicalInput) || 0
    return physical - item.systemQty
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = items.map((item) => ({
        productId: item.productId,
        physicalQty: parseFloat(item.physicalInput) || 0,
      }))
      const updated = await stockCountApi.updateCountItems(countId, payload)
      setCount(updated)
      toast.success("Progresso salvo com sucesso!")
    } catch {
      toast.error("Erro ao salvar progresso")
    } finally {
      setSaving(false)
    }
  }

  const handleCloseCount = async () => {
    try {
      await stockCountApi.closeStockCount(countId)
      toast.success("Contagem fechada com sucesso!")
      setShowCloseModal(false)
      onClose()
    } catch {
      toast.error("Erro ao fechar contagem")
    }
  }

  const divergences = items.filter((item) => getDivergence(item) !== 0)
  const gainItems = divergences.filter((item) => getDivergence(item) > 0)
  const lossItems = divergences.filter((item) => getDivergence(item) < 0)
  const netGain = divergences.reduce((sum, item) => sum + getDivergence(item), 0)

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-white">
              Contagem de Estoque
            </h2>
            <p className="text-sm text-muted-foreground">
              {new Date(count.createdAt).toLocaleDateString('pt-BR')} — {count.user?.name}
            </p>
          </div>
        </div>
        <Badge variant="soft" color="success">Aberta</Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-white p-3">Produto</th>
              <th className="text-right text-white p-3">Qtd Sistema</th>
              <th className="text-right text-white p-3">Qtd Física</th>
              <th className="text-right text-white p-3">Divergência</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const divergence = getDivergence(item)
              return (
                <tr key={item.id} className="border-b border-white/5">
                  <td className="text-white p-3">{item.product?.name || item.productId}</td>
                  <td className="text-right text-white p-3">{item.systemQty}</td>
                  <td className="p-3">
                    <Input
                      type="number"
                      value={item.physicalInput}
                      onChange={(e) => handlePhysicalQtyChange(index, e.target.value)}
                      className="w-24 ml-auto"
                      size="sm"
                    />
                  </td>
                  <td className="text-right p-3">
                    <span className={
                      divergence > 0 ? "text-green-500" :
                      divergence < 0 ? "text-red-500" : "text-white"
                    }>
                      {divergence > 0 ? "+" : ""}{divergence}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-white/10">
        <div className="text-sm text-muted-foreground">
          {items.length} produtos • {divergences.length} com divergência
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Spinner size="sm" color="primary" /> : <Save className="h-4 w-4" />}
            Salvar Progresso
          </Button>
          <Button onClick={() => setShowCloseModal(true)} className="gap-2">
            <Lock className="h-4 w-4" />
            Fechar Contagem
          </Button>
        </div>
      </div>

      <Modal
        open={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        title="Fechar Contagem"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Confirme o fechamento da contagem. Esta ação não pode ser desfeita.
          </p>

          <div className="bg-white/5 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total de itens:</span>
              <span className="text-white">{items.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Itens com divergência:</span>
              <span className="text-white">{divergences.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ganhos:</span>
              <span className="text-green-500">{gainItems.length} itens</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Perdas:</span>
              <span className="text-red-500">{lossItems.length} itens</span>
            </div>
            <div className="flex justify-between text-sm font-medium pt-2 border-t border-white/10">
              <span className="text-white">Ganho líquido:</span>
              <span className={netGain >= 0 ? "text-green-500" : "text-red-500"}>
                {netGain >= 0 ? "+" : ""}{netGain}
              </span>
            </div>
          </div>

          {divergences.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {divergences.map((item) => {
                const d = getDivergence(item)
                return (
                  <div key={item.id} className="flex justify-between text-xs p-2 bg-white/5 rounded">
                    <span className="text-white truncate">{item.product?.name}</span>
                    <span className={d > 0 ? "text-green-500" : "text-red-500"}>
                      {d > 0 ? "+" : ""}{d}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowCloseModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCloseCount} className="gap-2">
              <Lock className="h-4 w-4" />
              Confirmar Fechamento
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
