import { HeaderLogo } from "./HeaderLogo";
import { HeaderNav } from "./HeaderNav";

interface HeaderLogoComponentProps {
  children?: React.ReactNode;
  className?: string;
}

interface HeaderNavComponentProps {
  children?: React.ReactNode;
  className?: string;
}

interface HeaderExtrasComponentProps {
  children: React.ReactNode;
  className?: string;
}

interface HeaderProps {
  className?: string;
  children?: React.ReactNode;
}

interface HeaderComponent extends React.FC<HeaderProps> {
    Logo: React.FC<HeaderLogoComponentProps>;
    Nav: React.FC<HeaderNavComponentProps>;
    Extras: React.FC<HeaderExtrasComponentProps>;
}

export const Header: HeaderComponent = ({ children, className = "" }: HeaderProps) => {
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

Header.Logo = ({ children, className = "" }: HeaderLogoComponentProps) => (
    <>
        {children ?? <HeaderLogo className={className} />}
    </>
)
Header.Logo.displayName = 'Header.Logo'

Header.Nav = ({ children, className = "" }: HeaderNavComponentProps) => (
    <>
        {children ?? <HeaderNav className={className} />}
    </>
)
Header.Nav.displayName = 'Header.Nav'

Header.Extras = ({ children, className = "" }: HeaderExtrasComponentProps) => (
    <div className={`ml-auto flex items-center gap-2 ${className}`}>{children}</div>
)
Header.Extras.displayName = 'Header.Extras'