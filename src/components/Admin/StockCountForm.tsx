"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Spinner } from "@/components/ui/Spinner"
import { stockCountApi } from "@/lib/stock-count-api"
import { toast } from "sonner"

interface StockCountFormProps {
  onSuccess: (countId: string) => void
  onCancel: () => void
}

export function StockCountForm({ onSuccess, onCancel }: StockCountFormProps) {
  const [loading, setLoading] = useState(false)

  const handleStartCount = async () => {
    setLoading(true)
    try {
      const response = await stockCountApi.createStockCount()
      toast.success("Contagem iniciada com sucesso!")
      onSuccess(response.id)
    } catch {
      toast.error("Erro ao iniciar contagem")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Ao iniciar uma nova contagem, todos os produtos do CD serão listados com suas quantidades atuais do sistema.
      </p>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleStartCount} disabled={loading} className="gap-2">
          {loading ? <Spinner size="sm" color="white" /> : null}
          Iniciar Contagem
        </Button>
      </div>
    </div>
  )
}
