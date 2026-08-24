"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Truck,
  Settings,
  Carrot,
  Apple,
  LeafyGreen,
} from "lucide-react";
import { Navbar } from "./Navbar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { usePedidosNav } from "@/context/PedidosNavContext";

function getDepartmentIcon(name: string) {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("legume")) return Carrot;
  if (lowerName.includes("fruta")) return Apple;
  if (lowerName.includes("tempero") || lowerName.includes("verdura")) return LeafyGreen;
  return Package;
}

export const MobileNavbar = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const { departments, activeDepartmentId, selectDepartment } = usePedidosNav();

  if (!user) return null;

  if (pathname === "/pedidos" && departments.length > 0) {
    return (
      <Navbar className="md:hidden">
        {departments.map((dept) => {
          const isActive = activeDepartmentId === dept.id;
          const Icon = getDepartmentIcon(dept.name);

          return (
            <button
              key={dept.id}
              type="button"
              onClick={() => selectDepartment(isActive ? null : dept.id)}
              className={cn(
                "flex min-w-[56px] flex-col items-center justify-center gap-1 py-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "true" : undefined}
            >
              <div className={cn(
                "flex h-9 w-9 items-center justify-center rounded-md transition-colors",
                isActive ? "bg-primary/10" : ""
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-semibold tracking-wide uppercase truncate max-w-[72px]">
                {dept.name}
              </span>
            </button>
          );
        })}
      </Navbar>
    );
  }

  const navItems = [
    {
      href: "/admin",
      icon: LayoutDashboard,
      label: "Home",
    },
    {
      href: "/admin/sales",
      icon: ShoppingCart,
      label: "Vendas",
    },
    {
      href: "/supervisor",
      icon: Package,
      label: "Pedidos",
    },
    {
      href: "/admin/purchases",
      icon: Truck,
      label: "Compras",
    },
    {
      href: "/admin/movements",
      icon: Settings,
      label: "Ajustes",
    },
  ];

  return (
    <Navbar className="md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-w-[56px] flex-col items-center justify-center gap-1 py-1 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <div className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md transition-colors",
              isActive ? "bg-primary/10" : ""
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-semibold tracking-wide uppercase">
              {item.label}
            </span>
          </Link>
        );
      })}
    </Navbar>
  );
};
