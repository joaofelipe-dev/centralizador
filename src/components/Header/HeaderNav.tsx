"use client";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, LogOut, Shield, Users, Settings, ShoppingCart, PackageSearch, Truck } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

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
  const router = useRouter();
  const pathname = usePathname();

  if (!user) return null;

  const items = menuItems(user.role);
  const isAdminHome = pathname === "/admin";

  return (
    <nav className={`flex items-center justify-end gap-2 ${className ?? ""}`}>
      {!isAdminHome && (
        <Button
          size="icon"
          variant="ghost"
          className="text-white hover:bg-white/10"
          onClick={() => router.push("/admin")}
          title="Voltar para o início"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}

      {items.map((item) => (
        <Button
          key={item.href}
          variant={pathname === item.href ? "default" : "ghost"}
          className={`gap-2 ${
            pathname === item.href 
              ? "bg-primary/20 text-primary" 
              : "text-white hover:bg-white/10"
          }`}
          onClick={() => router.push(item.href)}
        >
          <item.icon className="h-4 w-4" />
          <span className="hidden md:inline text-sm">{item.label}</span>
        </Button>
      ))}

      <Button
        size="icon"
        variant="ghost"
        className="text-red-500 hover:bg-red-500/10"
        onClick={logout}
        title="Sair"
      >
        <LogOut className="h-5 w-5" />
      </Button>
    </nav>
  );
};
