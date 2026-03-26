import { ShoppingBag } from "lucide-react"

export const HeaderLogo = () => {
    return (
        <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/20">
                <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
                Centralizador <span className="text-primary">Pedidos</span>
            </span>
        </div>
    )
}