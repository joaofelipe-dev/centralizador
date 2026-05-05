"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, ArrowLeft, PackageSearch } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { StockCountList } from "@/components/Admin/StockCountList"
import { StockCountForm } from "@/components/Admin/StockCountForm"
import { StockCountSession } from "@/components/Admin/StockCountSession"
import { StockCountDivergenceReport } from "@/components/Admin/StockCountDivergenceReport"
import type { StockCount } from "@/types/stock-count"
import { toast } from "sonner"

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
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#050505]">
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/admin")}
              variant="ghost"
              size="icon"
              className="rounded-full text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold tracking-tight text-white">
              Contagem Física de Estoque
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-6">
        {view === "list" && (
          <StockCountList
            key={refreshKey}
            onNewCount={handleNewCount}
            onViewCount={handleViewCount}
          />
        )}

        {view === "new" && (
          <div className="glass-card p-6 rounded-xl max-w-lg mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <PackageSearch className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-white">Nova Contagem</h2>
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
