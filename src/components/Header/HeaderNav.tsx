"use client";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Shield, Users, Menu, X, PackageSearch, Truck, Settings, ShoppingCart } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface HeaderNavProps {
  className?: string;
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

export const HeaderNav = ({ className }: HeaderNavProps) => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const items = menuItems(user.role);
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isAdminHome = pathname === "/admin";

  return (
    <nav className={`flex items-center gap-2 ${className ?? ""}`}>
      {/* Desktop - direct links */}
      <div className="hidden md:flex items-center gap-2">
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={pathname === item.href ? "default" : "ghost"}
              size="sm"
              className={pathname === item.href ? "gap-2" : "gap-2 text-white hover:bg-white/10"}
            >
              <item.icon className="h-4 w-4" />
              <span className="text-sm">{item.label}</span>
            </Button>
          </Link>
        ))}
        <Button
          size="icon"
          variant="ghost"
          className="text-red-500 hover:bg-red-500/10"
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile - compact menu */}
      <div className="md:hidden relative">
        <Button
          size="icon"
          variant="ghost"
          className="text-white hover:bg-white/10"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-black/95 backdrop-blur-xl border border-white/10 shadow-xl z-50 p-2">
            <div className="space-y-1">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}

              <Button
                variant="ghost"
                fullWidth
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
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
