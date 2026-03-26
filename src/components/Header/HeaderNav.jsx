import { Button } from "@/components/Button/Button";
import { Link } from "next/link";

export const HeaderNav = () => {
    return (
        <nav className="flex justify-between items-center">
          <Button>
            <a href="/admin">
                Painel
            </a>
          </Button>
        </nav>
    )
}