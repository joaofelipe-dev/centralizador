"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter, usePathname } from "next/navigation";
import { HeaderLogo } from "./HeaderLogo";
import { HeaderNav } from "./HeaderNav";

import { Navbar } from "@/components/Navbar";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (!user) return null;

  return (
    <Navbar position="top" sticky>
      <div className="flex items-center gap-4">
        <HeaderLogo />
      </div>

      <div className="flex items-center gap-2">
        <HeaderNav />
        <Button
          size="icon"
          variant="ghost"
          className="text-red-500 hover:bg-red-500/10"
          onClick={logout}
          title="Sair"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </Navbar>
  );
}
