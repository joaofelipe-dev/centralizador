import { Button } from "@/components/Button/Button";
import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";

export const HeaderNav = () => {
  const { user, logout } = useAuth();
  return (
    <nav className="flex justify-end gap-5 items-center">
      {user.isAdmin &&
        <Button className="primary drop-shadow-[0_0_10px_rgba(50,50,255,1)]">
          <a href="/admin">
            Painel Administrativo
          </a>
        </Button>
      }
      <Button size="icon" variant="ghost" className="">
        <LogOut onClick={() => logout()} />
      </Button>
    </nav>
  )
}