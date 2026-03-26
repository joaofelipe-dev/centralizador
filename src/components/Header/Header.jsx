import { HeaderLogo } from "./HeaderLogo";
import { HeaderNav } from "./HeaderNav";

export const Header = () => {
    return (
        <header className="flex justify-between items-center py-6 px-5 md:px-8 border-t border-white/5 bg-background/50 text-center">
            <HeaderLogo />
            <HeaderNav />
        </header>
    )
}