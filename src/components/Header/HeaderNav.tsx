"use client";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Shield, Users, Menu, X, PackageSearch, Truck, Settings, ShoppingCart } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface HeaderNavProps {
  className?: string;
  onRequestLogout?: () => void;
}

const menuItems = (userRole: string) => {
  const items = [];

  if (userRole === "SUPERVISOR" || userRole === "ADMIN") {
    items.push({
      href: "/supervisor",
      icon: Shield,
      label: "Gestão de Pedidos"
    });
  }

  if (userRole === "ADMIN") {
    items.push(
      { href: "/admin", icon: Users, label: "Painel Administrativo" },
      { href: "/admin/movements", icon: Settings, label: "Movimentações" },
      { href: "/admin/sales", icon: ShoppingCart, label: "Vendas" },
      { href: "/admin/stock-counts", icon: PackageSearch, label: "Contagem Física" },
      { href: "/admin/purchases", icon: Truck, label: "Compras" }
    );
  }

  return items;
};

export const HeaderNav = ({ className, onRequestLogout }: HeaderNavProps) => {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const items = menuItems(user.role);
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  return (
    <nav className={`flex items-center gap-2 ${className ?? ""}`}>
      <div className="relative">
        <Button
          size="icon"
          variant="ghost"
          className="text-foreground hover:bg-surface-hover"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {menuOpen && (
          <div className="absolute right-0 z-[110] top-full mt-2 w-56 rounded-xl bg-background/95 backdrop-blur-xl border border-border shadow-xl p-2">
            <div className="space-y-1">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-surface-hover transition-colors"
                  onClick={() => setMenuOpen(false)}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  <item.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}

              <Button
                variant="ghost"
                fullWidth
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                onClick={() => {
                  setMenuOpen(false);
                  onRequestLogout?.();
                }}
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Sair</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
