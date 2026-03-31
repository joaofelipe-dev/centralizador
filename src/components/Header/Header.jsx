import { HeaderLogo } from "./HeaderLogo";
import { HeaderNav } from "./HeaderNav";

export const Header = ({ children, className = "" }) => {
    return (
        <header
            role="banner"
            className={`flex sticky top-0 z-50 justify-between items-center p-5 md:px-8 bg-black/40 border-b border-white/20 text-center ${className}`}
        >
            {children ? (
                children
            ) : (
                <>
                    <div className="flex justify-between w-full">
                        <Header.Logo />
                        <Header.Nav />
                    </div>
                </>
            )}
        </header>
    )
}

Header.Logo = ({ children, className = "" }) => (
    <>
        {children ?? <HeaderLogo />}
    </>
)

Header.Nav = ({ children, className = "" }) => (
    <>
        {children ?? <HeaderNav />}
    </>
)

Header.Extras = ({ children, className = "" }) => (
    <div className={`ml-auto flex items-center gap-2 ${className}`}>{children}</div>
)
