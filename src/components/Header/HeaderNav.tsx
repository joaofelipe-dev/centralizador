import { Button } from "@/components/Button/Button";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Shield, Users, Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface HeaderNavProps {
  className?: string;
}

export const HeaderNav = ({ className }: HeaderNavProps) => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  return (
    <nav className={`flex justify-end items-center ${className ?? ""}`}>
      <div className="hidden md:flex justify-end gap-3 items-center">
        {user.role === "SUPERVISOR" || user.role === "ADMIN" ? (
          <Link href="/supervisor" className="flex items-center gap-2">
            <Button className="primary drop-shadow-[0_0_10px_rgba(50,50,255,1)] text-sm cursor-pointer">
              <Shield className="h-4 w-4" />
              Gestão de Pedidos
            </Button>
          </Link>
        ) : null}
        {user.role === "ADMIN" && (
          <Link href="/admin" className="flex items-center gap-2">
            <Button className="primary drop-shadow-[0_0_10px_rgba(50,50,255,1)] text-sm cursor-pointer">
              <Users className="h-4 w-4" />
              Painel Administrativo
            </Button>
          </Link>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="text-red-500 hover:bg-red-500/10"
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

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
              {user.role === "SUPERVISOR" || user.role === "ADMIN" ? (
                <Link
                  href="/supervisor"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Gestão de Pedidos</span>
                </Link>
              ) : null}
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    Painel Administrativo
                  </span>
                </Link>
              )}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Sair</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
