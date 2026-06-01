"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Truck,
  Settings
} from "lucide-react";
import { Navbar } from "./Navbar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export const MobileNavbar = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

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
              "flex flex-col items-center justify-center gap-1 transition-all duration-300",
              isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-white"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <div className={cn(
              "p-2 rounded-xl transition-all duration-300",
              isActive ? "bg-primary/10 shadow-[0_0_20px_rgba(var(--primary),0.2)]" : ""
            )}>
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-medium tracking-wide uppercase">
              {item.label}
            </span>
          </Link>
        );
      })}
    </Navbar>
  );
};
