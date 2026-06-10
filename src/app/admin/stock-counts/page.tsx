"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, PackageSearch } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { StockCountList } from "@/components/Admin/StockCountList"
import { StockCountForm } from "@/components/Admin/StockCountForm"
import { StockCountSession } from "@/components/Admin/StockCountSession"
import { StockCountDivergenceReport } from "@/components/Admin/StockCountDivergenceReport"
import type { StockCount } from "@/types/stock-count"
import { toast } from "sonner"
import { PageNav } from "@/components/PageNav"

type ViewState = "list" | "new" | "session" | "report"

export default function StockCountsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [view, setView] = useState<ViewState>("list")
  const [selectedCount, setSelectedCount] = useState<StockCount | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }
    if (user && user.role !== "ADMIN") {
      router.push("/")
    }
  }, [user, authLoading, router])

  const handleNewCount = () => setView("new")

  const handleViewCount = (count: StockCount) => {
    setSelectedCount(count)
    if (count.status === "OPEN") {
      setView("session")
    } else {
      setView("report")
    }
  }

  const handleCountCreated = (countId: string) => {
    setSelectedCount({ id: countId } as StockCount)
    setView("session")
    setRefreshKey((k) => k + 1)
  }

  const handleBackToList = () => {
    setSelectedCount(null)
    setView("list")
    setRefreshKey((k) => k + 1)
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Carregando contagens...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PageNav
        title="Contagem Física de Estoque"
        description="Inicie uma contagem e ajuste divergências"
        backHref="/admin"
        icon={<PackageSearch className="h-5 w-5 text-primary" />}
      />

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-6 space-y-6">
        {view === "list" && (
          <>
            <StockCountList
              key={refreshKey}
              onNewCount={handleNewCount}
              onViewCount={handleViewCount}
            />
          </>
        )}

        {view === "new" && (
          <div className="glass-card p-6 rounded-xl max-w-lg mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <PackageSearch className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Nova Contagem</h2>
            </div>
            <StockCountForm
              onSuccess={handleCountCreated}
              onCancel={handleBackToList}
            />
          </div>
        )}

        {view === "session" && selectedCount && (
          <StockCountSession
            countId={selectedCount.id}
            onBack={handleBackToList}
            onClose={handleBackToList}
          />
        )}

        {view === "report" && selectedCount && (
          <StockCountDivergenceReport
            countId={selectedCount.id}
            onBack={handleBackToList}
          />
        )}
      </main>
    </div>
  )
}
