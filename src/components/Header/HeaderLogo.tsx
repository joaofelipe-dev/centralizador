import Image from "next/image"
import Link from "next/link"

interface HeaderLogoProps {
  className?: string;
}

export const HeaderLogo = ({ className }: HeaderLogoProps) => {
    return (
        <div className={`flex items-center gap-2 brightness-0 ${className ?? ''}`}>
            <Link href="/">
                <Image src="/logo.svg" width={0} height={0} sizes="100vw" alt="Logo" className="w-full max-w-40 md:max-w-60 h-auto" />
            </Link>
        </div>
    )
}