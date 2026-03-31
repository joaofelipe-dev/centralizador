import Image from "next/image"
import Link from "next/link"

export const HeaderLogo = () => {
    return (
        <div className="flex items-center gap-2">
            <Link href="/">
                <Image src="/logo.svg" width={0} height={0} sizes="100vw" alt="Logo" className="w-full max-w-40 md:max-w-60 h-auto drop-shadow-[0_2px_2px_rgba(255,50,50,1)] " />
            </Link>
        </div>
    )
}